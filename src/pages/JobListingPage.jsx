import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  onSnapshot,
  where,
} from "firebase/firestore";
import {
  Briefcase,
  Globe,
  MapPin,
  RotateCcw,
  AlertCircle,
  Share2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { db } from "../firebase";
import JobCard from "../components/JobCard";
import JobFilters from "../components/JobFilters";
import Pagination from "../components/Pagination";
import TrustBanner from "../components/TrustBanner";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LinkedInBatchShareModal from "../components/LinkedInBatchShareModal";
import {
  isIndiaJob,
  isWorldJob,
  isRemoteJob,
  matchesExperienceFilter,
  getJobTimestamp,
  formatDisplaySalary,
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

  // Admin-only LinkedIn batch sharing state & controls
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [customSelectCount, setCustomSelectCount] = useState("10");

  // Top notification: count of jobs added today
  const [todayJobInfo, setTodayJobInfo] = useState(null);
  const [showNotification, setShowNotification] = useState(() => {
    try {
      return sessionStorage.getItem("gjl_today_notif_dismissed") !== "true";
    } catch {
      return true;
    }
  });

  const handleDismissNotification = () => {
    setShowNotification(false);
    try {
      sessionStorage.setItem("gjl_today_notif_dismissed", "true");
    } catch {
      // ignore
    }
  };

  // Fetch count of jobs added today (cached in sessionStorage for high performance)
  useEffect(() => {
    let isMounted = true;
    async function calculateTodayJobs() {
      const now = new Date();
      const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const todayUtcStr = now.toISOString().slice(0, 10);
      const startOfTodayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfTodayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const minTodayMs = Math.min(startOfTodayLocal, startOfTodayUtc);
      const past24Hours = now.getTime() - 24 * 60 * 60 * 1000;

      try {
        const cachedStat = sessionStorage.getItem("gjl_today_job_stat");
        if (cachedStat) {
          const parsed = JSON.parse(cachedStat);
          if (parsed.dateStr === todayUtcStr && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            if (isMounted) setTodayJobInfo(parsed.info);
            return;
          }
        }
      } catch (err) {
        console.debug("Cache read skipped:", err);
      }

      let todayCount = 0;
      let past24hCount = 0;
      const seenJobIds = new Set();

      const inspectJobDoc = (data, id) => {
        if (!data || (id && seenJobIds.has(id))) return;
        if (id) seenJobIds.add(id);

        const jobTime = getJobTimestamp(data) || 0;
        const isDateToday = data.date === todayLocalStr || data.date === todayUtcStr;
        const isTimeToday = jobTime >= minTodayMs;
        const isCreatedStrToday =
          typeof data.createdAt === "string" &&
          (data.createdAt.startsWith(todayLocalStr) || data.createdAt.startsWith(todayUtcStr));

        if (isDateToday || isTimeToday || isCreatedStrToday) {
          todayCount++;
        } else if (jobTime >= past24Hours) {
          past24hCount++;
        }
      };

      try {
        // 1. Try querying jobs matching today's date field
        try {
          const dateQueries = [todayUtcStr];
          if (todayLocalStr !== todayUtcStr) dateQueries.push(todayLocalStr);
          const qDate = query(collection(db, "jobs"), where("date", "in", dateQueries));
          const dateSnap = await getDocs(qDate);
          dateSnap.docs.forEach((d) => inspectJobDoc(d.data(), d.id));
        } catch (e) {
          console.debug("Date query fallback:", e);
        }

        // 2. Query recent jobs by createdAt to count all recent additions
        const qRecent = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(150)
        );
        const recentSnap = await getDocs(qRecent);
        recentSnap.docs.forEach((d) => inspectJobDoc(d.data(), d.id));

        // 3. Also inspect jobs in pageCache if already loaded
        Object.values(pageCache).forEach((pageJobs) => {
          if (Array.isArray(pageJobs)) {
            pageJobs.forEach((j) => inspectJobDoc(j, j.id));
          }
        });

        if (!isMounted) return;

        let newInfo;
        if (todayCount > 0) {
          newInfo = { count: todayCount, isToday: true };
        } else if (past24hCount > 0) {
          newInfo = { count: past24hCount, isToday: false, isPast24h: true };
        } else {
          newInfo = { count: 0, isToday: true };
        }

        setTodayJobInfo(newInfo);
        try {
          sessionStorage.setItem(
            "gjl_today_job_stat",
            JSON.stringify({ timestamp: Date.now(), dateStr: todayUtcStr, info: newInfo })
          );
        } catch (err) {
          console.debug("Cache write skipped:", err);
        }
      } catch (err) {
        console.warn("Could not calculate today jobs count:", err);
        if (isMounted) {
          let localToday = 0;
          Object.values(pageCache).forEach((pageJobs) => {
            if (Array.isArray(pageJobs)) {
              pageJobs.forEach((j) => {
                const jt = getJobTimestamp(j) || 0;
                if (j.date === todayLocalStr || j.date === todayUtcStr || jt >= minTodayMs) localToday++;
              });
            }
          });
          setTodayJobInfo({ count: localToday, isToday: true });
        }
      }
    }

    calculateTodayJobs();

    return () => {
      isMounted = false;
    };
  }, [pageCache]);

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
      if (!matchesExperienceFilter(job.experience, filters.experience)) {
        return false;
      }
    }

    // 4. Job Type
    if (filters.employmentType) {
      const type = (job.jobType || "").toLowerCase().replace("-", " ").trim();
      const targetType = filters.employmentType.toLowerCase().replace("-", " ").trim();
      if (!type.includes(targetType)) {
        return false;
      }
    }

    // 5. Work mode
    if (filters.workMode) {
      const isRem = isRemoteJob(job);
      const loc = (job.location || "").toLowerCase();
      if (filters.workMode === "remote" && !isRem) return false;
      if (filters.workMode === "onsite" && isRem) return false;
      if (filters.workMode === "hybrid" && !loc.includes("hybrid") && !String(job.title).toLowerCase().includes("hybrid")) return false;
    }

    // 6. Country
    if (filters.country) {
      const loc = (job.location || "").toLowerCase();
      const c = filters.country.toLowerCase();
      if (c === "india") {
        if (!isIndiaJob(job)) return false;
      } else {
        if (!loc.includes(c)) return false;
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
      const timeMs = getJobTimestamp(job);
      if (timeMs) {
        const diffMs = Date.now() - timeMs;
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
        const maxAttempts = 5; // Fast fetch limit scanning up to 500 documents

        // Increased batch size for single-roundtrip fast loading
        const BATCH_SIZE = 100;

        while (collected.length < PAGE_SIZE && !hitEnd && attempts < maxAttempts) {
          attempts++;

          let q = query(
            collection(db, "jobs"),
            where("createdAt", ">=", 0),
            orderBy("createdAt", "desc"),
            limit(BATCH_SIZE)
          );

          if (lastDocSnapshot) {
            q = query(
              collection(db, "jobs"),
              where("createdAt", ">=", 0),
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

        // Strictly sort collected jobs newest first so newest added is always on top
        collected.sort((a, b) => (getJobTimestamp(b) || 0) - (getJobTimestamp(a) || 0));

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

  // Real-time live synchronization for new job postings: updates feed automatically without page refresh
  useEffect(() => {
    let isMounted = true;
    let isInitialSnapshot = true;

    // Listen to the latest 40 jobs in real-time
    const liveQuery = query(
      collection(db, "jobs"),
      where("createdAt", ">=", 0),
      orderBy("createdAt", "desc"),
      limit(40)
    );

    const unsubscribe = onSnapshot(
      liveQuery,
      (snapshot) => {
        if (!isMounted) return;

        // Skip notifying on initial load, only handle live updates
        if (isInitialSnapshot) {
          isInitialSnapshot = false;
          return;
        }

        const changes = snapshot.docChanges();
        if (changes.length === 0) return;

        let hasNewMatchingJobs = false;
        let latestJobTitle = "";
        let latestJobCompany = "";

        setPageCache((prevCache) => {
          const currentPage1Jobs = [...(prevCache[1] || [])];
          let updated = false;

          changes.forEach((change) => {
            const data = { id: change.doc.id, ...change.doc.data() };

            if (change.type === "added") {
              setTodayJobInfo((prev) => {
                if (!prev) return { count: 1, isToday: true };
                return { ...prev, count: (prev.count || 0) + 1, isToday: true };
              });
              if (matchJob(data)) {
                const existingIndex = currentPage1Jobs.findIndex((j) => j.id === data.id);
                if (existingIndex === -1) {
                  currentPage1Jobs.unshift(data);
                  hasNewMatchingJobs = true;
                  latestJobTitle = data.title || "New Opening";
                  latestJobCompany = data.company || "";
                  updated = true;
                }
              }
            } else if (change.type === "modified") {
              const existingIndex = currentPage1Jobs.findIndex((j) => j.id === data.id);
              if (existingIndex !== -1) {
                if (matchJob(data)) {
                  currentPage1Jobs[existingIndex] = data;
                } else {
                  currentPage1Jobs.splice(existingIndex, 1);
                }
                updated = true;
              }
            } else if (change.type === "removed") {
              const existingIndex = currentPage1Jobs.findIndex((j) => j.id === data.id);
              if (existingIndex !== -1) {
                currentPage1Jobs.splice(existingIndex, 1);
                updated = true;
              }
            }
          });

          if (!updated) return prevCache;

          // Always ensure newest first
          currentPage1Jobs.sort((a, b) => (getJobTimestamp(b) || 0) - (getJobTimestamp(a) || 0));

          return {
            ...prevCache,
            1: currentPage1Jobs,
          };
        });

        if (hasNewMatchingJobs) {
          showToast(
            `⚡ New opening live: "${latestJobTitle}"${latestJobCompany ? ` at ${latestJobCompany}` : ""}!`,
            "info"
          );
          setTodayJobInfo((prev) =>
            prev ? { ...prev, count: prev.count + 1 } : { count: 1, isToday: true }
          );
        }
      },
      (err) => {
        console.error("Live jobs listener error:", err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [matchJob, showToast]);

  const currentJobs = useMemo(() => {
    return pageCache[currentPage] || [];
  }, [pageCache, currentPage]);

  // Toggle individual job selection for admin LinkedIn batch sharing
  const handleToggleSelectJob = useCallback((jobId) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  }, []);

  // Quick preset batch selection
  const handleSelectBatch = useCallback((count) => {
    if (!currentJobs || currentJobs.length === 0) return;
    if (count === "all") {
      setSelectedJobIds(new Set(currentJobs.map((j) => j.id)));
      setCustomSelectCount(String(currentJobs.length));
    } else if (count === "clear") {
      setSelectedJobIds(new Set());
      setCustomSelectCount("0");
    } else {
      const num = Math.min(Number(count) || 1, currentJobs.length);
      setSelectedJobIds(new Set(currentJobs.slice(0, num).map((j) => j.id)));
      setCustomSelectCount(String(num));
    }
  }, [currentJobs]);

  const handleApplyCustomSelect = (e) => {
    e.preventDefault();
    const num = parseInt(customSelectCount, 10);
    if (!isNaN(num) && num > 0) {
      handleSelectBatch(num);
    }
  };

  const handleQuickCopySelected = async () => {
    if (!currentJobs || currentJobs.length === 0) return;
    const baseUrl = window.location.origin;

    const targetJobs =
      selectedJobIds.size > 0
        ? currentJobs.filter((j) => selectedJobIds.has(j.id))
        : currentJobs.slice(0, 10);

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
      const displaySal = formatDisplaySalary(job.salary);
      if (displaySal) {
        lines.push(`   💰 Salary: ${displaySal}`);
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
      showToast(`${targetJobs.length} jobs copied for LinkedIn!`);
      setTimeout(() => setQuickCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Could not copy jobs", "error");
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased pb-16 transition-colors duration-150">
      {/* Dynamic SEO Meta Tags & Schema */}
      <SEO
        title={categoryHeader.seoTitle}
        description={categoryHeader.seoDesc}
        canonicalUrl={categoryHeader.canonical}
        jsonLd={homeJsonLd}
      />

      {/* Top Notification Bar: Jobs Added Today */}
      {showNotification && todayJobInfo && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-xs border-b border-blue-400/20 py-2.5 px-4 text-xs sm:text-sm transition-all duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <div className="flex items-center space-x-2 flex-wrap min-w-0">
                <span className="font-extrabold text-amber-300 tracking-tight">
                  {todayJobInfo.count > 0 ? (
                    `${todayJobInfo.count} ${todayJobInfo.count === 1 ? "Job" : "Jobs"} Added ${todayJobInfo.isToday ? "Today" : "in the Last 24h"}`
                  ) : (
                    "0 Jobs Added Today (Updated live)"
                  )}
                </span>
                <span className="text-blue-200 hidden sm:inline">•</span>
                <span className="text-blue-100 text-xs hidden sm:inline truncate">
                  Direct authenticated ATS openings from top verified companies
                </span>
              </div>
            </div>
            <button
              onClick={handleDismissNotification}
              className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-3"
              aria-label="Dismiss notification"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category Hero / Title Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 sm:py-10 transition-colors duration-150">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <span>{categoryHeader.badge}</span>
                </div>
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span>Live Feed Active</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {categoryHeader.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                {categoryHeader.description}
              </p>
            </div>

            {/* Category Quick Pill Selector */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0 self-start md:self-auto">
              <Link
                to="/jobs/india"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "india"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>India</span>
              </Link>
              <Link
                to="/jobs/world"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "world"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>World</span>
              </Link>
              <Link
                to="/jobs/remote"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  category === "remote"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 mb-6 text-rose-800 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setPageCache({});
                setCurrentPage(1);
              }}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold rounded-lg text-xs hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
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
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 min-h-[82px] animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1 pr-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
                  </div>
                </div>
                <div className="w-12 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : currentJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs my-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No job openings found matching your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
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
            {/* Batch LinkedIn Share Toolbar - ADMIN ONLY */}
            {isAdmin && (
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-900/60 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-md space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                      Admin Curation
                    </span>
                    <span className="text-xs font-semibold text-blue-100">
                      {selectedJobIds.size} of {currentJobs.length} selected for LinkedIn
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-blue-200 mr-1 hidden sm:inline font-medium">Select:</span>
                    {[5, 10, 15, 20, "all"].map((val) => {
                      const isSelected =
                        val === "all"
                          ? selectedJobIds.size === currentJobs.length && currentJobs.length > 0
                          : selectedJobIds.size === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleSelectBatch(val)}
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-amber-400 text-slate-900 shadow-2xs"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {val === "all" ? `All (${currentJobs.length})` : `Top ${val}`}
                        </button>
                      );
                    })}

                    <form onSubmit={handleApplyCustomSelect} className="flex items-center space-x-1 pl-1">
                      <input
                        type="number"
                        min="1"
                        max={currentJobs.length}
                        value={customSelectCount}
                        onChange={(e) => setCustomSelectCount(e.target.value)}
                        className="w-12 h-6 px-1 text-center bg-white/20 text-white border border-white/20 rounded-md text-xs font-bold focus:outline-none focus:bg-white focus:text-slate-900"
                        placeholder="N"
                        title="Enter custom number of jobs to select"
                      />
                      <button
                        type="submit"
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-colors"
                      >
                        Pick
                      </button>
                    </form>

                    {selectedJobIds.size > 0 && (
                      <button
                        onClick={() => handleSelectBatch("clear")}
                        className="px-2 py-0.5 text-xs text-blue-300 hover:text-white underline ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-900/60">
                  <span className="text-[11px] text-blue-300">
                    💡 Click checkboxes directly on job cards to cherry-pick specific positions.
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleQuickCopySelected}
                      disabled={selectedJobIds.size === 0 && currentJobs.length === 0}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all disabled:opacity-50"
                      title="Quick copy selected jobs directly to clipboard"
                    >
                      {quickCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Quick Copy {selectedJobIds.size > 0 ? `(${selectedJobIds.size})` : "Top 10"}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all"
                      title="Preview and customize LinkedIn post text"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Preview &amp; Copy for LinkedIn ({selectedJobIds.size > 0 ? selectedJobIds.size : (currentJobs.length > 10 ? 10 : currentJobs.length)})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isAdmin={isAdmin}
                  isSelected={selectedJobIds.has(job.id)}
                  onToggleSelect={handleToggleSelectJob}
                />
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

        {/* LinkedIn Batch Sharing Modal - ADMIN ONLY */}
        {isAdmin && (
          <LinkedInBatchShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            jobs={currentJobs}
            category={category}
            initialSelectedIds={selectedJobIds}
          />
        )}
      </main>
    </div>
  );
}
