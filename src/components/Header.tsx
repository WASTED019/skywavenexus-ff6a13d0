import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Menu, X } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";

const publicNav = [
  { to: "/", label: "Home" },
  { to: "/divisions", label: "Service Lines" },
  { to: "/request", label: "Request Service" },
  { to: "/skywave-nexus", label: "SKYWAVE NEXUS" },
  { to: "/blog", label: "Blog / Updates" },
  { to: "/contact", label: "Contact" },
  { to: "/track", label: "Track Request" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, role } = useAuth();
  const navigate = useNavigate();
  const dashboardTo = role === "admin" ? "/admin" : "/dashboard";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const linkClass = "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground";
  const activeClass = { className: "rounded-md px-3 py-2 text-sm font-semibold text-brand-blue bg-accent" };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="SKYWAVE NEXUS Integrated Solutions logo" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <div className="text-sm font-bold text-brand-navy sm:text-base">SKYWAVE NEXUS</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-brand-blue sm:text-xs">
              Integrated Solutions
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNav.map((n) => (
            <Link key={n.to} to={n.to} className={linkClass} activeProps={activeClass}>{n.label}</Link>
          ))}
          {session ? (
            <>
              <Link to={dashboardTo} className="ml-1 rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:opacity-95">Dashboard</Link>
              <button onClick={handleLogout} className="rounded-md border px-3 py-2 text-sm font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className={linkClass} activeProps={activeClass}>Sign In</Link>
              <Link to="/sign-up" className="ml-1 rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:opacity-95">Sign Up</Link>
            </>
          )}
        </nav>

        <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="rounded-md p-2 lg:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {publicNav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium hover:bg-accent" activeProps={{ className: "rounded-md px-3 py-3 text-sm font-semibold text-brand-blue bg-accent" }}>{n.label}</Link>
            ))}
            {session ? (
              <>
                <Link to={dashboardTo} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-brand-blue">Dashboard</Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="rounded-md px-3 py-3 text-left text-sm font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/sign-in" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium">Sign In</Link>
                <Link to="/sign-up" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-brand-blue">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
