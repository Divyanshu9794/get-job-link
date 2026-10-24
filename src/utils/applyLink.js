/**
 * Append a tracking parameter to an external apply URL so clicks can be
 * attributed back to GetJobLink. Handles URLs that already carry query
 * strings (using `&`) and URLs that don't (using `?`). A missing/blank URL
 * is returned unchanged so callers can still detect and warn on it.
 */
export function withSource(url, source = "getjoblink") {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return url;

  // Strip any existing source/referral param so we don't stack duplicates,
  // then tidy up any trailing separator left behind.
  const cleaned = trimmed
    .replace(/[?&](source|ref|utm_source|utm_medium|utm_campaign)=[^&]*/g, "")
    .replace(/[?&]+$/, "");
  const sep = cleaned.includes("?") ? "&" : "?";
  return `${cleaned}${sep}${source}=getjoblink`;
}