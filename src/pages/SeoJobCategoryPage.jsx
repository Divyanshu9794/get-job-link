import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";
import { db } from "../firebase";
import JobCard from "../components/JobCard";
import SEO from "../components/SEO";

// Curated high-intent SEO category configurations
const SEO_CATEGORIES = {
  fresher: {
    title: "Fresher Software Engineer & Tech Jobs in India (2026)",
    heading: "Verified Fresher Tech Jobs & Graduate Roles",
    metaDescription: "Explore verified fresher software engineering jobs and 0-1 year tech opportunities in India. 100% direct company career portals with no application fees or recruiter spam.",
    intro: "Finding your first software engineering role can be challenging when job boards are cluttered with multi-year requirements and recruiter intermediaries. GetJobLink indexes direct graduate trainee, associate engineer, and junior developer openings from top Indian product companies and verified global tech teams.",
    filterFn: (job) => {
      const exp = (job.experience || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      return exp.includes("fresher") || exp.includes("0") || exp.includes("entry") || title.includes("trainee") || title.includes("graduate");
    },
    topSkills: ["Data Structures & Algorithms", "JavaScript", "Python", "Java", "SQL", "Git", "Problem Solving"],
  },
  "software-engineer": {
    title: "Software Engineer Jobs in India & Remote (Verified Openings)",
    heading: "Software Engineer & Developer Opportunities",
    metaDescription: "Apply directly for Software Engineer jobs across Bengaluru, Hyderabad, Pune, and remote teams. Verified ATS career portals, genuine direct links, zero fees.",
    intro: "Browse genuine software engineering positions from verified product firms, unicorns, and high-growth engineering startups. Apply directly through official company ATS portals including Greenhouse, Lever, and Ashby.",
    filterFn: (job) => {
      const title = (job.title || "").toLowerCase();
      return title.includes("software") || title.includes("engineer") || title.includes("developer") || title.includes("sde");
    },
    topSkills: ["System Design", "Microservices", "REST APIs", "AWS", "Docker", "Database Optimization"],
  },
  "react-developer": {
    title: "React.js Developer Jobs: Frontend & UI Engineer Openings",
    heading: "React.js & Frontend Developer Roles",
    metaDescription: "Latest React.js, Next.js, and Frontend Engineering opportunities in India and Worldwide. Direct application links with transparent skill evaluations.",
    intro: "Explore curated frontend opportunities requiring React.js, TypeScript, Next.js, and modern state management. Connect directly with product teams building high-performance web applications.",
    filterFn: (job) => {
      const title = (job.title || "").toLowerCase();
      const skills = (job.skills || "").toLowerCase();
      const jd = (job.jd || "").toLowerCase();
      return title.includes("react") || title.includes("frontend") || skills.includes("react") || jd.includes("react.js");
    },
    topSkills: ["React.js", "TypeScript", "Next.js", "Redux / Zustand", "Tailwind CSS", "Web Performance"],
  },
  "backend-developer": {
    title: "Backend Developer Jobs: Node.js, Java, Python & Golang",
    heading: "Backend Engineer & Distributed Systems Openings",
    metaDescription: "Verified backend engineer opportunities in India and globally. Scalable systems, REST APIs, databases, and cloud architecture jobs with direct application links.",
    intro: "Discover backend developer roles focused on building scalable APIs, distributed microservices, event streaming, and resilient database architectures across modern tech employers.",
    filterFn: (job) => {
      const title = (job.title || "").toLowerCase();
      const skills = (job.skills || "").toLowerCase();
      return title.includes("backend") || title.includes("node") || title.includes("java") || title.includes("python") || skills.includes("backend");
    },
    topSkills: ["Node.js", "Java Spring Boot", "Python / Django", "PostgreSQL", "Kafka", "Docker & Kubernetes"],
  },
  "remote-tech": {
    title: "Remote Tech Jobs: Work from Anywhere Software Roles",
    heading: "100% Remote Tech & Engineering Jobs",
    metaDescription: "Explore verified distributed and remote software engineering jobs. Work from home with global tech teams, competitive compensation, and zero recruiter spam.",
    intro: "Remote tech opportunities offer global compensation and flexible work-from-home options. Every remote position is verified to ensure legitimate direct company applications without paywalls.",
    filterFn: (job) => {
      const loc = (job.location || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      return job.isRemote === true || loc.includes("remote") || loc.includes("anywhere") || title.includes("remote");
    },
    topSkills: ["Async Communication", "Git / GitHub", "Docker", "Cloud (AWS/GCP)", "CI/CD", "Self-Direction"],
  },
  internships: {
    title: "Tech Internships & Software Engineering Intern Roles (2026)",
    heading: "Software Developer Internships & Trainee Openings",
    metaDescription: "Find paid tech internships and developer training positions in India. Direct corporate application links, student friendly, zero intermediary fees.",
    intro: "Kickstart your tech career with verified engineering internships. Explore hands-on product development, mentorship, and full-time conversion opportunities from authentic company career pages.",
    filterFn: (job) => {
      const title = (job.title || "").toLowerCase();
      const type = (job.jobType || "").toLowerCase();
      const exp = (job.experience || "").toLowerCase();
      return title.includes("intern") || type.includes("intern") || exp.includes("intern");
    },
    topSkills: ["Problem Solving", "C++ / Java / Python", "Basic Web Development", "Git", "Algorithms"],
  },
};

export default function SeoJobCategoryPage() {
  const { categorySlug } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const config = SEO_CATEGORIES[categorySlug] || SEO_CATEGORIES.fresher;

  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(150)
        );
        const snap = await getDocs(q);
        if (!isMounted) return;
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading SEO category jobs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  const matchingJobs = useMemo(() => {
    return jobs.filter((job) => {
      const passesCategory = config.filterFn ? config.filterFn(job) : true;
      if (!passesCategory) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const title = (job.title || "").toLowerCase();
      const comp = (job.company || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      return title.includes(term) || comp.includes(term) || loc.includes(term);
    });
  }, [jobs, config, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SEO
        title={config.title}
        description={config.metaDescription}
        canonicalUrl={`/jobs/${categorySlug}`}
      />

      {/* Editorial Category Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Verified Category Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {config.heading}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {matchingJobs.length} live verified opportunities
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/for-you"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize Matches</span>
            </Link>
          </div>
        </div>

        {/* Editorial Guide Snippet */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
          {config.intro}
        </p>

        {/* In-Demand Category Skills */}
        {config.topSkills && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-400 dark:text-slate-500 mr-1">In-Demand Skills:</span>
            {config.topSkills.map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-transparent dark:border-slate-700"
              >
                {sk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search within ${config.heading}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Category switcher links */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold scrollbar-none">
          {Object.keys(SEO_CATEGORIES).map((key) => {
            const isActive = key === categorySlug;
            return (
              <Link
                key={key}
                to={`/jobs/${key}`}
                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap capitalize ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {key.replace("-", " ")}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Job Listings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : matchingJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-3">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No active postings found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or explore all verified Indian tech opportunities.
          </p>
          <Link
            to="/jobs/india"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <span>Browse All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {matchingJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
