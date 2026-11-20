import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { db } from "../firebase";
import {
  normalizeCompanyName,
  createCompanySlug,
  processHiringRadarData,
} from "../utils/hiringRadarAnalytics.js";
import {
  getCompanyColor,
  getCompanyInitials,
  timeAgo,
  getApplyUrl,
} from "../utils/jobClassification";
import SEO from "../components/SEO";

export default function CompanyIntelligencePage() {
  const { companySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCompanyData() {
      if (!companySlug) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Try to read pre-aggregated company document from Firestore
        let compSnap = null;
        try {
          compSnap = await getDoc(doc(db, "company_analytics", companySlug));
        } catch (e) {
          console.warn("Could not read company_analytics document:", e);
        }

        if (compSnap && compSnap.exists()) {
          const compData = compSnap.data();
          if (isMounted) {
            setCompany(compData);
            if (compData.recentJobs && compData.recentJobs.length > 0) {
              setCompanyJobs(compData.recentJobs);
            }
          }
        }

        // 2. Query jobs collection for all active jobs belonging to this company
        const snap = await getDocs(collection(db, "jobs"));
        if (!isMounted) return;

        const matchedJobs = [];
        snap.docs.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          const norm = normalizeCompanyName(data.company);
          const slug = createCompanySlug(norm);
          if (slug === companySlug) {
            matchedJobs.push(data);
          }
        });

        // Sort descending by date
        matchedJobs.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0;
          return tB - tA;
        });

        if (isMounted) {
          setCompanyJobs(matchedJobs);
          // If company wasn't in pre-aggregated collection, derive it live from matched jobs
          if (!compSnap || !compSnap.exists()) {
            if (matchedJobs.length > 0) {
              const fullAgg = processHiringRadarData(matchedJobs);
              const derived = fullAgg.companyDict[companySlug] || fullAgg.companies[0];
              setCompany(derived);
            } else {
              setError("No hiring data found for this company on GetJobLink.");
            }
          }
        }
      } catch (err) {
        console.error("Error loading company intelligence:", err);
        if (isMounted) {
          setError("Failed to load company profile. Please try refreshing.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCompanyData();

    return () => {
      isMounted = false;
    };
  }, [companySlug]);

  const companyName = company?.companyName || (companySlug ? companySlug.replace(/-/g, " ") : "Company");
  const color = getCompanyColor(companyName);
  const initials = getCompanyInitials(companyName);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-20">
      <SEO
        title={`${companyName} Hiring Radar & Open Tech Jobs | GetJobLink`}
        description={`Explore verified job openings, in-demand technical skills, and hiring activity trends for ${companyName} on GetJobLink.`}
        canonicalUrl={`https://getjoblink.in/hiring-radar/company/${companySlug}`}
      />

      {/* Top Breadcrumb Header */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/hiring-radar"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hiring Radar</span>
          </Link>

          {/* Company Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-2xl ${color.bg} ${color.text} ${color.border} border flex items-center justify-center font-black text-xl shadow-xs shrink-0`}
              >
                {initials}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {companyName}
                  </h1>
                  {company?.trend && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {company.trend}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center space-x-2">
                  <span>Hiring Intelligence &amp; Verified Job Openings</span>
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Listings</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {companyJobs.length || company?.activeJobs || 0} Openings
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Added (7d)</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  +{company?.jobsLast7d || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {loading && (
          <div className="space-y-4">
            <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">{error}</h2>
            <Link
              to="/hiring-radar"
              className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>Explore all hiring companies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {!loading && company && (
          <>
            {/* Intelligence Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Hiring Locations */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hiring Locations</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {company.locations && company.locations.length > 0 ? (
                    company.locations.map((loc) => (
                      <span key={loc} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {loc}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Locations disclosed per listing</span>
                  )}
                </div>
              </div>

              {/* Card 2: Most Common Skills */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Top Required Skills</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {company.topSkills && company.topSkills.length > 0 ? (
                    company.topSkills.map((skill) => (
                      <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Engineering skills specified in job descriptions</span>
                  )}
                </div>
              </div>

              {/* Card 3: Hiring Observation Dates */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ingestion Timeline</span>
                </span>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div>
                    <span className="text-slate-400">First observed: </span>
                    <strong className="text-slate-800">
                      {company.firstObservedAt ? new Date(company.firstObservedAt).toLocaleDateString() : "Active this period"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Last job added: </span>
                    <strong className="text-slate-800">
                      {company.lastJobAddedAt ? timeAgo(company.lastJobAddedAt) : "Recently"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Job Openings List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Active Job Openings at {companyName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct authenticated employer links verified by GetJobLink
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {companyJobs.length} {companyJobs.length === 1 ? "Listing" : "Listings"}
                </span>
              </div>

              <div className="space-y-3">
                {companyJobs.map((job) => {
                  const applyUrl = getApplyUrl(job);

                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/job/${job.id}`}
                            className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate hover:underline"
                          >
                            {job.title}
                          </Link>
                          {job.isRemote && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 uppercase">
                              Remote
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{job.location || "India"}</span>
                          </span>
                          {job.experience && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[11px]">
                                {job.experience}
                              </span>
                            </>
                          )}
                          {job.salary && job.salary !== "null" && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-emerald-700 font-semibold text-[11px]">
                                {job.salary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <Link
                          to={`/job/${job.id}`}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          Details &amp; ATS
                        </Link>
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
