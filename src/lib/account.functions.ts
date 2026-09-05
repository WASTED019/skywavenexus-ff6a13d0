import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Server-side sign-in and password-reset helpers.
 *
 * Security rationale: the username -> email lookup (`resolve_login_email`) and the
 * reset-approval check (`customer_can_reset`) used to be callable straight from the
 * browser with the anon key. That let anyone enumerate accounts and harvest real
 * email addresses. EXECUTE on those functions is now revoked for anon/authenticated
 * and they are only reachable through this server boundary, which never returns
 * another person's email to the client.
 */

function serverPublishableClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const identifierSchema = z.object({
  identifier: z.string().trim().min(2).max(255),
});

const signInSchema = identifierSchema.extend({
  password: z.string().min(6).max(128),
});

export const signInWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signInSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await adminClient();
    const { data: email } = await admin.rpc("resolve_login_email", {
      identifier: data.identifier,
    });

    // Generic failure message: never reveal whether the account exists.
    const failure = { ok: false as const, message: "Invalid username/email or password." };
    if (!email) return failure;

    const anon = serverPublishableClient();
    const { data: signIn, error } = await anon.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (error || !signIn.session) return failure;

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", signIn.session.user.id);

    const isStaff = (roles ?? []).some((r: { role: string }) =>
      ["admin", "super_admin", "staff", "viewer"].includes(r.role),
    );

    return {
      ok: true as const,
      isStaff,
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });

const resetSchema = identifierSchema.extend({
  redirectTo: z.string().url().max(500),
});

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => resetSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await adminClient();

    const { data: approved } = await admin.rpc("customer_can_reset", {
      _identifier: data.identifier,
    });

    if (approved) {
      const { data: email } = await admin.rpc("resolve_login_email", {
        identifier: data.identifier,
      });
      if (email) {
        const anon = serverPublishableClient();
        await anon.auth.resetPasswordForEmail(email, { redirectTo: data.redirectTo });
        return { sent: true as const };
      }
    }

    // Queue a request for Super Admin approval. Throttled inside the RPC.
    await admin.rpc("request_password_reset", { _identifier: data.identifier });
    return { sent: false as const };
  });
