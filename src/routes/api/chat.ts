import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, getLovableAiGatewayRunId } from "@/lib/ai-gateway.server";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/assistant-knowledge";

type ChatRequestBody = { messages?: unknown };

const clip = (value: string | null | undefined, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI assistant is not configured", { status: 500 });

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const saveLead = tool({
          description:
            "Save the visitor's enquiry so the SKYWAVE NEXUS team can follow up. Call once you have at least a name, phone number and a description of what they need.",
          inputSchema: z.object({
            name: z.string().nullable(),
            phone: z.string().nullable(),
            email: z.string().nullable(),
            division_of_interest: z.string().nullable(),
            description: z.string().nullable(),
            scale_context: z.string().nullable(),
            location: z.string().nullable(),
            timeline: z.string().nullable(),
          }),
          execute: async (input) => {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const { error } = await supabaseAdmin.from("chatbot_leads").insert({
                name: clip(input.name, 120),
                phone: clip(input.phone, 40),
                email: clip(input.email, 160),
                division_of_interest: clip(input.division_of_interest, 80),
                description: clip(input.description, 4000),
                scale_context: clip(input.scale_context, 2000),
                location: clip(input.location, 200),
                timeline: clip(input.timeline, 200),
              });
              if (error) {
                console.error("[chatbot_leads] insert failed", error);
                return { saved: false };
              }
              return { saved: true };
            } catch (error) {
              console.error("[chatbot_leads] insert threw", error);
              return { saved: false };
            }
          },
        });

        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: ASSISTANT_SYSTEM_PROMPT,
          messages: convertToModelMessages(messages as UIMessage[]),
          tools: { save_lead: saveLead },
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
