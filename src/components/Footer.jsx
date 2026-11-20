import { Link } from "react-router-dom";
import { ShieldCheck, Globe, BookOpen, Mail, Radio } from "lucide-react";
import logoImg from "../assets/logo.jpeg";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/jobs/india" className="flex items-center space-x-2.5">
              <img
                src={logoImg}
                alt="GetJobLink Logo"
                className="w-8 h-8 object-contain rounded-lg border border-slate-700 shadow-xs"
              />
              <span className="text-lg font-black tracking-tight text-white">
                GetJob<span className="text-blue-400">Link</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean daily tech job openings across India and worldwide — curated, verified, and 100%
              free for candidates. Directly connecting software engineers to official employer career portals.
            </p>
            
            {/* Independent Builder Highlight Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>
                Built independently by{" "}
                <a
                  href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-white hover:text-blue-300"
                >
                  Divyanshu Singh
                </a>
              </span>
            </div>

            {/* Social & Project Links */}
            <div className="pt-1 flex items-center space-x-3 text-xs">
              <a
                href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/Divyanshu9794/Get_job_Link_Android-App"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>GitHub</span>
              </a>

              <a
                href="https://x.com/GetJobLink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Job Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/jobs/india" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>Indian Tech Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/jobs/world" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>World &amp; International Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/jobs/remote" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>Worldwide Remote Positions</span>
                </Link>
              </li>
              <li>
                <Link to="/hiring-radar" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <Radio className="w-3 h-3 text-blue-400" />
                  <span>Hiring Radar</span>
                </Link>
              </li>
              <li>
                <Link to="/career-guides" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                  <span>Career Guides &amp; Roadmaps</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Editorial Standards */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Tools &amp; Editorial</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/resume" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>Resume Core Builder</span>
                </Link>
              </li>
              <li>
                <Link to="/ats-checker" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>AI ATS Score Evaluator</span>
                </Link>
              </li>
              <li>
                <Link to="/hiring-radar" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>Company Hiring Velocity</span>
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>Editorial &amp; Curation Standards</span>
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>Zero Fee &amp; Legal Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Builder & Trust */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">About &amp; Builder</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>About GetJobLink</span>
                </Link>
              </li>
              <li>
                <Link to="/about#meet-the-builder" className="text-blue-400 hover:text-white transition-colors inline-flex items-center space-x-1.5 font-semibold">
                  <span>Meet the Builder (Divyanshu)</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Divyanshu9794/Get_job_Link_Android-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center space-x-1.5"
                >
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center space-x-1.5"
                >
                  <span>LinkedIn Profile</span>
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors inline-flex items-center space-x-1.5">
                  <span>Contact &amp; Support Desk</span>
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:getjoblink647@gmail.com"
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>getjoblink647@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Distinct Ownership Credit */}
        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Built independently by{" "}
              <a
                href="https://linkedin.com/in/divyanshu-singh-3b433119b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-blue-400 font-bold transition-colors underline"
              >
                Divyanshu Singh
              </a>
              {" "}❤️
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/terms-and-conditions" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span className="text-slate-700">|</span>
            <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Free for Candidates</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
