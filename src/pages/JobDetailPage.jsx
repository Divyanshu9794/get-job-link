import React from "react";
import { useParams, Link } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import {
  ExternalLink, MapPin, Briefcase, Clock3, Currency, Building2,
  Star, Shield, ArrowRight, Calendar, DollarSign, Sparkle
} from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Job not found</h2>
        <p className="text-sm text-slate-500 mt-2">This listing may have been removed.</p>
        <Link to="/jobs" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-slate-700">{job.title}</span>
      </nav>

      <article className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-slate-500">
                {(job.company || "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-sm font-medium text-blue-600 mt-1">{job.company}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${job.isRemote ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {job.isRemote ? "Remote" : "On-site"}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600">{job.jobType || "Full Time"}</span>
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600">{job.experience || "More than 0 year"}</span>
                {job.salary && (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700">{job.salary}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{job.isRemote ? "Remote / Worldwide" : job.domain || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-slate-400" />
              <span>Posted {job.date || "recently"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline: {job.deadline || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Source: {job.source || "Company Careers"}</span>
            </div>
          </div>

          {(job.skills && job.skills.length > 0) && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg">{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{job.jd || "No description provided."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Responsibilities</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{job.responsibilities || "Responsibilities will be shared by the employer."}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Requirements</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{job.requirements || "Requirements will be shared by the employer."}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Nice-to-have</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{job.niceToHave || "No nice-to-have skills listed."}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Benefits</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{job.benefits || "Benefits will be shared by the employer."}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-colors"
            >
              Apply on Company Website
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <p className="mt-3 text-[11px] text-slate-400 text-center">
              You will be redirected to the company's official application page. GetJobLink is a third-party aggregator.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}