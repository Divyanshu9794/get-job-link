import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Sparkles,
  Mail,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Heart,
  Radio,
  Award,
} from "lucide-react";
import SEO from "../components/SEO";

export default function AboutPage() {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-20">
      <SEO
        title="About GetJobLink | Built by Divyanshu Singh"
        description="Discover the story behind GetJobLink, an independently built tech job discovery platform by Divyanshu Singh."
        canonicalUrl="/about"
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Mission &amp; Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Connecting Talent with Real Opportunities,{" "}
            <span className="text-blue-600">Zero Mediaries.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            GetJobLink (<a href="https://getjoblink.in/" className="text-blue-600 font-semibold hover:underline">getjoblink.in</a>)
            is a modern, clean, transparent tech job discovery platform. We curate verified engineering, product,
            and tech roles directly from official company career portals — completely free for job seekers.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200/90 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Independently built and maintained by Divyanshu Singh</span>
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* ========================================================================= */}
        {/* SECTION: MEET THE BUILDER                                                 */}
        {/* ========================================================================= */}
        <section id="meet-the-builder" className="scroll-mt-24 space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5" />
              <span>Independent Craftsmanship</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Meet the Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built independently. Driven by a mission to make tech opportunities easier to discover.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Profile Image / Avatar */}
              <div className="relative shrink-0">
                {!avatarError ? (
                  <img
                    src="https://github.com/Divyanshu9794.png"
                    alt="Divyanshu Singh — Founder & Independent Developer of GetJobLink"
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                    DS
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  Active
                </span>
              </div>

              {/* Developer Details & Biography */}
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Divyanshu Singh
                    </h3>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Founder &amp; Independent Developer
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Software Engineer &amp; Full Stack Developer
                  </p>
                </div>

                {/* Introduction Text */}
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  <p>
                    Hi, I&apos;m <strong>Divyanshu Singh</strong>, the independent developer behind <strong>GetJobLink</strong>.
                  </p>
                  <p>
                    I started GetJobLink with a simple goal: make discovering genuine technology and engineering opportunities easier for job seekers.
                  </p>
                  <p>
                    I wanted to build a platform where candidates can explore direct company hiring links without recruiter spam, unnecessary intermediaries or application fees.
                  </p>
                  <p>
                    I independently build, improve and maintain GetJobLink while continuously introducing features that help candidates throughout their job search journey.
                  </p>
                </div>

                {/* Social & Public Profile Links */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <a
                    href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a>

                  <a
                    href="https://github.com/Divyanshu9794/Get_job_Link_Android-App"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>GitHub Repository</span>
                  </a>

                  <a
                    href="https://getjoblink.in"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>getjoblink.in</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Prominent Ownership Statement */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-extrabold text-slate-900 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>GetJobLink is independently built and maintained by Divyanshu Singh.</span>
              </span>
              <span className="text-[11px] text-slate-400">100% Bootstrapped &bull; Free For Job Seekers</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: BEHIND GETJOBLINK                                                */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture &amp; Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Behind GetJobLink
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              How the platform works, why it exists, and the engineering principles powering it.
            </p>
          </div>

          {/* Subsection 1: Why I Built It */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Why I Built It</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Job searching in tech has become unnecessarily noisy. Candidates spend hours clicking on job links only to encounter closed positions, recruiter gatekeepers demanding registration fees, or platforms collecting resumes without routing to real companies.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              I built GetJobLink to fix this broken experience. Every job on the platform links directly to an authenticated employer Applicant Tracking System (ATS)—such as Greenhouse, Lever, Workday, or SmartRecruiters. Candidates apply straight to the hiring company with zero intermediaries, zero subscription paywalls, and zero recruiter spam.
            </p>
          </div>

          {/* Subsection 2: What Makes GetJobLink Different */}
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              What Makes GetJobLink Different
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Direct ATS Application Links</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every &ldquo;Apply Now&rdquo; button routes directly to the company&apos;s authenticated ATS portal with zero intermediary resume storage.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">100% Free &amp; Zero Recruiter Spam</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Strict zero-fee policy. We never charge candidates, sell candidate data, or gate application links behind subscription walls.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Real-Time Hiring Radar</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transforms job database records into transparent hiring intelligence: company posting velocity, in-demand skills, and newly discovered employers.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Integrated ATS Checker &amp; Resume Builder</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Run instant keyword screening evaluations against real job descriptions and build clean, single-column ATS-friendly resumes.
                </p>
              </div>
            </div>
          </div>

          {/* Subsection 3: Technology Behind the Platform */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Technology Behind the Platform</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modern, high-performance web and mobile stack powering GetJobLink&apos;s daily operations
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">React 19 &amp; Vite 8</span>
                <span className="text-[11px] text-slate-500">Modern single-page application with code-split routing</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Tailwind CSS v4</span>
                <span className="text-[11px] text-slate-500">Accessible, responsive, design-system-driven UI</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Firebase Firestore</span>
                <span className="text-[11px] text-slate-500">Real-time NoSQL database with strict security rules</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Cloud Functions</span>
                <span className="text-[11px] text-slate-500">Serverless background aggregation &amp; ATS evaluation</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Firebase Auth</span>
                <span className="text-[11px] text-slate-500">Google OAuth 2.0 with role-based access control</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">PDF.js Text Parsing</span>
                <span className="text-[11px] text-slate-500">In-browser resume PDF extraction without server uploads</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Firebase Hosting</span>
                <span className="text-[11px] text-slate-500">Global SSL CDN with sub-second page delivery</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Android Mobile App</span>
                <span className="text-[11px] text-slate-500">Native mobile client for tech job alerts</span>
              </div>
            </div>
          </div>

          {/* Subsection 4: Built and Improved Continuously */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Built &amp; Improved Continuously</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The continuous evolution of GetJobLink from a simple link curator to a hiring intelligence platform
              </p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Hiring Radar &amp; Market Intelligence</span>
                  <p className="text-slate-500 leading-relaxed">
                    Launched public company hiring velocity rankings, in-demand skill timelines, and company intelligence profiles.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Integrated ATS Evaluator &amp; Resume Core</span>
                  <p className="text-slate-500 leading-relaxed">
                    Introduced in-browser PDF parsing and keyword matching benchmarks to help freshers and engineers tailor their applications.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Direct ATS Verification Protocol</span>
                  <p className="text-slate-500 leading-relaxed">
                    Standardized direct routing to employer ATS platforms (Greenhouse, Lever, Workday) with zero candidate fees.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Initial Inception &amp; Open Curation</span>
                  <p className="text-slate-500 leading-relaxed">
                    Founded by Divyanshu Singh to eliminate recruiter spam and provide clean daily engineering job opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Community Details */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Contact &amp; Inquiries</h2>
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
                <span>Founder Connect</span>
              </span>
              <div className="space-y-0.5 text-xs">
                <a
                  href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium block"
                >
                  LinkedIn (Divyanshu Singh)
                </a>
                <a
                  href="https://github.com/Divyanshu9794/Get_job_Link_Android-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium block"
                >
                  GitHub Project
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
