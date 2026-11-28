import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Compass,
  MapPin,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
  Layout,
  Server,
  Cloud,
  Smartphone,
  Database,
  Shield,
  RotateCcw,
} from "lucide-react";
import { db } from "../firebase";
import {
  TECH_DOMAINS,
  buildOpportunityClusters,
  classifyJobDomain,
} from "../utils/careerIntelligence";
import JobCard from "../components/JobCard";
import SEO from "../components/SEO";

const DOMAIN_ICONS = {
  Layout,
  Server,
  Layers,
  Sparkles,
  Cloud,
  Smartphone,
  Database,
  Shield,
};

export default function OpportunityMapPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchMapJobs() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(350)
        );
        const snap = await getDocs(q);
        if (!isMounted) return;
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Opportunity Map fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMapJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const clusters = useMemo(() => {
    return buildOpportunityClusters(jobs);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedDomain !== "all" && classifyJobDomain(job) !== selectedDomain) {
        return false;
      }
      if (selectedLocation !== "all") {
        const loc = (job.location || "").toLowerCase();
        if (!loc.includes(selectedLocation.toLowerCase())) return false;
      }
      if (selectedExperience !== "all") {
        const exp = String(job.experience || "").toLowerCase();
        if (selectedExperience === "fresher" && !(exp.includes("fresher") || exp.includes("0-1") || exp.includes("0 - 1") || exp.includes("intern"))) {
          return false;
        }
        if (selectedExperience === "junior" && (exp.includes("fresher") || exp.includes("3-5") || exp.includes("5+"))) {
          return false;
        }
        if (selectedExperience === "senior" && !(exp.includes("3-5") || exp.includes("5+") || exp.includes("senior") || exp.includes("lead"))) {
          return false;
        }
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const text = `${job.title || ""} ${job.company || ""} ${job.skills || ""} ${job.location || ""}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [jobs, selectedDomain, selectedLocation, selectedExperience, searchTerm]);

  const resetFilters = () => {
    setSelectedDomain("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased pb-20 transition-colors">
      <SEO
        title="Opportunity Map — Visual Tech Career Discovery | GetJobLink"
        description="Explore technology job opportunities grouped by frontend, backend, AI/ML, cloud, location clusters, and experience tiers across India and global remote openings."
        canonicalUrl="https://getjoblink.in/opportunity-map"
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-900/10 via-transparent to-transparent border-b border-slate-200 dark:border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
                <Compass className="w-3.5 h-3.5" />
                <span>Interactive Visual Discovery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Technology Opportunity Map
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Explore tech roles mapped into visual architectural clusters. Filter by engineering domain, hub locations, and career seniority tiers.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <div className="text-center px-2">
                <div className="text-xl font-black text-blue-600 dark:text-blue-400">{jobs.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Mapped Jobs</div>
              </div>
              <div className="text-center px-2 border-x border-slate-100 dark:border-slate-800">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{TECH_DOMAINS.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Tech Domains</div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{clusters.topLocations.length}+</div>
                <div className="text-[10px] text-slate-400 font-medium">Tech Hubs</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role, framework (e.g. React, Golang, PyTorch), company or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {(selectedDomain !== "all" || selectedLocation !== "all" || selectedExperience !== "all" || searchTerm) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Technology Domain Clusters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Technology Domain Clusters</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Click a cluster to inspect opportunities</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
            {clusters.domains.map((cluster) => {
              const Icon = DOMAIN_ICONS[cluster.icon] || Layers;
              const isSelected = selectedDomain === cluster.id;
              return (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedDomain(isSelected ? "all" : cluster.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:scale-102 flex flex-col justify-between h-32 relative overflow-hidden group ${
                    isSelected
                      ? "border-blue-600 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-500/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`p-2 rounded-xl ${cluster.bgColor} ${cluster.textColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {cluster.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {cluster.label}
                    </h3>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span>{cluster.companiesCount} companies</span>
                      <span>•</span>
                      <span>{cluster.locationsCount} hubs</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Experience Tiers & Hub Locations Filter Pills */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience Clusters */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Seniority & Experience Clusters</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedExperience("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedExperience === "all"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                All Seniority ({jobs.length})
              </button>
              <button
                onClick={() => setSelectedExperience(selectedExperience === "fresher" ? "all" : "fresher")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedExperience === "fresher"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                🌱 Fresher / 0-1 Yrs ({clusters.experience.fresher.count})
              </button>
              <button
                onClick={() => setSelectedExperience(selectedExperience === "junior" ? "all" : "junior")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedExperience === "junior"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                🚀 Junior / 1-3 Yrs ({clusters.experience.junior.count})
              </button>
              <button
                onClick={() => setSelectedExperience(selectedExperience === "senior" ? "all" : "senior")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedExperience === "senior"
                    ? "bg-purple-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                ⭐ Senior & Staff ({clusters.experience.senior.count})
              </button>
            </div>
          </div>

          {/* Location Clusters */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location & Hub Clusters</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLocation("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedLocation === "all"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Global / All Hubs
              </button>
              {clusters.topLocations.slice(0, 7).map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(selectedLocation === loc.name ? "all" : loc.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedLocation === loc.name
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {loc.name} ({loc.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filtered Results Header */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Matching Opportunities ({filteredJobs.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing direct verified openings filtered by your active cluster selection
            </p>
          </div>
          <Link
            to="/jobs/india"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Standard Table View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse h-32" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Compass className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Cluster Openings Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No positions matched your selected combination of domain, hub, and experience. Try clearing your filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Reset Cluster Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.slice(0, 36).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
