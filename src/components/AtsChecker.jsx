import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react";
import { getRoleSpecificAtsTips } from "../utils/atsAdvisor";
import { useAuth } from "../context/AuthContext";
import { extractPdfText } from "../utils/pdfExtractor";

const DEFAULT_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "";

export default function AtsChecker() {
  const location = useLocation();
  const { currentUser, userProfile, saveAtsEvaluation } = useAuth();
  const [resumeText, setResumeText] = useState(() => location.state?.resumeText || "");
  const [jobDescription, setJobDescription] = useState(() => location.state?.jobDescription || "");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [usingDefaultResume, setUsingDefaultResume] = useState(false);

  // Automatically use user's saved default resume if no custom text provided
  useEffect(() => {
    if (userProfile?.defaultResume?.extractedText && !resumeText) {
      setResumeText(userProfile.defaultResume.extractedText);
      setUsingDefaultResume(true);
    }
  }, [userProfile, resumeText]);

  // Generate 4 role-specific tips when a job description is present
  const roleSpecificTips = useMemo(() => {
    if (!jobDescription || jobDescription.trim().length < 20) return [];
    return getRoleSpecificAtsTips({
      title: location.state?.jobTitle || "Tech Position",
      jd: jobDescription,
    });
  }, [jobDescription, location.state?.jobTitle]);

  const extractTextFromPDF = async (file) => {
    try {
      const text = await extractPdfText(file);
      setResumeText(text);
    } catch (err) {
      console.error("PDF extraction error:", err);
      alert("Unable to read PDF. You can also paste the text directly.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await extractTextFromPDF(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await extractTextFromPDF(file);
  };

  // Local fallback analyzer in case Gemini API is unreachable or rate-limited
  const runLocalAnalysis = (resume, jd) => {
    const rLower = resume.toLowerCase();
    const jdLower = jd.toLowerCase();

    // Extract potential technical keywords from JD
    const commonTech = [
      "react", "javascript", "typescript", "node.js", "python", "java", "c++", "sql", 
      "docker", "kubernetes", "aws", "gcp", "azure", "git", "ci/cd", "rest", "graphql", 
      "microservices", "mongodb", "postgresql", "redis", "linux", "system design", "agile",
      "testing", "html", "css", "tailwind", "express", "spring", "django", "fastapi"
    ];

    const jdKeywords = commonTech.filter((w) => jdLower.includes(w));
    const matchedKeywords = jdKeywords.filter((w) => rLower.includes(w));
    const missingKeywords = jdKeywords.filter((w) => !rLower.includes(w));

    const keywordRatio = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 0.8;
    const keywordScore = Math.min(95, Math.max(50, Math.round(keywordRatio * 100)));

    const hasExperience = rLower.includes("experience") || rLower.includes("work") || rLower.includes("intern");
    const hasProjects = rLower.includes("projects") || rLower.includes("built") || rLower.includes("developed");
    const hasEducation = rLower.includes("education") || rLower.includes("university") || rLower.includes("bachelor");

    const experienceScore = hasExperience ? 85 : 60;
    const projectsScore = hasProjects ? 80 : 65;
    const skillsScore = Math.min(90, Math.round(keywordScore * 0.9 + 10));
    const formattingScore = hasEducation && hasExperience ? 90 : 75;

    const atsScore = Math.round(
      keywordScore * 0.35 +
      experienceScore * 0.25 +
      projectsScore * 0.15 +
      skillsScore * 0.15 +
      formattingScore * 0.1
    );

    return {
      atsScore,
      keywordScore,
      experienceScore,
      projectsScore,
      skillsScore,
      formattingScore,
      strengths: [
        `Strong match for key requirements: ${matchedKeywords.slice(0, 4).join(", ") || "Technical fundamentals"}`,
        hasExperience ? "Clear professional experience section identified." : "Project-driven portfolio.",
        "System-readable plain text formatting suitable for standard ATS parsers."
      ],
      missingKeywords: missingKeywords.slice(0, 8),
      improvements: [
        "Include more quantifiable metrics (e.g. reduced latency by X%, improved throughput by Y%).",
        missingKeywords.length > 0
          ? `Incorporate required JD technologies: ${missingKeywords.slice(0, 3).join(", ")}.`
          : "Tailor the summary section to directly echo the job title and primary domain.",
        "Ensure bullet points start with strong action verbs (Architected, Engineered, Optimized)."
      ],
      improvedBullets: [
        "Architected scalable backend microservices, optimizing database index queries and reducing API latency by 32%.",
        "Engineered responsive React interface components with 99.8% uptime and seamless cross-device compatibility."
      ],
      summary: `Your profile demonstrates a ${atsScore}% ATS alignment with this role. Incorporating missing keywords like ${missingKeywords.slice(0, 2).join(", ") || "core competencies"} and emphasizing measurable business impact will elevate your ranking for human recruiter review.`
    };
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text or upload a PDF.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the target job description.");
      return;
    }

    setLoading(true);

    try {
      const prompt = `
        Analyze the following Resume against the Job Description.

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}

        Return a raw JSON object matching this exact schema:
        {
          "atsScore": 85,
          "keywordScore": 80,
          "experienceScore": 90,
          "projectsScore": 75,
          "skillsScore": 85,
          "formattingScore": 95,
          "strengths": ["string"],
          "missingKeywords": ["string"],
          "improvements": ["string"],
          "improvedBullets": ["string"],
          "summary": "string"
        }
      `;

      let finalReport;
      if (DEFAULT_API_KEY) {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${DEFAULT_API_KEY}`;
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          finalReport = JSON.parse(data.candidates[0].content.parts[0].text.trim());
        }
      }

      if (!finalReport) {
        finalReport = runLocalAnalysis(resumeText, jobDescription);
      }

      setReport(finalReport);

      // Save to user history if authenticated
      if (currentUser && finalReport) {
        try {
          await saveAtsEvaluation({
            jobTitle: location.state?.jobTitle || "Evaluated Job Description",
            score: finalReport.atsScore || 75,
            matchedKeywords: finalReport.strengths || [],
            missingKeywords: finalReport.missingKeywords || [],
          });
        } catch (saveErr) {
          console.warn("Could not save evaluation history:", saveErr);
        }
      }
    } catch (err) {
      console.warn("Falling back to local heuristic analysis:", err);
      const fallbackReport = runLocalAnalysis(resumeText, jobDescription);
      setReport(fallbackReport);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) =>
    score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-rose-600";
  const progressColor = (score) =>
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI ATS Score Evaluator</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Benchmark Your Resume Against Any Job
              </h1>
              <p className="text-xs sm:text-sm text-blue-200">
                Upload your resume PDF or paste text to uncover ATS keyword gaps and boost your interview call rate.
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload PDF Resume</span>
              <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid lg:grid-cols-2 gap-6 p-6 sm:p-8" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Your Resume Text</span>
              </h2>
              {usingDefaultResume && (
                <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80">
                  Default Resume Loaded
                </span>
              )}
            </div>
            {usingDefaultResume && userProfile?.defaultResume && (
              <div className="bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center space-x-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Active: <strong>{userProfile.defaultResume.fileName}</strong></span>
                </div>
                <button
                  onClick={() => {
                    setResumeText("");
                    setUsingDefaultResume(false);
                  }}
                  className="text-[11px] text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold underline shrink-0 ml-2"
                >
                  Clear / Custom
                </button>
              </div>
            )}
            <textarea
              rows={11}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain resume text here, or drop a PDF file..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-xs font-mono text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 dark:bg-slate-800/80"
            />
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Target Job Description</span>
            </h2>
            <textarea
              rows={11}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the employer's full job description, qualifications, and requirements here..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-xs font-mono text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 dark:bg-slate-800/80"
            />
          </div>
        </div>

        {/* 4 Role-Specific ATS Tips ("What this JD is actually filtering for") */}
        {roleSpecificTips.length > 0 && (
          <div className="mx-6 sm:mx-8 mb-6 bg-slate-900 dark:bg-slate-800/90 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 dark:border-slate-700">
              <div className="space-y-0.5">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Role-Specific ATS Intelligence</span>
                </div>
                <h3 className="text-base font-black text-white">
                  What this JD is Actually Filtering For
                </h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-full border border-slate-700">
                4 Role-Specific Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {roleSpecificTips.map((tip) => {
                const getIcon = () => {
                  if (tip.id === 1) return <Cpu className="w-4 h-4 text-blue-400" />;
                  if (tip.id === 2) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
                  if (tip.id === 3) return <Target className="w-4 h-4 text-amber-400" />;
                  return <Layers className="w-4 h-4 text-purple-400" />;
                };

                return (
                  <div
                    key={tip.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        {getIcon()}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tip.category}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-700 px-1.5 py-0.2 rounded">
                        {tip.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs">{tip.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{tip.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-6 sm:px-8 pb-8">
          <button
            onClick={analyzeResume}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Evaluating ATS Match & Keywords...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Resume & Calculate ATS Score</span>
              </>
            )}
          </button>
        </div>

        {/* Report Output */}
        {report && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Evaluation Report</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 text-center shadow-2xs flex flex-col items-center justify-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Overall Match</h3>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-28 h-28 rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#2563eb"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={Math.PI * 84}
                      strokeDashoffset={Math.PI * 84 * (1 - (report.atsScore || 75) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${scoreColor(report.atsScore || 75)}`}>
                      {report.atsScore || 75}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ATS Score</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xs space-y-3">
                {[
                  ["Keyword Alignment", report.keywordScore ?? 80],
                  ["Experience Relevance", report.experienceScore ?? 85],
                  ["Technical Projects", report.projectsScore ?? 75],
                  ["Skills & Competencies", report.skillsScore ?? 85],
                  ["System Layout & Formatting", report.formattingScore ?? 90],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-2 rounded-full ${progressColor(value)} transition-all`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {report.strengths?.length > 0 && (
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Resume Strengths</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-5 list-disc">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Keywords */}
            {report.missingKeywords?.length > 0 && (
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Missing Keywords from Job Description</span>
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.missingKeywords.map((k, i) => (
                    <span key={i} className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {report.improvements?.length > 0 && (
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Recommended Improvements
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-5 list-disc">
                  {report.improvements.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Rewritten Bullets */}
            {report.improvedBullets?.length > 0 && (
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  High-Impact Bullet Point Examples
                </h3>
                <ul className="space-y-2">
                  {report.improvedBullets.map((b, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-blue-500 italic">
                      “{b}”
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {report.summary && (
              <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl text-white space-y-1 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">Recruiter Verdict</h4>
                <p className="text-xs sm:text-sm leading-relaxed text-blue-50">{report.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
