import { Input } from "@/components/ui/input";
import { SOCIAL_PLATFORMS, type SocialAccount } from "@/lib/social-accounts";

export function SocialAccountsEditor({ accounts, onChange }: { accounts: SocialAccount[]; onChange: (accounts: SocialAccount[]) => void }) {
  return <div className="social-editor">
    {SOCIAL_PLATFORMS.map(({ key, label }) => {
      const account = accounts.find((a) => a.platform === key) ?? { platform: key, handle: "", url: "" };
      const update = (change: Partial<SocialAccount>) => onChange(SOCIAL_PLATFORMS.map((p) => p.key === key ? { ...account, ...change } : accounts.find((a) => a.platform === p.key) ?? { platform: p.key, handle: "", url: "" }));
      return <div className="social-editor-row" key={key}>
        <label><span>{label} handle</span><Input value={account.handle} maxLength={100} onChange={(e) => update({ handle: e.target.value })} /></label>
        <label><span>{label} URL (optional)</span><Input value={account.url} maxLength={500} placeholder="https://" onChange={(e) => update({ url: e.target.value })} /></label>
      </div>;
    })}
  </div>;
}