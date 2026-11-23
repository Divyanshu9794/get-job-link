import { useState } from "react";
import { FileText, Download, Eye, Edit3, Type, Briefcase, GraduationCap, FolderGit2, Sparkles } from "lucide-react";

export default function ResumeBuilder() {
  // Setup default placeholder configuration matching a standard initial load state
  const [template, setTemplate] = useState("classic"); // "classic" or "modern"
  const [resumeData, setResumeData] = useState({
    fullName: "ABC XYZ",
    email: "abcxyz@domain.com",
    phone: "9999999999",
    github: "github.com/abcxyz",
    linkedin: "linkedin.com/in/abcxyz",
    location: "San Francisco, CA",
    summary: "Highly motivated Software Development Engineer focused on scalable architecture systems and algorithmic optimizations.",
    education: "University of California, Berkeley — Bachelor of Science in Computer Science (GPA: 3.85)",
    experience: "Tech Startup Inc. — Software Engineering Intern\n• Optimized Node.js/Express REST API endpoints and caching configurations to lower p65 latency.\n• Built React responsive UI layouts utilized by 10,000+ active DAU.",
    projects: "AI-Powered Study Assistant\n• Built an orchestration pipeline summarizing raw documentation payloads.\n• Implemented secure authentication matrices with cross-origin token validation rules.",
    skills: "Languages: JavaScript, TypeScript, Python, C++, Java, SQL\nFrameworks & Developer Tools: React, Node.js, Express, Docker, Git, Linux, Firebase"
  });

  const handleDownloadText = () => {
    const textOutput = `
${resumeData.fullName.toUpperCase()}
${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
${resumeData.linkedin} | ${resumeData.github}

PROFESSIONAL SUMMARY
====================
${resumeData.summary}

EDUCATION
=========
${resumeData.education}

EXPERIENCE
==========
${resumeData.experience}

PROJECTS
========
${resumeData.projects}

TECHNICAL SKILLS
================
${resumeData.skills}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([textOutput], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.fullName.replace(/\s+/g, "_")}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      
      {/* BUILDER NAVIGATION MANAGEMENT CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Dynamic Resume Workspace</h2>
            <p className="text-xs text-slate-400 dark:text-slate-400">Fill out fields and switch layout profiles live.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          <button 
            onClick={handleDownloadText}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Plain Text</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE MATRIX DIVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-start flex-1">
        
        {/* TEMPLATE CHOOSER & FORM EDITOR SYSTEM (LEFT) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* TEMPLATE SWITCH PANEL */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">Choose Layout Profile</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTemplate("classic")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${template === "classic" ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 ring-1 ring-blue-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white">Classic Professional</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">Single-column system font clean index setup.</span>
              </button>
              <button 
                onClick={() => setTemplate("modern")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${template === "modern" ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 ring-1 ring-blue-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white">Modern Slate Accent</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">Refined bold tracking headers with side layout bars.</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM ENGINE */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-h-[68vh] overflow-y-auto">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Edit3 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Form Editor Payload</span>
            </div>

            {/* Core Credentials Input Block */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" value={resumeData.fullName} onChange={(e) => setResumeData({...resumeData, fullName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                  <input type="text" value={resumeData.phone} onChange={(e) => setResumeData({...resumeData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                  <input type="text" value={resumeData.linkedin} onChange={(e) => setResumeData({...resumeData, linkedin: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">GitHub Link</label>
                  <input type="text" value={resumeData.github} onChange={(e) => setResumeData({...resumeData, github: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Location</label>
                <input type="text" value={resumeData.location} onChange={(e) => setResumeData({...resumeData, location: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* Sub-sections Field Configuration */}
              <div className="pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mb-1">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <span>Summary</span>
                  </label>
                  <textarea rows="2" value={resumeData.summary} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans text-[11px]" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Education Background</span>
                  </label>
                  <input type="text" value={resumeData.education} onChange={(e) => setResumeData({...resumeData, education: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Professional Experience Matrix</span>
                  </label>
                  <textarea rows="3" value={resumeData.experience} onChange={(e) => setResumeData({...resumeData, experience: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono text-[10px] leading-normal" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mb-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Key Engineering Projects</span>
                  </label>
                  <textarea rows="3" value={resumeData.projects} onChange={(e) => setResumeData({...resumeData, projects: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono text-[10px] leading-normal" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Skills & Tools Optimization Set</span>
                  </label>
                  <textarea rows="2" value={resumeData.skills} onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans text-[11px]" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* HIGH ACCURACY LIVE PREVIEW CANVAS (RIGHT) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs sticky top-6 min-h-[78vh] flex flex-col justify-between">
          
          {/* TOP CANVAS BANNER METRICS */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
            <div className="flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Render Frame Canvas</span>
            </div>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">A4 Layout Page 1</span>
          </div>

          {/* RENDER DYNAMIC PROFILES SWITCH SYSTEM (Printed Paper Simulation) */}
          <div className="flex-1 bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80 font-serif text-xs tracking-tight select-text leading-relaxed">
            {template === "classic" ? (
              
              /* CLASSIC PROFESSIONAL LAYOUT ENGINE */
              <div className="space-y-4 max-w-[95%] mx-auto font-serif">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-normal tracking-wide text-slate-900 font-sans">{resumeData.fullName || "NAME PLACEHOLDER"}</h1>
                  <div className="text-[11px] text-slate-600 font-sans flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                    {resumeData.email && <span>{resumeData.email}</span>}
                    {resumeData.phone && <span>• {resumeData.phone}</span>}
                    {resumeData.location && <span>• {resumeData.location}</span>}
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono flex flex-wrap justify-center gap-x-2">
                    {resumeData.linkedin && <span>{resumeData.linkedin}</span>}
                    {resumeData.github && <span>{resumeData.github}</span>}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">Education</h2>
                    <p className="whitespace-pre-line text-slate-800">{resumeData.education}</p>
                  </div>
                  <div>
                    <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">Professional Experience</h2>
                    <p className="whitespace-pre-line text-slate-700 font-sans text-[11px] leading-normal">{resumeData.experience}</p>
                  </div>
                  <div>
                    <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">Projects Portfolio</h2>
                    <p className="whitespace-pre-line text-slate-700 font-sans text-[11px] leading-normal">{resumeData.projects}</p>
                  </div>
                  <div>
                    <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">Technical Core Skills</h2>
                    <p className="whitespace-pre-line text-slate-800">{resumeData.skills}</p>
                  </div>
                </div>
              </div>

            ) : (
              
              /* MODERN SLATE ACCENT LAYOUT ENGINE */
              <div className="space-y-5 font-sans">
                <div className="border-l-4 border-slate-800 pl-4 py-1">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">{resumeData.fullName || "NAME PLACEHOLDER"}</h1>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 flex flex-wrap gap-x-3">
                    <span>{resumeData.email}</span>
                    <span>{resumeData.phone}</span>
                    <span>{resumeData.location}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 text-[11px] italic leading-relaxed">
                  {resumeData.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1 border-b-2 border-slate-200 pb-0.5">Experience Pipeline</h3>
                      <p className="whitespace-pre-line text-slate-600 text-[11px] leading-normal">{resumeData.experience}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1 border-b-2 border-slate-200 pb-0.5">Technical Projects</h3>
                      <p className="whitespace-pre-line text-slate-600 text-[11px] leading-normal">{resumeData.projects}</p>
                    </div>
                  </div>
                  <div className="space-y-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Education</h3>
                      <p className="text-slate-600 text-[11px] leading-snug">{resumeData.education}</p>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Skills Set</h3>
                      <p className="text-slate-600 text-[11px] leading-snug whitespace-pre-line">{resumeData.skills}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100 text-center font-mono">
            Output layout engine synced with target ATS standard keywords profile.
          </div>
        </div>

      </div>
    </div>
  );
}