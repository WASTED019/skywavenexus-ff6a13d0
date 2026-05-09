import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { login } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Login — SKYWAVE NEXUS" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo credentials — replace with Lovable Cloud / Supabase Auth in production.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const ok = login(String(fd.get("user") || ""), String(fd.get("pass") || ""));
            if (ok) navigate({ to: "/admin" });
            else setError("Invalid username or password.");
          }}
          className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Username</span>
            <input name="user" className="w-full rounded-md border px-3 py-2 text-sm" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Password</span>
            <input name="pass" type="password" className="w-full rounded-md border px-3 py-2 text-sm" required />
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button className="w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Sign in</button>
          <p className="text-xs text-muted-foreground">Demo: admin / ChangeMe@123</p>
        </form>
      </section>
      <Footer />
    </div>
  );
}
