// AI relevance ranking using @google/genai (Gemini). Mirrors the proven
// pattern in functions/bot.js cleanJobWithAI so the ingestion pipeline can
// score candidate jobs by skill match & freshness instead of a naive heuristic.
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const AI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SKILL_WEIGHTS = [
  ["python", 4], ["javascript", 3], ["typescript", 3], ["react", 3], ["node", 3],
  ["docker", 3], ["kubernetes", 4], ["aws", 3], ["google cloud", 3], ["azure", 3],
  ["git", 2], ["sql", 2], ["postgresql", 2], ["rest", 2], ["graphql", 2],
  ["machine learning", 4], ["data science", 4], ["ai", 4], ["ml", 3],
];

// Extract candidate skills from a raw description. Cheap pre-filter before
// invoking Gemini.
const extractCandidateSkills = (text) => {
  const lower = (text || "").toLowerCase();
  const found = new Set();
  for (const [skill, weight] of SKILL_WEIGHTS) {
    const re = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) found.add(skill);
  }
  return Array.from(found);
};

export async function rankJobAI(rawJob) {
  const description = String(rawJob.jd || rawJob.description || "");
  const title = String(rawJob.title || "");
  const rawSkills = Array.isArray(rawJob.skills) ? rawJob.skills : [];
  const score = (description + "\n" + title + "\n" + rawSkills.join(" ")).slice(0, 6000);

  try {
    const prompt = `
You are an expert tech recruiter scoring relevance for our aggregator.
Return a JSON object ONLY with these fields, no prose:
{ "score": number 0..100, "reason": string (max 60 chars), "matchedSkills": ["..."] }
Inputs:
Title: ${title.slice(0, 200)}
Description: ${description.slice(0, 6000)}
Raw skills: ${JSON.stringify(rawSkills)}
High-signal keywords: python, javascript, typescript, react, node, docker, kubernetes, aws, google cloud, azure, git, sql, postgresql, rest, graphql, machine learning, data science, ai, ml
`;
    const resp = await AI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(resp.text || "{}");
    const matched = Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills.map(s => s.trim()).filter(Boolean) : [];
    const humanScore = typeof parsed.score === "number" && parsed.score >= 0 && parsed.score <= 100 ? parsed.score : 0;
    const finalScore = Math.round(humanScore);
    return { score: finalScore, reason: (parsed.reason || ""), matchedSkills: matched };
  } catch (e) {
    console.warn(`[aiRank] fallback heuristic for "${rawJob.title || rawJob.company}"`);
    const cands = extractCandidateSkills(score);
    const weighted = cands.reduce((acc, k) => { const w = SKILL_WEIGHTS.find(([, w]) => w[0].toLowerCase().includes(k))?.[1] ?? 1; return acc + w; }, 0);
    return {
      score: Math.min(100, weighted),
      reason: `${cands.length} signal skills matched`,
      matchedSkills: cands,
    };
  }
}
