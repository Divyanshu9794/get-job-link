import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Briefcase,
  FileText,
  Sparkles,
  Mail,
  Users,
  ArrowRight,
} from "lucide-react";
import SEO from "../components/SEO";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <SEO
        title="About Us & Our Job Curation Mission"
        description="Learn about GetJobLink (getjoblink.in), our mission to eliminate ghost tech jobs, our strict zero-fee policy, and our direct employer application verification."
        canonicalUrl="/about"
      />
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Mission & Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Connecting Talent with Real Opportunities,{" "}
            <span className="text-blue-600">Zero Mediaries.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            GetJobLink (<a href="https://getjoblink.in/" className="text-blue-600 font-semibold hover:underline">getjoblink.in</a>)
            is a modern, clean, transparent tech job board. We curate verified engineering, product,
            and tech roles directly from official company career portals — completely free for job seekers.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Why GetJobLink / The 4 Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Daily Verified Tech Jobs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We monitor hundreds of top tech companies, startups, and remote teams daily. Every
              position is verified for legitimacy before publishing to eliminate ghost jobs and outdated listings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Employer Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No intermediary application forms or resume holding. When you click “Apply Now”,
              you are redirected straight to the employer’s official ATS (Greenhouse, Lever, Workday, SmartRecruiters).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Freshers & Experienced Tech Roles</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Whether you are an aspiring college graduate looking for your first software internship
              or a seasoned Staff Architect looking for high-impact systems work, we categorize roles accurately.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Free Forever, Zero Spam</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We will never charge job seekers any fee, commission, or subscription. We do not sell
              applicant data, send unsolicited recruitment spam, or gate links behind paywalls.
            </p>
          </div>
        </section>

        {/* Free Career Tools Spotlight */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Integrated Free Career Tools</span>
            </h2>
            <p className="text-xs text-slate-500">
              In addition to clean job listings, we provide built-in tools to help you land interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Resume Core Builder</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Craft an ATS-optimized, single-column resume with live preview and instant plain-text download.
                </p>
              </div>
              <Link
                to="/resume"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
              >
                <span>Launch Resume Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">AI ATS Score Evaluator</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your resume in PDF or plain text and compare it with any job description to discover missing keywords and improve match scores.
                </p>
              </div>
              <Link
                to="/ats-checker"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 pt-1"
              >
                <span>Check Your ATS Score</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Contact & Community Details */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Contact & Inquiries</h2>
            <p className="text-xs text-slate-500">
              Have questions, feedback, or a verified opening to feature? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email Support</span>
              </span>
              <a
                href="mailto:getjoblink647@gmail.com"
                className="text-blue-600 hover:underline font-medium block"
              >
                getjoblink647@gmail.com
              </a>
              <span className="text-[11px] text-slate-400">Response within 24–48 hours</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Connect & Follow</span>
              </span>
              <div className="space-y-0.5 text-xs">
                <a
                  href="https://www.linkedin.com/in/getjob-link-b62169334/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium block"
                >
                  LinkedIn
                </a>
                <a
                  href="https://x.com/GetJobLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium block"
                >
                  X (Twitter)
                </a>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Official Domain</span>
              </span>
              <a
                href="https://getjoblink.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium block"
              >
                https://getjoblink.in
              </a>
              <span className="text-[11px] text-slate-400">Verified Web Portal</span>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 text-center space-y-4 shadow-md">
          <h2 className="text-2xl font-black tracking-tight">Ready to Find Your Next Tech Role?</h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
            Browse hundreds of fresh openings across Indian startups, global enterprises, and remote teams.
          </p>
          <div className="pt-2">
            <Link
              to="/jobs/india"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Tech Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
