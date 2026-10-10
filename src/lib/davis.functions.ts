import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";
import { dispatchSchema, normalizePortfolio, type PortfolioDoc } from "./davis-content";
import { socialAccountSchema } from "./social-accounts";
export type { PortfolioDoc } from "./davis-content";

/**
 * Personal portfolio (/davis) content layer.
 *
 * Fully isolated from SKYWAVE NEXUS:
 *  - its own table (public.davis_portfolio) with NO anon/authenticated grants,
 *    so no browser client and no SKYWAVE staff/admin login can read or write it;
 *  - its own password gate stored in an encrypted cookie session, unrelated to
 *    Supabase Auth, so the SKYWAVE admin login grants nothing here and this
 *    gate grants nothing on SKYWAVE's tables.
 */

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["DAVIS_SESSION_SECRET"]!,
    name: "davis-gate",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

// Only this one personal account may unlock the editor via account sign-in.
// SKYWAVE roles (admin/super_admin) grant nothing here.
const OWNER_EMAIL = "daviwaithaks22@gmail.com";

async function ownerSignedIn(): Promise<boolean> {
  try {
    const auth = getRequest()?.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return false;
    const token = auth.slice(7);
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!token || !url || !key) return false;
    const client = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    const user = data?.user;
    if (error || !user?.email || !user.email_confirmed_at) return false;
    return user.email.toLowerCase() === OWNER_EMAIL;
  } catch {
    return false;
  }
}

async function unlockMethod(): Promise<"password" | "account" | null> {
  const session = await useSession<GateSession>(sessionConfig());
  if (session.data.unlocked === true) return "password";
  if (await ownerSignedIn()) return "account";
  return null;
}

async function isUnlocked(): Promise<boolean> {
  return (await unlockMethod()) !== null;
}

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function readRow() {
  const supabase = await db();
  const { data, error } = await (supabase as any)
    .from("davis_portfolio")
    .select("draft, published, published_at, updated_at")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as {
    draft: PortfolioDoc;
    published: PortfolioDoc;
    published_at: string | null;
    updated_at: string;
  } | null;
}

/** Public page content. Draft is returned only to an unlocked editor session. */
export const getDavisPage = createServerFn({ method: "GET" })
  .inputValidator((data: { draft?: boolean }) => ({ draft: data?.draft === true }))
  .handler(async ({ data }) => {
    const row = await readRow();
    if (!row) return { doc: null as PortfolioDoc | null, isDraft: false };
    if (data.draft && (await isUnlocked())) return { doc: normalizePortfolio(row.draft), isDraft: true };
    return { doc: normalizePortfolio(row.published), isDraft: false };
  });

export const davisStatus = createServerFn({ method: "GET" }).handler(async () => ({
  unlocked: await isUnlocked(),
}));

export const davisLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({ password: String(data?.password ?? "") }))
  .handler(async ({ data }) => {
    const expected = process.env["DAVIS_ADMIN_PASSWORD"];
    if (!expected) throw new Error("Editor password is not configured");
    if (!data.password || !matches(data.password, expected)) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const davisLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const getDavisEditorState = createServerFn({ method: "GET" }).handler(async () => {
  const method = await unlockMethod();
  if (!method) return { unlocked: false as const, method: null, draft: null, published: null };
  const row = await readRow();
  return {
    unlocked: true as const,
    method,
    draft: row?.draft ? normalizePortfolio(row.draft) : null,
    published: row?.published ? normalizePortfolio(row.published) : null,
    published_at: row?.published_at ?? null,
  };
});

function sanitize(doc: PortfolioDoc): PortfolioDoc {
  const s = (v: unknown, max = 4000) => String(v ?? "").slice(0, max);
  const normalized = normalizePortfolio(doc);
  return {
    preferred_name: s(normalized.preferred_name, 120).trim(),
    social_accounts: socialAccountSchema.array().max(6).parse(normalized.social_accounts),
    hero_name: s(normalized.hero_name, 120),
    hero_line: s(normalized.hero_line, 600),
    hero_image: s(normalized.hero_image, 500),
    authority: s(normalized.authority, 200),
    about: s(normalized.about, 2000),
    metrics: normalized.metrics.slice(0, 8).map((m) => ({ label: s(m?.label, 80), value: s(m?.value, 100) })),
    pillars: normalized.pillars.slice(0, 6).map((p) => ({ title: s(p?.title, 120), description: s(p?.description, 500), specialties: s(p?.specialties, 300) })),
    work: normalized.work.slice(0, 8).map((w) => ({
      title: s(w?.title, 120),
      role: s(w?.role, 80),
      body: s(w?.body, 1200),
      note: s(w?.note, 200),
      problem: s(w?.problem, 700),
      solution: s(w?.solution, 700),
      image: s(w?.image, 500),
      verification_url: s(w?.verification_url, 500),
    })),
    background: normalized.background.slice(0, 12).map((b) => ({
      label: s(b?.label, 120),
      body: s(b?.body, 800),
    })),
    gallery: dispatchSchema.array().max(40).parse(normalized.gallery).map((g) => ({
      url: g.url,
      location: g.location,
      title: g.title,
      story: g.story,
      takeaway: g.takeaway,
    })),
    consultation_heading: s(normalized.consultation_heading, 160),
    consultation_note: s(normalized.consultation_note, 500),
    consultation_options: normalized.consultation_options.slice(0, 8).map((v) => s(v, 100)),
    contact_phone: s(normalized.contact_phone, 40),
    contact_email: s(normalized.contact_email, 120),
    contact_note: s(normalized.contact_note, 400),
  };
}

export const saveDavisDraft = createServerFn({ method: "POST" })
  .inputValidator((data: { doc: PortfolioDoc }) => data)
  .handler(async ({ data }) => {
    if (!(await isUnlocked())) throw new Error("Not signed in");
    const supabase = await db();
    const { error } = await (supabase as any)
      .from("davis_portfolio")
      .update({ draft: sanitize(data.doc) })
      .eq("id", "main");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const publishDavisDraft = createServerFn({ method: "POST" }).handler(async () => {
  if (!(await isUnlocked())) throw new Error("Not signed in");
  const row = await readRow();
  if (!row) throw new Error("Nothing to publish");
  const supabase = await db();
  const { error } = await (supabase as any)
    .from("davis_portfolio")
    .update({ published: row.draft, published_at: new Date().toISOString() })
    .eq("id", "main");
  if (error) throw new Error(error.message);
  return { ok: true as const };
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadDavisImage = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; mime: string; base64: string }) => data)
  .handler(async ({ data }) => {
    if (!(await isUnlocked())) throw new Error("Not signed in");
    if (!ALLOWED.has(data.mime)) throw new Error("Only JPG, PNG or WebP images are allowed");
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.length > 10 * 1024 * 1024) throw new Error("Image must be under 10MB");
    const ext = data.mime === "image/png" ? "png" : data.mime === "image/webp" ? "webp" : "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const supabase = await db();
    const { error } = await supabase.storage
      .from("davis-media")
      .upload(path, bytes, { contentType: data.mime, upsert: false });
    if (error) throw new Error(error.message);
    return { url: `/api/public/davis-media/${path}` };
  });
