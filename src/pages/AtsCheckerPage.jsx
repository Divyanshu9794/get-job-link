import AtsChecker from "../components/AtsChecker";
import SEO from "../components/SEO";

export default function AtsCheckerPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <SEO
        title="AI ATS Score Evaluator & Resume Keyword Matcher"
        description="Upload your resume PDF or paste text to evaluate your ATS compatibility score against any job description. Uncover missing technical keywords and improve screening call rates."
        canonicalUrl="/ats-checker"
      />
      <div className="max-w-7xl mx-auto">
        <AtsChecker />
      </div>
    </div>
  );
}
