import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { contentDefaults } from "@/lib/siteContent";

type ContentMap = Record<string, Record<string, string>>;

interface SiteContentCtx {
  content: ContentMap;
  loading: boolean;
  get: (sectionKey: string, fieldKey: string) => string;
  refresh: () => Promise<void>;
}

const Ctx = createContext<SiteContentCtx | undefined>(undefined);

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentMap>(contentDefaults);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("site_content" as any).select("content_key,value");
    const merged: ContentMap = JSON.parse(JSON.stringify(contentDefaults));
    (data as any[] | null)?.forEach((row) => {
      merged[row.content_key] = { ...(merged[row.content_key] || {}), ...(row.value || {}) };
    });
    setContent(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("site_content_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const get = (sectionKey: string, fieldKey: string) =>
    content[sectionKey]?.[fieldKey] ?? contentDefaults[sectionKey]?.[fieldKey] ?? "";

  return <Ctx.Provider value={{ content, loading, get, refresh }}>{children}</Ctx.Provider>;
};

export const useSiteContent = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
};
