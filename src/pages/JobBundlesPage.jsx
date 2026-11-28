import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Package,
  Share2,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";
import { db } from "../firebase";
import JobCard from "../components/JobCard";
import SEO from "../components/SEO";
import { CURATED_COLLECTION_TEMPLATES } from "../utils/careerIntelligence";
import { useToast } from "../context/ToastContext";

export default function JobBundlesPage() {
  const { collectionSlug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Active bundle template or default to first
  const activeBundle = useMemo(() => {
    if (collectionSlug) {
      const match = CURATED_COLLECTION_TEMPLATES.find((t) => t.slug === collectionSlug);
      if (match) return match;
    }
    return CURATED_COLLECTION_TEMPLATES[0];
  }, [collectionSlug]);

  // Fetch jobs for bundles
  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) setJobs(records);
      } catch (err) {
        console.error("Error fetching jobs for bundles:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter jobs for the selected bundle
  const matchingJobs = useMemo(() => {
    if (!activeBundle) return [];
    const filterFn = activeBundle.filter;
    return jobs.filter((job) => {
      try {
        return filterFn(job);
      } catch {
        return false;
      }
    });
  }, [jobs, activeBundle]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Collection link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title={`${activeBundle.title} - Curated Tech Job Bundles | GetJobLink`}
        description={activeBundle.description}
        canonicalUrl={`https://getjoblink.in/collections/${activeBundle.slug}`}
      />

      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/collections" className="hover:text-blue-600 dark:hover:text-blue-400">Collections</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">{activeBundle.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Curated Job Bundle</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeBundle.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeBundle.description}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Collection"}</span>
              </button>
            </div>
          </div>

          {/* Collection Pills Carousel */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {CURATED_COLLECTION_TEMPLATES.map((bundle) => {
              const active = bundle.slug === activeBundle.slug;
              return (
                <button
                  key={bundle.id}
                  type="button"
                  onClick={() => navigate(`/collections/${bundle.slug}`)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Package className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{bundle.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Matching Verified Roles ({matchingJobs.length})</span>
          </div>
          <span className="text-xs text-slate-400">Direct Authenticated ATS links</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : matchingJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No active jobs in this collection right now</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              New opportunities arrive daily. Explore another collection above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchingJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
