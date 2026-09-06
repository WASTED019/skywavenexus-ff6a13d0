import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves images for the /davis personal portfolio from a private bucket.
 * Read-only, no listing, path-restricted to a single flat file name.
 */
export const Route = createFileRoute("/api/public/davis-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as Record<string, string>)["_splat"] ?? "";
        if (!/^[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/.test(raw)) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("davis-media").download(raw);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
