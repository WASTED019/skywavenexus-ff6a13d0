import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { SOCIAL_PLATFORMS, safeSocialUrl, type SocialAccount } from "@/lib/social-accounts";

function PlatformLogo({ platform }: { platform: string }) {
  const Icon = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube }[platform];
  if (Icon) return <Icon size={15} aria-hidden="true" />;
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {platform === "x" ? <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.2-8.3L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.4 4H4.6l13.2 16Z" /> : <path d="M20.5 3.5A11.8 11.8 0 0 0 1.8 17.8L.2 23.8l6.1-1.6A11.8 11.8 0 0 0 20.5 3.5ZM12 21.2a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.6.9 1-3.5-.3-.4a9.8 9.8 0 1 1 8.3 4.6Zm5.4-7.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a8 8 0 0 1-3.9-3.4c-.3-.4.3-.5.8-1.4.1-.2.1-.4 0-.6L9.3 7c-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.9-.5Z" />}
  </svg>;
}

export function SocialAccounts({ accounts, className = "" }: { accounts: SocialAccount[]; className?: string }) {
  const visible = accounts.filter((a) => a.handle.trim() && SOCIAL_PLATFORMS.some((p) => p.key === a.platform));
  if (!visible.length) return null;
  return <div className={`social-accounts ${className}`} aria-label="Social accounts">
    {visible.map((account) => {
      const label = SOCIAL_PLATFORMS.find((p) => p.key === account.platform)?.label;
      const content = <><PlatformLogo platform={account.platform} /><span>{account.handle}</span></>;
      const url = safeSocialUrl(account.url);
      return url ? <a key={account.platform} className="social-account" href={url} target="_blank" rel="noopener noreferrer" title={`${label}: ${account.handle}`} aria-label={`${label}: ${account.handle}`}>{content}</a>
        : <span key={account.platform} className="social-account" title={`${label}: ${account.handle}`}>{content}</span>;
    })}
  </div>;
}