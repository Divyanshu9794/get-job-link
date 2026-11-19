import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <SEO
        title="Terms of Service & User Agreement"
        description="Official Terms of Service for GetJobLink (getjoblink.in). Outlines acceptable use, job aggregation scope, zero fee guarantee, and limitation of liability."
        canonicalUrl="/terms-and-conditions"
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/jobs/india"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-xs text-slate-400">
                Effective Date: February 2026 • Website: getjoblink.in
              </p>
            </div>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GetJobLink (&ldquo;getjoblink.in&rdquo;), you agree to be bound by these
              Terms of Service and our Privacy Policy. If you do not agree to these terms, please discontinue
              use of our services.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">2. Description of Platform Services</h2>
            <p>
              GetJobLink provides a curated discovery platform for daily technical job opportunities,
              career roadmaps, and candidate resume evaluation tools. All job listings link directly to
              original employer application portals. GetJobLink does not act as an employer, recruiter,
              or placement agency and does not guarantee interviews, job offers, or candidate placements.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">3. 100% Free For Candidates</h2>
            <p>
              GetJobLink services are completely free of charge for job seekers. We never charge candidates
              for accessing listings, evaluating resumes, or redirecting to official career portals. Any entity
              demanding payment on behalf of GetJobLink is unauthorized and fraudulent.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">4. User Conduct &amp; Account Responsibility</h2>
            <p>
              When utilizing our user profile or resume features, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Provide accurate resume and background information during ATS evaluations.</li>
              <li>Not attempt to reverse engineer, scrape at abusive volume, or disrupt portal services.</li>
              <li>Not upload malicious files, scripts, or corrupted documents to our storage system.</li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              While we make every effort to verify active listings daily, job availability is controlled
              solely by hiring employers. GetJobLink is not liable for closed requisitions, employer hiring
              decisions, or external third-party portal downtime.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">6. Contact &amp; Governing Law</h2>
            <p>
              These terms are governed by the laws of India. For questions or legal inquiries regarding
              these terms, please reach out via our{" "}
              <Link to="/contact" className="text-blue-600 font-semibold hover:underline">
                Contact Page
              </Link>{" "}
              or email{" "}
              <a href="mailto:getjoblink647@gmail.com" className="text-blue-600 font-semibold hover:underline">
                getjoblink647@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
