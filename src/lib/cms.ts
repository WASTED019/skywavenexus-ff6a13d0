import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { hasMin } from "@/lib/permissions";

export type SiteSettings = {
  id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  location: string | null;
  logo_url: string | null;
  social_links: Record<string, string>;
  footer_text: string | null;
  footer_links: Array<{ label: string; href: string }>;
};

export type HomepageContent = {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_body: string | null;
  button_text: string | null;
  button_link: string | null;
  sections: Record<string, unknown>;
};

export type HomepageSlide = {
  id: string;
  image_url: string | null;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  display_order: number;
  is_active: boolean;
};

export type ServiceLine = {
  slug: string;
  title: string;
  short_desc: string | null;
  full_desc: string | null;
  services: Array<{ id?: string; name: string; explanation?: string; audience?: string; outcome?: string }>;
  button_link: string | null;
  image_url: string | null;
  display_order: number;
};

export type ShowcaseItem = {
  id: string;
  title: string;
  division_id: string;
  division_name: string;
  description: string | null;
  location: string | null;
  outcome: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  display_order: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "global",
  phone: "0753366995",
  whatsapp: "0753366995",
  email: "skywavenexus@gmail.com",
  location: "Nyange, Nyeri, Kenya",
  logo_url: null,
  social_links: {},
  footer_text: "Integrated Solutions for Food Safety, Value Addition and Digital Connectivity.",
  footer_links: [],
};

export function useSiteSettings(): SiteSettings {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    let alive = true;
    supabase.from("site_settings").select("*").eq("id", "global").maybeSingle()
      .then(({ data }) => {
        if (!alive || !data) return;
        const d = data as unknown as Partial<SiteSettings>;
        setS({
          ...DEFAULT_SETTINGS,
          ...d,
          social_links: (d.social_links as Record<string, string>) ?? {},
          footer_links: (d.footer_links as SiteSettings["footer_links"]) ?? [],
        });
      });
    return () => { alive = false; };
  }, []);
  return s;
}

export function useHomepageContent(): HomepageContent | null {
  const [c, setC] = useState<HomepageContent | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.from("homepage_content").select("*").eq("id", "hero").maybeSingle()
      .then(({ data }) => { if (alive) setC((data as HomepageContent) ?? null); });
    return () => { alive = false; };
  }, []);
  return c;
}

export function useHomepageSlides(): HomepageSlide[] {
  const [list, setList] = useState<HomepageSlide[]>([]);
  useEffect(() => {
    let alive = true;
    supabase.from("homepage_slides").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (alive) setList((data as HomepageSlide[]) ?? []); });
    return () => { alive = false; };
  }, []);
  return list;
}

export function useServiceLines(): ServiceLine[] {
  const [list, setList] = useState<ServiceLine[]>([]);
  useEffect(() => {
    let alive = true;
    supabase.from("service_lines").select("*").order("display_order")
      .then(({ data }) => { if (alive) setList(((data ?? []) as unknown) as ServiceLine[]); });
    return () => { alive = false; };
  }, []);
  return list;
}

export function useServiceLine(slug: string): ServiceLine | null {
  const [row, setRow] = useState<ServiceLine | null>(null);
  useEffect(() => {
    let alive = true;
    setRow(null);
    supabase.from("service_lines").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { if (alive) setRow(((data ?? null) as unknown) as ServiceLine | null); });
    return () => { alive = false; };
  }, [slug]);
  return row;
}

/**
 * Preview mode: `?preview=1` in the URL AND a signed-in staff (or higher) user.
 * Public visitors never see drafts even with the param — unpublished rows are
 * only readable by staff under RLS.
 */
export function usePreviewMode(): boolean {
  const [flag, setFlag] = useState(false);
  const { role, loading } = useAuth();
  useEffect(() => {
    if (typeof window === "undefined") return;
    setFlag(new URLSearchParams(window.location.search).get("preview") === "1");
  }, []);
  return flag && !loading && hasMin(role, "staff");
}

export function useShowcaseItems(preview = false): ShowcaseItem[] {
  const [list, setList] = useState<ShowcaseItem[]>([]);
  useEffect(() => {
    let alive = true;
    let q = supabase.from("showcase_items").select("*");
    if (!preview) q = q.eq("is_active", true);
    q.order("display_order")
      .then(({ data }) => { if (alive) setList((data as ShowcaseItem[]) ?? []); });
    return () => { alive = false; };
  }, [preview]);
  return list;
}

export function useBlogPosts(preview = false): BlogPost[] {
  const [list, setList] = useState<BlogPost[]>([]);
  useEffect(() => {
    let alive = true;
    let q = supabase.from("blog_posts").select("*");
    if (!preview) q = q.eq("is_published", true);
    q.order("published_at", { ascending: false })
      .then(({ data }) => { if (alive) setList((data as BlogPost[]) ?? []); });
    return () => { alive = false; };
  }, [preview]);
  return list;
}
