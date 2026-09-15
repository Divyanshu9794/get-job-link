import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Search, Zap, Play, Check, BarChart2, FileText } from "lucide-react";

export default function ATSEvaluator() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in required</h2>
        <p className="text-sm text-slate-500 mt-2">Please sign in with Google to access the ATS Evaluator.</p>
      </div>
    );
  }

  const SKILL_KEYWORDS = [
    "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "AWS", "Azure",
    "GCP", "Docker", "Kubernetes", "SQL", "MongoDB", "PostgreSQL", "Redis", "GraphQL",
    "REST API", "Microservices", "CI/CD", "Jenkins", "GitHub", "GitLab", "Bitbucket",
    "Terraform", "Ansible", "Linux", "Unix", "Bash", "PowerShell", "HTML", "CSS",
    "SASS", "LESS", "Bootstrap", "Tailwind", "Material UI", "Chakra UI",
    "Redux", "MobX", "Context API", "Vue.js", "Angular", "Svelte",
    "Next.js", "Nuxt.js", "Express.js", "Django", "Flask", "Spring",
    "ASP.NET", "Laravel", "Symfony", "Ruby on Rails", "Go", "Rust",
    "Scala", "Kotlin", "Swift", "Objective-C", "Xamarin", "Flutter",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
    "Tableau", "Power BI", "Looker", "Excel", "VBA", "SQL Server",
    "Oracle", "MySQL", "MongoDB", "Cassandra", "DynamoDB", "Redis",
    "Elasticsearch", "Logstash", "Kibana", "Kafka", "RabbitMQ",
    "Jira", "Confluence", "Asana", "Trello", "Notion", "Slack",
    "Microsoft Teams", "Zoom", "Google Meet", "Webex"
  ];

  const evaluateATS = () => {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobText.toLowerCase();

    // Extract skills from resume
    const resumeSkills = SKILL_KEYWORDS.filter(skill => resumeLower.includes(skill.toLowerCase()));
    // Extract skills from job description
    const jobSkills = SKILL_KEYWORDS.filter(skill => jobLower.includes(skill.toLowerCase()));

    // Calculate match
    const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
    const score = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;

    // Missing skills
    const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));

    setResults({ score, matchedSkills, missingSkills, totalJobSkills: jobSkills.length });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ATS Score Evaluator</h1>
          <p className="text-sm text-slate-500">See how well your resume matches a job description.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Job Description</label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description here..."
              rows={8}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Resume Text</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={evaluateATS} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              Calculate Score
            </button>
            <button onClick={() => {
              setResumeText("");
              setJobText("");
              setResults(null);
            }} className="flex-1 border border-slate-200 bg-white rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Clear
            </button>
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your ATS Score</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-50">
                <BarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{results.score}%</h3>
                <p className="text-sm text-slate-500">
                  {results.score >= 80 ? "Excellent match!" : results.score >= 60 ? "Good match" : "Consider adding more relevant skills"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {results.matchedSkills.length} of {results.totalJobSkills} skills matched
                </p>
              </div>
            </div>

            {results.missingSkills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Suggested skills to add</h3>
                <p className="text-sm text-slate-600 mb-2">
                  These skills appear in the job description but may be missing from your resume:
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.missingSkills.slice(0, 10).map((skill) => (
                    <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 text-center">
                This evaluation uses keyword matching. Real ATS systems may use more sophisticated parsing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}