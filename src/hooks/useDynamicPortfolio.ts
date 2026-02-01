import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  live_url?: string | null;
}

export function useDynamicPortfolio(category: string, fallbackItems: PortfolioItem[]) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(fallbackItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("category", category)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Portfolio fetch error:", error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setPortfolioItems(data);
        }
        // If no data, keep fallback items
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();

    // Set up realtime subscription
    const channel = supabase
      .channel(`portfolio-${category}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolio_items" },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return { portfolioItems, loading };
}
