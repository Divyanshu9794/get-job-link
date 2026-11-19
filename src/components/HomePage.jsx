import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Heart,
  Calendar,
  Briefcase,
  Sparkles,
  FileText,
  Eye,
} from "lucide-react";

export default function HomePage({ jobsCount }) {
  const now = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.jpeg" alt="GetJobLink Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">GetJobLink</h1>
              <p className="text-sm sm:text-base mt-2 text-blue-200 max-w-xl">
                The free job board for tech openings across India. Fresh verified listings updated daily —
                no fees, no spam, no hidden charges for job seekers.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <a href="#jobs" className="inline-flex items-center space-x-1.5 bg-white text-slate-900 hover:bg-slate-100 text-sm font-semibold px-4 py-2 rounded-xl shadow-md transition-colors">
              Explore Jobs <ExternalLink className="w-4 h-4" />
            </a>
            <a href="#builder" className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Resume Builder <FileText className="w-4 h-4" />
            </a>
            <a href="#checker" className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              ATS Checker <Sparkles className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* FEATURE BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-start space-x-3 text-sm text-slate-700">
            <span className="font-bold text-slate-900">Daily Fresh Listings</span>
            <span>Verified tech openings refreshed every day.</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            ["100% Free", "Never charge job seekers anything."],
            ["No Spam", "Clean listings only — real employers only."],
            ["Direct Apply", "Links lead straight to the employer's career page."],
          ].map(([title, desc]) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOB COUNT + WHY SECTION */}
      <section id="jobs" className="bg-white max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Active Job Listings <span className="text-base text-slate-400 font-normal">— live right now</span>
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              We aggregate fresh tech openings from verified employers across India. Right now,
              {jobsCount} positions are open. Start exploring below.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
              <span className="text-3xl font-extrabold text-blue-600">{jobsCount}</span>
              <span className="text-sm text-blue-500 ml-1">active listings available</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Why GetJobLink
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Reliability first — every listing links back to the original employer.</span>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span>End-to-end encryption and server-side Firestore sync make updates instant.</span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Mobile-first layout works great on phones, tablets, and desktops.</span>
              </li>
              <li className="flex items-start gap-3">
                <ExternalLink className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                <span>Zero cost to browse. Zero risk of hidden fees.</span>
              </li>
            </ul>

            <div className="mt-8 space-y-3">
              <a href="#privacy" className="inline-flex items-center space-x-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                Privacy Policy <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#terms" className="inline-flex items-center space-x-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                Terms of Use <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#about" className="inline-flex items-center space-x-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                About Us <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 mt-12 py-8 text-center text-xs text-slate-400">
        <p>© {now} GetJobLink · Free tech job board for India</p>
        <p className="mt-1">Built with React + Firebase · No job seekers ever pay a dime.</p>
      </footer>
    </div>
  );
}
