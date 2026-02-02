import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_value: string | null;
  content_type: string;
}

interface ContentMap {
  [key: string]: string;
}

export function useSiteContent(page: string, section: string, fallbackContent: ContentMap) {
  const [content, setContent] = useState<ContentMap>(fallbackContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .eq("section", section);

      if (error) {
        console.error("Content fetch error:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const contentMap: ContentMap = { ...fallbackContent };
        data.forEach((item: ContentItem) => {
          if (item.content_value) {
            contentMap[item.content_key] = item.content_value;
          }
        });
        setContent(contentMap);
      }
    } catch (err) {
      console.error("Content fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, section, fallbackContent]);

  useEffect(() => {
    fetchContent();

    // Set up realtime subscription
    const channel = supabase
      .channel(`site-content-${page}-${section}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "site_content",
          filter: `page=eq.${page}`
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, section, fetchContent]);

  return { content, loading, refetch: fetchContent };
}

// Hook to get all content for a page (used in admin)
export function usePageContent(page: string) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .order("section", { ascending: true });

      if (error) {
        console.error("Page content fetch error:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setContent(data);
      }
    } catch (err) {
      console.error("Page content fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, refetch: fetchContent };
}

// Hook to manage all site content (admin only)
export function useAllSiteContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("page", { ascending: true })
        .order("section", { ascending: true })
        .order("content_key", { ascending: true });

      if (error) {
        console.error("All content fetch error:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setContent(data);
      }
    } catch (err) {
      console.error("All content fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  const upsertContent = async (
    page: string,
    section: string,
    contentKey: string,
    contentValue: string,
    contentType: string = "text"
  ) => {
    const { error } = await supabase
      .from("site_content")
      .upsert(
        {
          page,
          section,
          content_key: contentKey,
          content_value: contentValue,
          content_type: contentType,
        },
        { onConflict: "page,section,content_key" }
      );

    if (!error) {
      fetchAllContent();
    }
    return { error };
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase
      .from("site_content")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchAllContent();
    }
    return { error };
  };

  return { content, loading, refetch: fetchAllContent, upsertContent, deleteContent };
}
