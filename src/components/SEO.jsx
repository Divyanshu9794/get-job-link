import { useEffect } from "react";

/**
 * Lightweight, robust SEO component for React 19 SPAs.
 * Dynamically updates document title, meta tags, canonical URL, and JSON-LD schema.
 */
export default function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  noIndex = false,
  jsonLd = null,
}) {
  const fullTitle = title
    ? `${title} | GetJobLink`
    : "GetJobLink | Clean Daily Tech Jobs & Verified Career Portals";

  const defaultDescription =
    "Verified daily tech jobs across India and worldwide. 100% direct company application links with free ATS resume score evaluations and role-specific career guides.";

  const metaDesc = description || defaultDescription;
  const canonical = canonicalUrl
    ? `https://getjoblink.in${canonicalUrl}`
    : typeof window !== "undefined"
    ? `https://getjoblink.in${window.location.pathname}`
    : "https://getjoblink.in";

  useEffect(() => {
    // 1. Update document title
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attr, name, content) => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMetaTag("name", "description", metaDesc);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", metaDesc);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:url", canonical);
    setMetaTag("property", "og:site_name", "GetJobLink");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", metaDesc);

    // Robots meta tag
    if (noIndex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    } else {
      setMetaTag("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }

    // 3. Update or create canonical link tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", canonical);

    // 4. Inject JSON-LD Schema if provided
    let scriptElement = document.getElementById("page-json-ld");
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement("script");
        scriptElement.id = "page-json-ld";
        scriptElement.type = "application/ld+json";
        document.head.appendChild(scriptElement);
      }
      scriptElement.text = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Clean up script on unmount
      const existing = document.getElementById("page-json-ld");
      if (existing) existing.remove();
    };
  }, [fullTitle, metaDesc, canonical, ogType, noIndex, jsonLd]);

  return null;
}
