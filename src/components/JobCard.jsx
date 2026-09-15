import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job, onShare, onApply }) {
  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-slate-300 flex flex-col">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-slate-500">
                {(job.company || "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">{job.title}</h3>
              <p className="text-sm font-medium text-blue-600 truncate">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label="Save job"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            {onShare && (
              <button
                onClick={() => onShare(job)}
                aria-label="Share job"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="6.51" x2="15.41" y2="10.49"></line>
                  <line x1="15.41" y1="13.51" x2="8.59" y2="17.49"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${job.isRemote ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {job.isRemote ? "Remote" : "On-site"}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600">
            {job.jobType || "Full Time"}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600">
            {job.experience || "More than 0 year"}
          </span>
          {job.salary && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700">
              {job.salary}
            </span>
          )}
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-purple-50 text-purple-700">
            {(job.domain || "Engineering").toLowerCase() === "technical" ? "Technical" : "Non-tech"}
          </span>
          {job.fresherFriendly && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-50 text-amber-700">
              Fresher Friendly
            </span>
          )}
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mt-3 leading-relaxed">
          {job.jd || "No description provided."}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(job.skills || []).slice(0, 4).map((skill, idx) => (
            <span key={idx} className="px-2 py-0.5 text-[11px] bg-slate-50 text-slate-500 rounded-md border border-slate-100">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{job.date || "Recently"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/job/${job.id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Job
          </Link>
          <button
            onClick={onApply}
            className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          >
            <span>Apply</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}