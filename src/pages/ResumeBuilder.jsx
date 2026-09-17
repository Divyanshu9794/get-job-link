import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { FileText, Download, ChevronRight, Sparkle } from "lucide-react";

export default function ResumeBuilder() {
  const { currentUser, isAdmin } = useAuth();
  const [template, setTemplate] = useState("classic");
  const [sections, setSections] = useState({
    name: "",
    title: "",
    experience: "",
    education: "",
    skills: "",
    summary: "",
    projects: "",
    certifications: "",
    languages: ""
  });

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in required</h2>
        <p className="text-sm text-slate-500 mt-2">Please sign in with Google to access the Resume Builder.</p>
      </div>
    );
  }

  const handleChange = (key, value) => setSections((s) => ({ ...s, [key]: value }));

  const downloadHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${sections.name} — Resume</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6; }
  h1 { font-size: 28px; margin: 0; color: #0f172a; }
  h2 { font-size: 14px; color: #3b82f6; margin: 20px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
  h3 { font-size: 13px; color: #64748b; margin: 15px 0 4px; }
  p { margin: 4px 0; color: #475569; }
  .meta { color: #64748b; font-size: 14px; margin-top: 4px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  .section-title { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 8px; }
</style>
</head>
<body>
  <h1>${sections.name}</h1>
  <p class="meta">${sections.title}</p>
  ${sections.summary ? `<p class="mb-6" style="font-style: italic; color: #334155;">${sections.summary}</p>` : ""}
  <div className="space-y-6">
    <h2 className="section-title">Professional Experience</h2>
    <p>${sections.experience}</p>
    <h2 className="section-title">Education</h2>
    <p>${sections.education}</p>
    ${sections.projects ? `<h2 className="section-title">Projects</h2><p>${sections.projects}</p>` : ""}
    ${sections.certifications ? `<h2 className="section-title">Certifications</h2><p>${sections.certifications}</p>` : ""}
    ${sections.languages ? `<h2 className="section-title">Languages</h2><p>${sections.languages}</p>` : ""}
    <h2 className="section-title">Skills</h2>
    <p>${sections.skills}</p>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resume Builder</h1>
          <p className="text-sm text-slate-500">Create a clean, ATS-friendly resume in minutes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Choose Template</h3>
        <div className="flex gap-3">
          {["classic", "modern", "minimal"].map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${template === t ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        {Object.entries(sections).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{key}</label>
            <textarea
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Enter your ${key}...`}
              rows={key === "experience" ? 5 : key === "projects" ? 4 : key === "certifications" ? 3 : key === "languages" ? 2 : 3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={downloadHTML} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download Resume
        </button>
        <button onClick={() => alert("Preview coming soon")} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Sparkle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">AI-Enhanced Resume</p>
          <p className="text-xs text-blue-600 mt-1">Get personalized suggestions to improve your resume for each job you apply to.</p>
        </div>
        <a href="/ats" className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800">
          Try ATS <ChevronRight className="w-4 h-4 ml-0.5" />
        </a>
      </div>
    </div>
  );
}