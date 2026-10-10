import { z } from "zod";

export const SOCIAL_PLATFORMS = [
  { key: "whatsapp", label: "WhatsApp" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X / Twitter" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
] as const;
export type SocialAccount = { platform: string; handle: string; url: string };
export function safeSocialUrl(value: string): string {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.href : ""; }
  catch { return ""; }
}
export const socialAccountSchema = z.object({
  platform: z.enum(["whatsapp", "linkedin", "x", "facebook", "instagram", "youtube"]),
  handle: z.string().trim().max(100),
  url: z.string().trim().max(500).refine((v) => !v || !!safeSocialUrl(v), "Use a full HTTPS or HTTP social URL"),
});
export function readSocialSettings(links: Record<string, string>): SocialAccount[] {
  return SOCIAL_PLATFORMS.map(({ key }) => ({
    platform: key,
    handle: links[`${key}_handle`] ?? (key === "x" ? links.twitter_handle : "") ?? "",
    url: links[key] ?? (key === "x" ? links.twitter : "") ?? "",
  }));
}
export function writeSocialSettings(links: Record<string, string>, accounts: SocialAccount[]): Record<string, string> {
  const result = { ...links };
  delete result.twitter; delete result.twitter_handle;
  for (const account of socialAccountSchema.array().max(6).parse(accounts)) {
    result[account.platform] = account.url;
    result[`${account.platform}_handle`] = account.handle;
  }
  return result;
}