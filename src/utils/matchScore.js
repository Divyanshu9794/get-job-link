/**
 * Calculate the match score between a job's skills and a user's resume skills.
 * @param {string[]} jobSkills - Array of skills required by the job (from Firestore)
 * @param {string} resumeSkillsStr - Comma/space-separated string of user's resume skills
 * @returns {{ score: number, matching: string[], missing: string[] }}
 */
export function calculateMatchScore(jobSkills, resumeSkillsStr) {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 0, matching: [], missing: [] };
  }

  const resumeSkills = (resumeSkillsStr || "")
    .split(/[,;\n\r]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (resumeSkills.length === 0) {
    return { score: 0, matching: [], missing: jobSkills };
  }

  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase().trim());

  const matching = jobSkillsLower.filter((js) =>
    resumeSkills.some((rs) => rs.includes(js) || js.includes(rs))
  );

  const missing = jobSkillsLower.filter((js) => !matching.includes(js));

  const score = jobSkillsLower.length
    ? Math.round((matching.length / jobSkillsLower.length) * 100)
    : 0;

  return {
    score: Math.min(score, 100),
    matching: matching.slice(0, 20),
    missing: missing.slice(0, 20),
  };
}
