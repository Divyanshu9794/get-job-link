import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Flame,
  CheckCircle2,
  Circle,
  ChevronRight,
  Code2,
  FileText,
  Search,
  BookOpen,
} from "lucide-react";
import SEO from "../components/SEO";
import { useToast } from "../context/ToastContext";

export default function MissionsPage() {
  const { showToast } = useToast();

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("gjl_completed_missions");
      return stored ? new Set(JSON.parse(stored)) : new Set(["m-1"]);
    } catch {
      return new Set(["m-1"]);
    }
  });

  const missionsList = [
    {
      id: "m-1",
      title: "Evaluate Your Resume against ATS standards",
      category: "Resume",
      icon: FileText,
      xp: 50,
      description: "Upload your resume in ATS Checker and review keyword density and parseability score.",
      link: "/ats-checker",
      actionText: "Open ATS Checker",
    },
    {
      id: "m-2",
      title: "Solve 2 Medium DSA problems",
      category: "DSA & Core CS",
      icon: Code2,
      xp: 75,
      description: "Practice array and graph problems to stay sharp for technical rounds.",
      link: "https://leetcode.com",
      actionText: "Practice on LeetCode",
      isExternal: true,
    },
    {
      id: "m-3",
      title: "Explore the Opportunity Map cluster",
      category: "Discovery",
      icon: Search,
      xp: 40,
      description: "Discover tech domain opportunities matching your target stack on the interactive map.",
      link: "/opportunity-map",
      actionText: "Explore Map",
    },
    {
      id: "m-4",
      title: "Add a Technical Proof Project",
      category: "Proof",
      icon: Swords,
      xp: 60,
      description: "Link a GitHub repository to verify your hands-on coding capabilities.",
      link: "/project-proof",
      actionText: "Go to Project Proof",
    },
    {
      id: "m-5",
      title: "Read a System Design Career Guide",
      category: "Learning",
      icon: BookOpen,
      xp: 45,
      description: "Learn how senior engineers architect scalable real-time distributed backends.",
      link: "/career-guides",
      actionText: "Read Career Guides",
    },
  ];

  const totalXP = Array.from(completedIds).reduce((acc, id) => {
    const m = missionsList.find((item) => item.id === id);
    return acc + (m ? m.xp : 0);
  }, 0);

  const toggleMission = (id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Mission reset", "info");
      } else {
        next.add(id);
        const m = missionsList.find((item) => item.id === id);
        showToast(`🎉 Mission Completed! +${m?.xp || 50} XP earned!`, "success");
      }
      try {
        localStorage.setItem("gjl_completed_missions", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Career Missions & Gamified Engineering Milestones | GetJobLink"
        description="Level up your career with verifiable missions: DSA challenges, resume optimization, project proof, and technology learning goals."
        canonicalUrl="https://getjoblink.in/missions"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Career Missions</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                <span>Gamified Skill Advancement</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Career <span className="text-blue-600 dark:text-blue-400">Missions</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Consistency compounds. Complete real skill-improvement milestones, earn verifiable XP, and build career momentum.
              </p>
            </div>

            {/* Streak & XP Widget */}
            <div className="bg-slate-900 text-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center space-x-6 shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-400 mb-0.5">
                  <Flame className="w-4 h-4" />
                  <span className="text-2xl font-black font-mono">4</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Day Streak</div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-black font-mono text-emerald-400 mb-0.5">{totalXP}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Career XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {missionsList.map((m) => {
            const isDone = completedIds.has(m.id);
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleMission(m.id)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    title={isDone ? "Mark as incomplete" : "Mark as completed"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {m.category}
                      </span>
                      <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                        +{m.xp} XP
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-bold ${
                        isDone
                          ? "line-through text-slate-500 dark:text-slate-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {m.isExternal ? (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    >
                      {m.actionText}
                    </a>
                  ) : (
                    <Link
                      to={m.link}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      {m.actionText}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
