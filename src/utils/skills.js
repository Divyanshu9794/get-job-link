/**
 * Normalize a job's skills field into a clean array of strings.
 * Jobs can hold skills as an array (ingestion pipeline) or as a
 * comma-separated string (manually pasted into the admin form).
 * @param {string[]|string|null|undefined} skills
 * @returns {string[]}
 */
export function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
