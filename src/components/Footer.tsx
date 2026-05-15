import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import { hasMin } from "@/lib/permissions";
import { useSiteSettings } from "@/lib/cms";

export function Footer() {
  const { session, role } = useAuth();
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const dashboardTo = hasMin(role, "viewer") ? "/admin" : "/dashboard";
  const logoSrc = settings.logo_url || logo;

  return (
    <footer className="mt-20 border-t bg-brand-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="SKYWAVE NEXUS logo" className="h-12 w-12 rounded bg-white p-1 object-contain" />
            <div>
              <div className="text-base font-bold">SKYWAVE NEXUS</div>
              <div className="text-xs uppercase tracking-wider opacity-80">Integrated Solutions</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            {settings.footer_text}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-90">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            {settings.phone && <li className="flex items-center gap-2"><Phone className="size-4" /> {settings.phone}</li>}
            {settings.whatsapp && <li className="flex items-center gap-2"><MessageCircle className="size-4" /> WhatsApp: {settings.whatsapp}</li>}
            {settings.email && <li className="flex items-center gap-2"><Mail className="size-4" /> {settings.email}</li>}
            {settings.location && <li className="flex items-center gap-2"><MapPin className="size-4" /> {settings.location}</li>}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-90">Quick Links</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/divisions" className="hover:underline">Service Lines</Link></li>
            <li><Link to="/request" className="hover:underline">Request Service</Link></li>
            <li><Link to="/skywave-nexus" className="hover:underline">SKYWAVE NEXUS</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog / Updates</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/track" className="hover:underline">Track Request</Link></li>
            {session ? (
              <>
                <li><Link to={dashboardTo} className="hover:underline">Dashboard</Link></li>
                <li><button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="hover:underline">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/sign-in" className="hover:underline">Sign In</Link></li>
                <li><Link to="/sign-up" className="hover:underline">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-90">Get a Quotation</h2>
          <p className="mt-3 text-sm opacity-90">Tell us what you need and our team will follow up.</p>
          <Link to="/request" className="mt-4 inline-flex rounded-md bg-brand-bright px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
            Request a Service
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-80">
        © 2026 SKYWAVE NEXUS Integrated Solutions. All rights reserved.
      </div>
    </footer>
  );
}
