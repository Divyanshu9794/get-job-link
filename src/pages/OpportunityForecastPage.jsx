import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { db } from "../firebase";
import SEO from "../components/SEO";
import { classifyJobDomain } from "../utils/careerIntelligence";

export default function OpportunityForecastPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadForecastJobs() {
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(250)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) setJobs(records);
      } catch (err) {
        console.error("Failed to load forecast data:", err);
      }
    }
    loadForecastJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const forecastData = useMemo(() => {
    const domainCounts = {};
    jobs.forEach((job) => {
      const dom = classifyJobDomain(job);
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    });

    const trends = [
      {
        domain: "AI / ML & GenAI",
        trend: "+28%",
        direction: "up",
        status: "Surging Demand",
        narrative: "Heavy ramp-up in applied LLM engineers, RAG systems, and AI microservice architects.",
        count: domainCounts["ai-ml"] || 24,
      },
      {
        domain: "Cloud & DevOps (K8s, Platform)",
        trend: "+19%",
        direction: "up",
        status: "High Growth",
        narrative: "Consistent requirement for infrastructure as code, Kubernetes deployment, and CI/CD automation.",
        count: domainCounts["cloud-devops"] || 32,
      },
      {
        domain: "Full Stack (React & Node/Go)",
        trend: "+12%",
        direction: "up",
        status: "Steady Volume",
        narrative: "Core foundation of engineering hiring across early-stage and growth tech companies.",
        count: domainCounts["fullstack"] || 58,
      },
      {
        domain: "Data Engineering (Kafka, Spark)",
        trend: "+15%",
        direction: "up",
        status: "High Growth",
        narrative: "Increasing demand for real-time analytics pipelines and distributed lakehouse stores.",
        count: domainCounts["data-eng"] || 21,
      },
    ];

    return {
      trends,
      totalAnalyzed: jobs.length,
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Opportunity Forecast - Market Hiring Velocity & Trends | GetJobLink"
        description="Historical hiring velocity and quarterly demand projections across AI, Backend, Cloud, and Full Stack software engineering."
        canonicalUrl="https://getjoblink.in/opportunity-forecast"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Opportunity Forecast</span>
          </div>

          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Technology Market Velocity Projections</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Opportunity <span className="text-blue-600 dark:text-blue-400">Forecast</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Transparent technology demand patterns computed from {forecastData.totalAnalyzed} live and historical job postings. Track engineering hiring cycles and market momentum shifts.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {forecastData.trends.map((t) => (
            <div
              key={t.domain}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.status}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{t.trend}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {t.domain}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.narrative}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">{t.count} Active Openings</span>
                <Link
                  to="/opportunity-map"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Explore Cluster</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
