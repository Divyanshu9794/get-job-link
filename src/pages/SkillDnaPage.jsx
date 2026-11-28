import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Dna,
  ChevronRight,
  Plus,
  X,
  Lightbulb,
} from "lucide-react";
import SEO from "../components/SEO";
import { buildSkillDnaProfile } from "../utils/careerIntelligence";
import { useToast } from "../context/ToastContext";

export default function SkillDnaPage() {
  const { showToast } = useToast();

  const [skills, setSkills] = useState(() => {
    try {
      const stored = localStorage.getItem("gjl_user_dna_skills");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return ["React", "JavaScript", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Git"];
  });

  const [inputSkill, setInputSkill] = useState("");

  const dnaProfile = useMemo(() => {
    return buildSkillDnaProfile(skills);
  }, [skills]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = inputSkill.trim();
    if (!clean) return;
    if (skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      showToast("Skill already exists in your profile", "info");
      return;
    }
    const updated = [...skills, clean];
    setSkills(updated);
    setInputSkill("");
    try {
      localStorage.setItem("gjl_user_dna_skills", JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(`Added ${clean} to your Skill DNA!`, "success");
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    try {
      localStorage.setItem("gjl_user_dna_skills", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Skill DNA - Visual Technology Competency & Career Mapping | GetJobLink"
        description="Visualize your technical identity across languages, frameworks, databases, and DevOps. Get adjacent skill recommendations to maximize ATS matching."
        canonicalUrl="https://getjoblink.in/skill-dna"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Skill DNA</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                <Dna className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Technical Identity Taxonomy</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Skill <span className="text-blue-600 dark:text-blue-400">DNA</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A visual representation of your engineering strengths. Categorizes your stack into core competencies and recommends highest-ROI adjacent skills.
              </p>
            </div>

            {/* DNA Strength Score */}
            <div className="bg-slate-900 text-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-xl text-center min-w-[160px] shrink-0">
              <div className="text-3xl font-black font-mono text-purple-400">{dnaProfile.dnaStrengthScore}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">DNA Strength Score</div>
            </div>
          </div>

          {/* Quick Skill Add Input */}
          <form onSubmit={handleAddSkill} className="mt-6 flex items-center space-x-2 max-w-md">
            <input
              type="text"
              placeholder="Add skill (e.g. Golang, Kubernetes, Redis)..."
              value={inputSkill}
              onChange={(e) => setInputSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors shrink-0"
            >
              Add Skill
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Categorized DNA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(dnaProfile.categorized).map(([category, catSkills]) => (
            <div
              key={category}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {category}
                </span>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                  {catSkills.length}
                </span>
              </div>

              {catSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills recorded in this category.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {catSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 group"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-slate-400 hover:text-rose-500 ml-1"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Adjacent High-ROI Recommendations */}
        {dnaProfile.recommendations.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl border border-purple-200/80 dark:border-purple-900/50">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                High-ROI Adjacent Skill Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dnaProfile.recommendations.map((rec) => (
                <div
                  key={rec.skill}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.skill}</span>
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.2 rounded">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rec.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...skills, rec.skill];
                      setSkills(updated);
                      showToast(`Added ${rec.skill} to your profile!`, "success");
                    }}
                    className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 shrink-0"
                    title="Add to profile"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
