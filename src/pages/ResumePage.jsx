import ResumeBuilder from "../components/ResumeBuilder";
import SEO from "../components/SEO";

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors duration-200">
      <SEO
        title="Free ATS Resume Builder for Software Engineers"
        description="Build an ATS-optimized, single-column technical resume formatted specifically for Greenhouse, Lever, and Workday screening parsers. 100% free with instant download."
        canonicalUrl="/resume"
      />
      <div className="max-w-7xl mx-auto">
        <ResumeBuilder />
      </div>
    </div>
  );
}
