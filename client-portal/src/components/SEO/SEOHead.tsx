import { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots?: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_IMAGE = 'https://app.originyx.in/client-hero.png';
const SITE_NAME = 'Originyx Client Portal';

/**
 * SEOHead: Lightweight client-side document head management.
 * Dynamically updates title, meta description, robots, canonical links,
 * Open Graph, Twitter cards, and structured JSON-LD schemas.
 */
export default function SEOHead({
  title,
  description,
  canonicalUrl = 'https://app.originyx.in/',
  robots = 'index, follow',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title.includes('Originyx') ? title : `${title} | Originyx Client Portal`;
    document.title = fullTitle;

    // Helper to get or create a meta tag by name or property
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data
    const scriptId = 'originyx-seo-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      const schemaData = Array.isArray(jsonLd)
        ? { '@context': 'https://schema.org', '@graph': jsonLd }
        : jsonLd['@context']
        ? jsonLd
        : { '@context': 'https://schema.org', ...jsonLd };
      script.text = JSON.stringify(schemaData);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonicalUrl, robots, ogType, ogImage, jsonLd]);

  return null;
}
