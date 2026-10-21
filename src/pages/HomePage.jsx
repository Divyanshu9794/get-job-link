import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { Link } from "react-router-dom";
import { Briefcase, Globe, BookOpen, Search, Settings, Sparkle } from "lucide-react";
import logoImg from "../assets/logo.jpeg";
import { normalizeSkills } from "../utils/skills";
import ShareMenu from "../components/ShareMenu";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { jobs, loading } = useJobs();

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    return (
      [job.title, job.company, job.jd, ...normalizeSkills(job.skills)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <section className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-none text-slate-900 tracking-tight">
                Find Your Next Opportunity
              </h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                Discover verified tech and non-tech jobs from top companies, all in one place. Skip the recruiter black hole and land your next offer faster.
              </p>

              {/* Search & CTA Row */}
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div>
                  <input
                    type="text"
                    placeholder="Job title, skill, or keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <select
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Location (optional)</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (searchTerm) params.set("q", searchTerm);
                      window.location.href = `/jobs?${params.toString()}`;
                    }}
                    className="w-full bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search Jobs
                  </button>
                </div>
              </div>

              {/* Quick Category Chips */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                {["Software Engineering", "Data & AI", "Product", "Design", "Cybersecurity", "Cloud", "DevOps", "Business", "Finance", "HR", "Marketing", "Operations", "Freshers"].map((label, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("q", label);
                      window.location.href = `/jobs?${params.toString()}`;
                    }}
                    className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Featured Jobs Preview */}
              {!loading && filteredJobs.length > 0 && (
                <>
                  <h2 className="mt-8 text-lg font-semibold text-slate-900">Featured Opportunities</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-xl transition-shadow relative">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <Link to={`/job/${job.id}`}>
                              <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            </Link>
                            <p className="text-sm text-blue-600 line-clamp-1">{job.company}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded shrink-0 ${
                            job.isRemote ? "bg-emerald-100 text-emerald-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {job.isRemote ? "Remote" : "On-site"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                          {job.jd?.substring(0, 80)}...
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[job.jobType, job.experience, job.salary]
                            .filter(Boolean)
                            .map((badge, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded"
                              >
                                {badge}
                              </span>
                            ))}
                        </div>
                        {normalizeSkills(job.skills).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {normalizeSkills(job.skills).slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] bg-slate-50 text-slate-500 rounded border border-slate-100"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <ShareMenu job={job} />
                          <Link
                            to={`/job/${job.id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            View Job →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar Stats & CTAs */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="space-y-6">
                <div className="text-center pt-2">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-slate-500">{jobs.length}+ Active Opportunities</p>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/jobs"
                    className="w-full bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Explore All Jobs
                  </Link>

                  <Link
                    to="/resume"
                    className="w-full border-2 border-dashed border-blue-500 text-blue-600 px-6 py-3 font-medium rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Build Your Resume
                  </Link>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Globe className="w-3.5 h-3.5 text-slate-400 mr-2" />
                    <span>Global opportunities with direct apply links</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkle className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    <span>Updated daily with verified listings</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-3.5 h-3.5 text-slate-400 mr-2" />
                    <span>Admin dashboard for job management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}