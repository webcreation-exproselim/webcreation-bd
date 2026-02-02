import { useMemo } from "react";
import { useSiteContent } from "./useSiteContent";

interface ServicePageContentConfig {
  page: string;
  badgeText: string;
  heroTitleStart: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  features: { title: string; description: string }[];
  featuresTitle: string;
  featuresSubtitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
}

export function useServicePageContent(config: ServicePageContentConfig) {
  const fallbackContent = useMemo(() => {
    const content: Record<string, string> = {
      badge_text: config.badgeText,
      hero_title_start: config.heroTitleStart,
      hero_title_highlight: config.heroTitleHighlight,
      hero_subtitle: config.heroSubtitle,
      features_section_title: config.featuresTitle,
      features_section_subtitle: config.featuresSubtitle,
      pricing_section_title: config.pricingTitle,
      pricing_section_subtitle: config.pricingSubtitle,
    };

    // Add stats
    config.stats.forEach((stat, index) => {
      content[`stat_${index}_value`] = stat.value;
      content[`stat_${index}_label`] = stat.label;
    });

    // Add features
    config.features.forEach((feature, index) => {
      content[`feature_${index}_title`] = feature.title;
      content[`feature_${index}_description`] = feature.description;
    });

    return content;
  }, [config]);

  const { content, loading } = useSiteContent(config.page, "hero", fallbackContent);

  return { content, loading };
}
