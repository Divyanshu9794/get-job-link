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
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SEO from "../components/SEO";

export default function AboutPage() {
  const [showFullResume, setShowFullResume] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased pb-20 transition-colors duration-150">
      <SEO
        title="About GetJobLink | Built by Divyanshu Singh"
        description="Discover the story behind GetJobLink, an independently built tech job discovery platform by Divyanshu Singh."
        canonicalUrl="/about"
      />

      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 transition-colors duration-150">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Mission &amp; Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Connecting Talent with Real Opportunities,{" "}
            <span className="text-blue-600 dark:text-blue-400">Zero Mediaries.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            GetJobLink (<a href="https://getjoblink.in/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">getjoblink.in</a>)
            is a modern, clean, transparent tech job discovery platform. We curate verified engineering, product,
            and tech roles directly from official company career portals — completely free for job seekers.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-semibold">
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
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5" />
              <span>Independent Craftsmanship</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Meet the Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Built independently. Driven by a mission to make tech opportunities easier to discover.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-150">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Clean Avatar Badge Placeholder (No external photo) */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 ring-2 ring-blue-100 dark:ring-blue-950">
                  DS
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  Active
                </span>
              </div>

              {/* Developer Details & Biography */}
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Divyanshu Singh
                    </h3>
                    <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Founder &amp; Independent Developer
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Software Engineer • React.js • Node.js • Azure • Power Platform
                  </p>
                </div>

                {/* Introduction Quote */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
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

                {/* Social & Contact Links */}
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
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://github.com/Divyanshu9794/get-job-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>GitHub Repo</span>
                  </a>

                  <a
                    href="mailto:sdivyanshu352@gmail.com"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email</span>
                  </a>

                  <a
                    href="https://leetcode.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs font-bold transition-colors"
                  >
                    <span>LeetCode</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Prominent Ownership Statement */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>GetJobLink is independently built and maintained by Divyanshu Singh.</span>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">100% Free For Job Seekers</span>
            </div>
          </div>

          {/* Developer Background, Experience & Credentials Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Engineering Experience &amp; Credentials</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Professional software engineering track record and technical background
                </p>
              </div>

              <button
                onClick={() => setShowFullResume(!showFullResume)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-1"
              >
                <span>{showFullResume ? "Compact View" : "View Full Details"}</span>
                {showFullResume ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Analyst - Software Engineer
                    </h4>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">HCLTech</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500"> • Lucknow, Uttar Pradesh</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    Nov 2024 – Present
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  <li>
                    Engineered and delivered 2+ enterprise-grade web applications using React.js, Node.js, and Azure App Service, managing the complete software development lifecycle from implementation to deployment.
                  </li>
                  <li>
                    Built responsive React.js user interfaces and developed RESTful APIs using Node.js and Express.js to support scalable business applications.
                  </li>
                  <li>
                    Designed and integrated Logic Apps and Power Automate workflows for automated data collection, processing, and third-party API integrations.
                  </li>
                  <li>
                    Deployed, monitored, and maintained applications on Microsoft Azure App Service, ensuring high availability, security, and performance.
                  </li>
                  <li>
                    Integrated SharePoint, SQL Server, and external APIs with authentication, authorization, and role-based access control (RBAC).
                  </li>
                </ul>
              </div>

              {/* Education & Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Education */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Education</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      B.Tech in Computer Science with Honors
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      United College of Engineering and Research (UCER)
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>Prayagraj, UP (Jul 2024)</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        CGPA: 8.36 / 10
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Honors & Recognitions */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Key Recognitions</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Rising Star Award - HCLTech</strong>: Awarded within 6 months of joining for outstanding performance.
                    </li>
                    <li>
                      <strong>GATE 2024 Qualified</strong>: Graduate Aptitude Test in Engineering (CS).
                    </li>
                    <li>
                      <strong>Amazon Summer ML School 2023</strong>: Selected for Amazon&apos;s machine learning program.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Technical Skills Pill Grid */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Core Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-900/60">
                    React.js
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-900/60">
                    Node.js &amp; Express
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-900/60">
                    JavaScript / TypeScript
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-900/60">
                    Microsoft Azure
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-900/60">
                    Firebase &amp; Firestore
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                    Power Automate &amp; Logic Apps
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                    SQL Server &amp; MongoDB
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                    Kotlin &amp; Android Studio
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                    REST APIs &amp; RBAC
                  </span>
                </div>
              </div>

              {/* Collapsible Extended Projects & Certifications */}
              {showFullResume && (
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notable Built Projects
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl space-y-1">
                        <strong className="text-slate-900 dark:text-white block">UPAJ — Crop Suggestion System</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          Machine learning-based Android app with Firebase Authentication recommending crops from soil and weather analytics.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl space-y-1">
                        <strong className="text-slate-900 dark:text-white block">Workflow Automation Platform</strong>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          Enterprise automation utilizing Power Apps, SharePoint, and Azure for automated approval processes and real-time alerts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Certifications
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Claude Code in Action (Anthropic) • Microsoft Certified: Azure Fundamentals (AZ-900) • Azure AI Fundamentals (AI-900) • Power Platform Fundamentals (PL-900)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: BEHIND GETJOBLINK                                                */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture &amp; Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Behind GetJobLink
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              How the platform works, why it exists, and the engineering principles powering it.
            </p>
          </div>

          {/* Subsection 1: Why I Built It */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3 transition-colors duration-150">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Why I Built It</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Job searching in tech has become unnecessarily noisy. Candidates spend hours clicking on job links only to encounter closed positions, recruiter gatekeepers demanding registration fees, or platforms collecting resumes without routing to real companies.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              I built GetJobLink to fix this broken experience. Every job on the platform links directly to an authenticated employer Applicant Tracking System (ATS)—such as Greenhouse, Lever, Workday, or SmartRecruiters. Candidates apply straight to the hiring company with zero intermediaries, zero subscription paywalls, and zero recruiter spam.
            </p>
          </div>

          {/* Subsection 2: What Makes GetJobLink Different */}
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              What Makes GetJobLink Different
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2 transition-colors duration-150">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Direct ATS Application Links</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every &ldquo;Apply Now&rdquo; button routes directly to the company&apos;s authenticated ATS portal with zero intermediary resume storage.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2 transition-colors duration-150">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Free &amp; Zero Recruiter Spam</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Strict zero-fee policy. We never charge candidates, sell candidate data, or gate application links behind subscription walls.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2 transition-colors duration-150">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Hiring Radar</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Transforms job database records into transparent hiring intelligence: company posting velocity, in-demand skills, and newly discovered employers.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2 transition-colors duration-150">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Integrated ATS Checker &amp; Resume Builder</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Run instant keyword screening evaluations against real job descriptions and build clean, single-column ATS-friendly resumes.
                </p>
              </div>
            </div>
          </div>

          {/* Subsection 3: Technology Behind the Platform */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors duration-150">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Technology Behind the Platform</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modern, high-performance web and mobile stack powering GetJobLink&apos;s daily operations
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">React 19 &amp; Vite 8</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Modern single-page application with code-split routing</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Tailwind CSS v4</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Accessible, responsive, design-system-driven UI</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Firebase Firestore</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Real-time NoSQL database with strict security rules</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Cloud Functions</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Serverless background aggregation &amp; ATS evaluation</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Firebase Auth</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Google OAuth 2.0 with role-based access control</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">PDF.js Text Parsing</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">In-browser resume PDF extraction without server uploads</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Firebase Hosting</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Global SSL CDN with sub-second page delivery</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Android Mobile App</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Native mobile client for tech job alerts</span>
              </div>
            </div>
          </div>

          {/* Subsection 4: Built and Improved Continuously */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors duration-150">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Built &amp; Improved Continuously</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The continuous evolution of GetJobLink from a simple link curator to a hiring intelligence platform
              </p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">Hiring Radar &amp; Market Intelligence</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Launched public company hiring velocity rankings, in-demand skill timelines, and company intelligence profiles.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">Integrated ATS Evaluator &amp; Resume Core</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Introduced in-browser PDF parsing and keyword matching benchmarks to help freshers and engineers tailor their applications.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">Direct ATS Verification Protocol</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Standardized direct routing to employer ATS platforms (Greenhouse, Lever, Workday) with zero candidate fees.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">Initial Inception &amp; Open Curation</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Founded by Divyanshu Singh to eliminate recruiter spam and provide clean daily engineering job opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Community Details */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors duration-150">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Contact &amp; Inquiries</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Have questions, feedback, or a verified opening to feature? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-750 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Email Support</span>
              </span>
              <a
                href="mailto:sdivyanshu352@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium block"
              >
                sdivyanshu352@gmail.com
              </a>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Response within 24–48 hours</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-750 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Founder Connect</span>
              </span>
              <div className="space-y-0.5 text-xs">
                <a
                  href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium block"
                >
                  LinkedIn (Divyanshu Singh)
                </a>
                <a
                  href="https://github.com/Divyanshu9794/get-job-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium block"
                >
                  GitHub (get-job-link)
                </a>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-750 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Official Domain</span>
              </span>
              <a
                href="https://getjoblink.in"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium block"
              >
                https://getjoblink.in
              </a>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Verified Web Portal</span>
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
