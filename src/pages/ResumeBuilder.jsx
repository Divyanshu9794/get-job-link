import React, { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { FileText, Download, ChevronRight, Sparkle, RefreshCw, Zap, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ResumeBuilder() {
  const { currentUser, isAdmin } = useAuth();
  const [template, setTemplate] = useState("classic");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [matchingSkills, setMatchingSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [resumeRef, setResumeRef] = useState(null);
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

  // Generate the resume HTML for both preview and PDF
  const generateResumeHTML = () => {
    const accent = template === "modern" ? "#3b82f6" : template === "minimal" ? "#1e293b" : "#3b82f6";
    const divider = template === "minimal" ? "1px solid #e2e8f0" : "2px solid #3b82f6";
    const headerFont = template === "minimal" ? "'Segoe UI', sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${sections.name || "Resume"} — Resume</title>
<style>
  @page { size: A4; margin: 0; }
  body { font-family: ${headerFont}; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6; background: #fff; }
  h1 { font-size: 28px; margin: 0; color: #0f172a; }
  h2 { font-size: 14px; color: ${accent}; margin: 20px 0 8px; border-bottom: ${divider}; padding-bottom: 4px; }
  h3 { font-size: 13px; color: #64748b; margin: 15px 0 4px; }
  p { margin: 4px 0; color: #475569; }
  .meta { color: #64748b; font-size: 14px; margin-top: 4px; }
  .summary { font-style: italic; color: #334155; margin-bottom: 16px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  .section-title { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 8px; }
  .contact { font-size: 12px; color: #64748b; margin-bottom: 16px; }
</style>
</head>
<body>
  <h1>${sections.name || "Your Name"}</h1>
  <p class="meta">${sections.title || "Professional Title"}</p>
  <div class="contact">Skills: ${sections.skills || "—"}</div>
  ${sections.summary ? `<p class="summary">${sections.summary}</p>` : ""}
  <div>
    <h2>Professional Experience</h2>
    <p>${sections.experience || "—"}</p>
    <h2>Education</h2>
    <p>${sections.education || "—"}</p>
    ${sections.projects ? `<h2>Projects</h2><p>${sections.projects}</p>` : ""}
    ${sections.certifications ? `<h2>Certifications</h2><p>${sections.certifications}</p>` : ""}
    ${sections.languages ? `<h2>Languages</h2><p>${sections.languages}</p>` : ""}
  </div>
</body>
</html>`;
  };

  // Download PDF from the rendered resume
  const downloadPDF = async () => {
    if (!sections.name && !sections.title) {
      alert("Please fill in at least your name or title before downloading.");
      return;
    }
    setIsGenerating(true);
    try {
      let canvas;
      // If preview is open, capture from the iframe; otherwise open a new window
      if (previewVisible && resumeRef.current?.contentDocument) {
        canvas = await html2canvas(resumeRef.current.contentDocument.body, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        });
      } else {
        const win = window.open("", "_blank");
        if (!win) {
          alert("Please allow popups to generate the PDF.");
          return;
        }
        win.document.open();
        win.document.write(generateResumeHTML());
        win.document.close();
        await new Promise(r => setTimeout(r, 800));
        canvas = await html2canvas(win.document.body, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        });
        win.close();
      }
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${(sections.name || "resume").replace(/\s+/g, "_")}_Resume.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Failed to generate PDF: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open preview modal
  const openPreview = () => {
    if (!sections.name && !sections.title) {
      alert("Please fill in at least your name or title before previewing.");
      return;
    }
    setPreviewVisible(true);
  };

  // Analyze resume against a JD using AI
  const analyzeAgainstJD = (jd) => {
    if (!jd) return { score: 0, matching: [], missing: [], suggestions: [] };
    const resumeSkills = (sections.skills || "").toLowerCase().split(/[,;\s]+/).filter(Boolean);
    const jdSkills = jd.toLowerCase().split(/[,;\s]+/).filter(Boolean);
    const matching = resumeSkills.filter(s => jdSkills.some(j => j.includes(s) || s.includes(j)));
    const missing = jdSkills.filter(j => !resumeSkills.some(s => s.includes(j) || j.includes(s)));
    const score = jdSkills.length ? Math.round((matching.length / jdSkills.length) * 100) : 0;
    return {
      score: Math.min(score, 100),
      matching: matching.slice(0, 10),
      missing: missing.slice(0, 10),
      suggestions: missing.length > 0 ? [`Add skills: ${missing.join(", ")}`] : []
    };
  };

  const handleJDMatch = () => {
    const jd = prompt("Paste the Job Description to match against:");
    if (!jd) return;
    const result = analyzeAgainstJD(jd);
    setMatchScore(result.score);
    setMatchingSkills(result.matching);
    setMissingSkills(result.missing);
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
        <button onClick={downloadPDF} disabled={isGenerating} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          <Download className="w-4 h-4" />
          {isGenerating ? "Generating PDF..." : "Download PDF"}
        </button>
        <button onClick={openPreview} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Preview Resume
        </button>
        <button onClick={handleJDMatch} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Match JD
        </button>
      </div>

      {matchScore !== null && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-800">JD Match Score</span>
            <span className="text-2xl font-bold text-purple-700">{matchScore}%</span>
          </div>
          {matchingSkills.length > 0 && (
            <p className="text-xs text-purple-700 mt-2"><CheckCircle2 className="inline w-3 h-3 mr-1" />Matching skills: {matchingSkills.join(", ")}</p>
          )}
          {missingSkills.length > 0 && (
            <p className="text-xs text-purple-700 mt-1"><RefreshCw className="inline w-3 h-3 mr-1" />Missing skills: {missingSkills.join(", ")}</p>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewVisible(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Resume Preview</h3>
              <div className="flex gap-2">
                <button onClick={downloadPDF} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download PDF</button>
                <button onClick={() => setPreviewVisible(false)} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Close</button>
              </div>
            </div>
            <iframe
              ref={setResumeRef}
              srcDoc={generateResumeHTML()}
              title="Resume Preview"
              className="w-full border-0"
              style={{ minHeight: "80vh" }}
            />
          </div>
        </div>
      )}

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