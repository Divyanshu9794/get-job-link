import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import SEO from "../components/SEO";

const TARGET_ROLES = [
  {
    role: "Full Stack Developer",
    coreSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST API", "Docker"],
    alternativeTitles: ["Frontend Engineer", "Backend Developer", "Software Engineer"],
    marketDemand: "High Demand (380+ listings)",
  },
  {
    role: "Backend & Systems Engineer",
    coreSkills: ["Golang", "Java", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes"],
    alternativeTitles: ["Distributed Systems Engineer", "API Platform Engineer", "Cloud Backend Dev"],
    marketDemand: "Very High Demand (420+ listings)",
  },
  {
    role: "AI / Machine Learning Engineer",
    coreSkills: ["Python", "PyTorch", "FastAPI", "Vector DBs", "Docker", "LLM Fine-tuning"],
    alternativeTitles: ["GenAI Developer", "MLOps Engineer", "Applied AI Specialist"],
    marketDemand: "Surging Demand (190+ listings)",
  },
  {
    role: "DevOps & Cloud Engineer",
    coreSkills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux", "Docker"],
    alternativeTitles: ["Site Reliability Engineer (SRE)", "Infrastructure Engineer", "Platform Engineer"],
    marketDemand: "Consistent High Demand (240+ listings)",
  },
];

const DEFAULT_USER_SKILLS = [
  "React",
  "JavaScript",
  "Node.js",
  "PostgreSQL",
  "Git",
];

export default function OpportunityUnlockerPage() {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const target = TARGET_ROLES[selectedRoleIndex];

  // Analyze missing vs matching skills
  const analysis = useMemo(() => {
    const matching = [];
    const missing = [];
    target.coreSkills.forEach((skill) => {
      const isPresent = DEFAULT_USER_SKILLS.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      );
      if (isPresent) matching.push(skill);
      else missing.push(skill);
    });

    const matchScore = Math.round((matching.length / target.coreSkills.length) * 100);

    return {
      matching,
      missing,
      matchScore,
    };
  }, [target]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Hidden Opportunity Unlocker - Role Gap Analysis & Roadmap | GetJobLink"
        description="Select a target engineering role to unlock requirements, identify transferable skills, and view alternative titles currently hiring."
        canonicalUrl="https://getjoblink.in/opportunity-unlocker"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Opportunity Unlocker</span>
          </div>

          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Target Role Analysis & Gap Resolver</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hidden Opportunity <span className="text-blue-600 dark:text-blue-400">Unlocker</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Target higher-paying roles without guesswork. Compare your current skillset directly against authenticated job requirements to unlock immediate next steps.
            </p>
          </div>
        </div>
      </section>

      {/* Main Analysis Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Role Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {TARGET_ROLES.map((r, i) => (
            <button
              key={r.role}
              type="button"
              onClick={() => setSelectedRoleIndex(i)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedRoleIndex === i
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {r.role}
            </button>
          ))}
        </div>

        {/* Match Overview Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Profile</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{target.role}</h2>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                {target.marketDemand}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shrink-0">
              <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                {analysis.matchScore}%
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Role Compatibility</div>
            </div>
          </div>

          {/* Matching & Missing Skills Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Skills You Already Have ({analysis.matching.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matching.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>High-Priority Skills to Learn ({analysis.missing.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Titles You Can Target Now */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Alternative Job Titles You Can Target Today</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {target.alternativeTitles.map((title) => (
                <Link
                  key={title}
                  to={`/jobs/india?q=${encodeURIComponent(title)}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>{title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
