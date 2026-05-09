import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/divisions", label: "Divisions" },
  { to: "/request", label: "Request Service" },
  { to: "/skywave-nexus", label: "SKYWAVE NEXUS" },
  { to: "/blog", label: "Blog / Updates" },
  { to: "/contact", label: "Contact" },
  { to: "/admin-login", label: "Admin Login" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
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
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-brand-blue bg-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium hover:bg-accent"
                activeProps={{ className: "rounded-md px-3 py-3 text-sm font-semibold text-brand-blue bg-accent" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
