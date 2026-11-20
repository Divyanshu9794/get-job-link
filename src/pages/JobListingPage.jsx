import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import {
  Briefcase,
  Globe,
  MapPin,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Clock,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { db } from "../firebase";
import JobCard from "../components/JobCard";
import JobFilters from "../components/JobFilters";
import Pagination from "../components/Pagination";
import TrustBanner from "../components/TrustBanner";
import SEO from "../components/SEO";
import { CAREER_GUIDES } from "../data/careerGuidesData";
import { useToast } from "../context/ToastContext";
import LinkedInBatchShareModal from "../components/LinkedInBatchShareModal";
import {
  isIndiaJob,
  isWorldJob,
  isRemoteJob,
} from "../utils/jobClassification";

const PAGE_SIZE = 50;

// Estimated baseline counts based on GetJobLink production dataset
const BASELINE_TOTALS = {
  all: 776,
  india: 512,
  world: 264,
  remote: 98,
};

export default function JobListingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect active category from route: /jobs/india, /jobs/world, /jobs/remote, or / (default india)
  const category = useMemo(() => {
    const path = location.pathname;
    if (path === "/jobs/world") return "world";
    if (path === "/jobs/remote") return "remote";
    return "india"; // default / or /jobs/india
  }, [location.pathname]);

  // URL search params sync
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") || "");
  const [filters, setFilters] = useState(() => ({
    experience: searchParams.get("exp") || "",
    employmentType: searchParams.get("type") || "",
    workMode: searchParams.get("mode") || "",
    country: searchParams.get("country") || "",
    domain: searchParams.get("domain") || "",
    postedDate: searchParams.get("date") || "",
  }));

  // Firestore cursor and cache storage
  // Cache stores arrays of processed jobs by page number: { 1: [jobs], 2: [jobs] }
  const [pageCache, setPageCache] = useState({});
  const cursorsRef = useRef({ 1: null }); // { pageNumber: lastDocSnapshot }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(BASELINE_TOTALS[category]);
  const [hasMore, setHasMore] = useState(true);

  // LinkedIn batch sharing state
  const { showToast } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);

  const handleQuickCopyTop10 = async () => {
    if (!currentJobs || currentJobs.length === 0) return;
    const baseUrl = window.location.origin;
    const targetJobs = currentJobs.slice(0, 10);
    const lines = [
      `🚀 Latest Verified Daily Tech Jobs | GetJobLink.in`,
      `🔥 100% direct company ATS links with zero recruiter spam or fees.\n`
    ];

    targetJobs.forEach((job, index) => {
      const num = index + 1;
      const title = job.title || "Software Engineering Role";
      const company = job.company || "Leading Tech Firm";
      const location = job.location && String(job.location).toLowerCase() !== "null" ? job.location : "India";
      let exp = "0+ yrs";
      if (job.experience && String(job.experience).toLowerCase() !== "null") {
        exp = String(job.experience).trim();
        if (exp.toLowerCase().includes("fresher")) exp = "Fresher (0-1 yr)";
      }
      const jobUrl = `${baseUrl}/job/${job.id}`;

      lines.push(`${num}️⃣ ${title} — ${company}`);
      lines.push(`   📍 Location: ${location}`);
      lines.push(`   💼 Experience: ${exp}`);
      if (job.salary && String(job.salary).toLowerCase() !== "null" && job.salary !== "Not Disclosed") {
        lines.push(`   💰 Salary: ${job.salary}`);
      }
      lines.push(`   🔗 View Details & Apply: ${jobUrl}\n`);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👉 Explore 700+ verified daily tech jobs: ${baseUrl}\n`);
    lines.push(`#Hiring #TechJobs #SoftwareEngineer #Developer #Freshers #JobSearch #GetJobLink`);

    const fullText = lines.join("\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setQuickCopied(true);
      showToast("Top 10 jobs copied for LinkedIn!");
      setTimeout(() => setQuickCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Could not copy jobs", "error");
    }
  };

  // Sync state to URL params without full page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchTerm) params.set("q", searchTerm);
    if (filters.experience) params.set("exp", filters.experience);
    if (filters.employmentType) params.set("type", filters.employmentType);
    if (filters.workMode) params.set("mode", filters.workMode);
    if (filters.country) params.set("country", filters.country);
    if (filters.domain) params.set("domain", filters.domain);
    if (filters.postedDate) params.set("date", filters.postedDate);

    const newSearch = params.toString() ? `?${params.toString()}` : "";
    if (location.search !== newSearch) {
      navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
    }
  }, [currentPage, searchTerm, filters, category, location.pathname, navigate, location.search]);

  // When category changes, reset cache and cursors and page to 1
  useEffect(() => {
    setPageCache({});
    cursorsRef.current = { 1: null };
    setCurrentPage(1);
    setTotalCount(BASELINE_TOTALS[category] || 776);
  }, [category]);

  // When search or filters change, reset to page 1 and clear cache
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setPageCache({});
    cursorsRef.current = { 1: null };
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setPageCache({});
    cursorsRef.current = { 1: null };
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      experience: "",
      employmentType: "",
      workMode: "",
      country: "",
      domain: "",
      postedDate: "",
    });
    setCurrentPage(1);
    setPageCache({});
    cursorsRef.current = { 1: null };
  };

  // Helper filter matching
  const matchJob = useCallback((job) => {
    // 1. Category check
    if (category === "india" && !isIndiaJob(job)) return false;
    if (category === "world" && !isWorldJob(job)) return false;
    if (category === "remote" && !isRemoteJob(job)) return false;

    // 2. Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const inTitle = job.title?.toLowerCase().includes(q);
      const inCompany = job.company?.toLowerCase().includes(q);
      const inLocation = job.location?.toLowerCase().includes(q);
      const inSkills = Array.isArray(job.skills)
        ? job.skills.some((s) => s.toLowerCase().includes(q))
        : typeof job.skills === "string" && job.skills.toLowerCase().includes(q);
      const inDesc = (job.jd || job.description || "").toLowerCase().includes(q);

      if (!inTitle && !inCompany && !inLocation && !inSkills && !inDesc) {
        return false;
      }
    }

    // 3. Experience filter
    if (filters.experience) {
      const exp = (job.experience || "").toLowerCase();
      if (filters.experience === "fresher") {
        if (!exp.includes("fresher") && !exp.includes("0 year") && !exp.includes("0 - 1") && !exp.includes("0-1")) {
          return false;
        }
      } else if (filters.experience === "1-3") {
        if (!exp.includes("1 year") && !exp.includes("2 year") && !exp.includes("1 -") && !exp.includes("1-3")) {
          return false;
        }
      } else if (filters.experience === "3-5") {
        if (!exp.includes("3 year") && !exp.includes("4 year") && !exp.includes("3 -") && !exp.includes("3-5")) {
          return false;
        }
      } else if (filters.experience === "5+") {
        if (!exp.includes("5") && !exp.includes("6") && !exp.includes("7") && !exp.includes("8") && !exp.includes("more than 4")) {
          return false;
        }
      }
    }

    // 4. Job Type
    if (filters.employmentType) {
      const type = (job.jobType || "").toLowerCase();
      if (!type.includes(filters.employmentType.toLowerCase())) {
        return false;
      }
    }

    // 5. Work mode
    if (filters.workMode) {
      const isRem = isRemoteJob(job);
      const loc = (job.location || "").toLowerCase();
      if (filters.workMode === "remote" && !isRem) return false;
      if (filters.workMode === "onsite" && isRem) return false;
      if (filters.workMode === "hybrid" && !loc.includes("hybrid")) return false;
    }

    // 6. Country
    if (filters.country) {
      const loc = (job.location || "").toLowerCase();
      if (!loc.includes(filters.country.toLowerCase())) {
        return false;
      }
    }

    // 7. Domain
    if (filters.domain) {
      const dom = (job.domain || "Engineering").toLowerCase();
      if (!dom.includes(filters.domain.toLowerCase())) {
        return false;
      }
    }

    // 8. Posted Date
    if (filters.postedDate) {
      const time = job.createdAt || (job.date ? new Date(job.date).getTime() : null);
      if (time) {
        const diffMs = Date.now() - new Date(time).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (filters.postedDate === "24h" && diffHours > 24) return false;
        if (filters.postedDate === "7d" && diffHours > 24 * 7) return false;
        if (filters.postedDate === "30d" && diffHours > 24 * 30) return false;
      }
    }

    return true;
  }, [category, searchTerm, filters]);

  // Fetch page data with Firestore cursor
  useEffect(() => {
    let isMounted = true;

    async function loadPageJobs() {
      // If page is already cached, no need to query Firestore
      if (pageCache[currentPage]) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let cursorDoc = cursorsRef.current[currentPage] || null;
        let collected = [];
        let lastDocSnapshot = cursorDoc;
        let hitEnd = false;
        let attempts = 0;
        const maxAttempts = 6; // fetch up to 6 batches to fill 50 matching items

        // Batch size for Firestore limit
        const BATCH_SIZE = 60;

        while (collected.length < PAGE_SIZE && !hitEnd && attempts < maxAttempts) {
          attempts++;

          let q = query(
            collection(db, "jobs"),
            orderBy("createdAt", "desc"),
            limit(BATCH_SIZE)
          );

          if (lastDocSnapshot) {
            q = query(
              collection(db, "jobs"),
              orderBy("createdAt", "desc"),
              startAfter(lastDocSnapshot),
              limit(BATCH_SIZE)
            );
          }

          const snapshot = await getDocs(q);

          if (!isMounted) return;

          if (snapshot.empty) {
            hitEnd = true;
            break;
          }

          lastDocSnapshot = snapshot.docs[snapshot.docs.length - 1];

          for (const docSnap of snapshot.docs) {
            const data = { id: docSnap.id, ...docSnap.data() };
            if (matchJob(data)) {
              collected.push(data);
              if (collected.length >= PAGE_SIZE) {
                // save cursor for next page
                cursorsRef.current[currentPage + 1] = docSnap;
                break;
              }
            }
          }

          if (snapshot.docs.length < BATCH_SIZE) {
            hitEnd = true;
          }
        }

        if (isMounted) {
          setPageCache((prev) => ({ ...prev, [currentPage]: collected }));
          if (hitEnd && collected.length < PAGE_SIZE) {
            setHasMore(false);
            setTotalCount((currentPage - 1) * PAGE_SIZE + collected.length);
          } else {
            setHasMore(true);
          }
        }
      } catch (err) {
        console.error("Error loading jobs from Firestore:", err);
        if (isMounted) {
          setError("Unable to load jobs right now. Please refresh or try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPageJobs();

    return () => {
      isMounted = false;
    };
  }, [currentPage, matchJob, pageCache]);

  const currentJobs = pageCache[currentPage] || [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Header info based on category
  const categoryHeader = {
    india: {
      title: "Indian Tech Jobs",
      badge: "India Openings",
      description: "Direct company opportunities across Bangalore, Hyderabad, Pune, NCR, and India.",
      seoTitle: "Indian Tech Jobs | Verified Daily Openings in Bengaluru, Hyderabad & NCR",
      seoDesc: "Discover daily verified tech jobs across India's top tech hubs. Direct ATS application links to startups, MNCs, and Global Capability Centers with zero application fees.",
      canonical: "/jobs/india",
    },
    world: {
      title: "International Jobs",
      badge: "Worldwide Roles",
      description: "Global tech opportunities in the United States, Europe, UK, Singapore, and worldwide.",
      seoTitle: "International Tech Jobs | Global Software Engineering Roles",
      seoDesc: "Verified international software engineering and tech opportunities across the US, UK, Germany, Canada, and global markets with direct employer application links.",
      canonical: "/jobs/world",
    },
    remote: {
      title: "Remote Jobs Worldwide",
      badge: "100% Remote",
      description: "Distributed and work-from-anywhere positions across engineering, product, and tech.",
      seoTitle: "Remote Tech Jobs Worldwide | Verified Work-From-Anywhere Roles",
      seoDesc: "Curated 100% remote software developer and tech positions. Direct company application links for distributed teams offering global compensation and flexible hours.",
      canonical: "/jobs/remote",
    },
  }[category];

  // Organization & WebSite JSON-LD Schema for Homepage
  const homeJsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://getjoblink.in/#website",
          url: "https://getjoblink.in",
          name: "GetJobLink",
          description: "Clean daily tech job openings, free ATS resume evaluations, and engineering career guides.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://getjoblink.in/jobs/india?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          "@id": "https://getjoblink.in/#organization",
          name: "GetJobLink",
          url: "https://getjoblink.in",
          logo: "https://getjoblink.in/logo.jpeg",
          sameAs: ["https://twitter.com/getjoblink"],
        },
      ],
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {/* Dynamic SEO Meta Tags & Schema */}
      <SEO
        title={categoryHeader.seoTitle}
        description={categoryHeader.seoDesc}
        canonicalUrl={categoryHeader.canonical}
        jsonLd={homeJsonLd}
      />

      {/* Category Hero / Title Section */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200/80 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>{categoryHeader.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {categoryHeader.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                {categoryHeader.description}
              </p>
            </div>

            {/* Category Quick Pill Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start md:self-auto">
              <Link
                to="/jobs/india"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "india"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>India</span>
              </Link>
              <Link
                to="/jobs/world"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "world"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>World</span>
              </Link>
              <Link
                to="/jobs/remote"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "remote"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Remote</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <TrustBanner />

        {/* Search & Filters */}
        <JobFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 text-rose-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setPageCache({});
                setCurrentPage(1);
              }}
              className="px-3 py-1 bg-white border border-rose-200 text-rose-700 font-semibold rounded-lg text-xs hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-xl p-3.5 min-h-[82px] animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1 pr-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="w-12 h-3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : currentJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs my-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No job openings found matching your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't find any positions matching your selected category and filters. Try
              adjusting keywords or clearing filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search & Filters</span>
            </button>
          </div>
        ) : (
          /* Job Listing Cards */
          <div className="space-y-4">
            {/* Batch LinkedIn Share Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Showing {currentJobs.length} {category === "remote" ? "Remote" : category === "world" ? "Global" : "Indian"} Positions
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">Page {currentPage}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleQuickCopyTop10}
                  title="Quick copy top 10 jobs formatted for LinkedIn"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 text-xs font-semibold transition-all"
                >
                  {quickCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Top 10 Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quick Copy Top 10</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
                  title="Copy all jobs formatted for LinkedIn sharing with direct links"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy All for LinkedIn</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              hasMore={hasMore}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* HIGH-VALUE EDITORIAL CONTENT & CURATION METHODOLOGY SECTION */}
        <section className="mt-16 pt-12 border-t border-slate-200/90 space-y-12">
          {/* Curation Protocol & Value Proposition */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Our Editorial &amp; Curation Standard</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                How GetJobLink Curates Verified Daily Tech Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
                GetJobLink (<a href="https://getjoblink.in" className="text-blue-600 font-semibold hover:underline">getjoblink.in</a>)
                was founded on a simple principle: software engineers, freshers, and tech professionals
                deserve a clean, direct channel to real employment opportunities without recruiters holding
                resumes, gatekeeping links, or charging fraudulent placement fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Direct ATS Verification</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We monitor hundreds of verified tech company careers portals daily. Every &ldquo;Apply Now&rdquo;
                  link routes directly to the employer&apos;s authenticated ATS (Greenhouse, Lever, Workday, SmartRecruiters)
                  or verified corporate career domain.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">100% Free For Candidates</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We never charge candidates registration fees, subscription charges, or commissions.
                  We enforce a strict zero-fee policy across all featured employers and third-party portals.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Integrated ATS Intelligence</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every job listing includes role-specific ATS keywords and screening benchmarks. Candidates
                  can upload their resume once to run instant, 1-click ATS score benchmarks against any job.
                </p>
              </div>
            </div>
          </div>

          {/* Regional Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>Indian Tech Hubs</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Featuring direct engineering openings across Bengaluru (Silicon Plateau), Hyderabad, Pune,
                Gurugram, and Noida. Covering Indian unicorns, high-growth startups, and Global Capability Centers (GCCs).
              </p>
              <Link
                to="/jobs/india"
                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                <span>Browse Indian Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <Globe className="w-4 h-4" />
                <span>International Opportunities</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover verified global roles across the United States, Germany, United Kingdom, Singapore,
                and Europe. Verified sponsorship information and direct corporate career portals.
              </p>
              <Link
                to="/jobs/world"
                className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
              >
                <span>Browse World Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>100% Remote Positions</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Distributed engineering teams offering work-from-anywhere contracts, global contractor
                arrangements (via Deel/Remote), flexible hours, and competitive USD/EUR compensation packages.
              </p>
              <Link
                to="/jobs/remote"
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:underline pt-1"
              >
                <span>Browse Remote Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Featured Career Guides Callout */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                <BookOpen className="w-3 h-3" />
                <span>Editorial Publications</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                Read In-Depth Engineering Career Guides
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore our research-backed guides on fresher hiring roadmaps, React/Node developer career
                paths, ATS keyword optimization, and technical interview frameworks.
              </p>
            </div>
            <Link
              to="/career-guides"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>Explore All Career Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured Articles Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Featured Career &amp; Hiring Guides
                </h3>
                <p className="text-xs text-slate-500">
                  Original editorial research, hiring frameworks, and tech career insights.
                </p>
              </div>
              <Link
                to="/career-guides"
                className="hidden sm:inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>View all {CAREER_GUIDES.length} guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {CAREER_GUIDES.slice(0, 3).map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/career-guides/${guide.slug}`}
                  className="group bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {guide.category}
                      </span>
                      <span className="text-slate-400 inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{guide.readTime}</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* LinkedIn Batch Sharing Modal */}
        <LinkedInBatchShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          jobs={currentJobs}
          category={category}
        />
      </main>
    </div>
  );
}
