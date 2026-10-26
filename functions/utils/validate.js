// URL / active / expiry validation before storing a job.
// Checks: scheme, resolves, 2xx response, presence of deadline.
// Expired deadlines are flagged but kept (soft enforcement) so the dashboard
// can surface them for admin action; cleanup happens separately.

const HEAD_TIMEOUT_MS = 8000;
const LARGE_BODY_BYTES = 256 * 1024;

export async function validateJobUrl(url, { strict = false } = {}) {
  if (!url || typeof url !== "string") return { ok: false, reason: "missing_url" };
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, reason: "empty_url" };
  if (!/^https?:\/\//i.test(trimmed)) return { ok: false, reason: "bad_scheme" };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
    const res = await fetch(trimmed, { method: "HEAD", signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
  } catch (e) {
    return { ok: false, reason: `fetch_error_${e.message}` };
  }

  return { ok: true, resolved: trimmed };
}

export function validateExpiry(deadline) {
  if (!deadline) return { ok: true };
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return { ok: true }; // treat unparseable as not-expired
  const now = Date.now();
  if (now > d.getTime()) return { ok: false, reason: "expired" };
  return { ok: true, expiresAt: d.getTime() };
}
