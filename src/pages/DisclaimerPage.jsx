import { Link } from "react-router-dom";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <SEO
        title="Disclaimer & Zero Fee Guarantee"
        description="Official disclaimer regarding job aggregation, application links, zero fee policy, and third-party employer sites on GetJobLink."
        canonicalUrl="/disclaimer"
      />

      <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Legal Disclaimer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            GetJobLink Legal &amp; Aggregator Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Last updated: February 2026 • Please review our operational scope and third-party notices.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          {/* Important Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-3 text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-emerald-900">Zero Application Fee Commitment</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                GetJobLink (<a href="https://getjoblink.in/" className="underline font-semibold">getjoblink.in</a>) is 100% free
                for all candidates. We never charge registration fees, interview security fees, or training costs.
                Any communication requesting payment in exchange for a job listing is fraudulent and not authorized by GetJobLink.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Nature of the Service
            </h2>
            <p>
              GetJobLink operates as an independent technical job-discovery platform and aggregator. We
              curate publicly advertised employment opportunities directly from official employer career
              portals and Applicant Tracking Systems (including Greenhouse, Lever, Workday, SmartRecruiters,
              and corporate career pages).
            </p>
            <p>
              GetJobLink is not an employer, employment agency, recruiter, or staffing intermediary. We do
              not participate in hiring decisions, candidate selections, interviews, or contract negotiations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Third-Party Links &amp; Employer Portals
            </h2>
            <p>
              Our job listings include hyperlinks that redirect candidates directly to official third-party
              employer portals. Once you click &ldquo;Apply Now&rdquo; and leave GetJobLink, your interactions,
              data submissions, and application details are governed solely by the privacy policies and terms
              of that respective employer.
            </p>
            <p>
              While we perform daily verification to ensure application links point to legitimate corporate domains,
              GetJobLink does not guarantee that a job position remains unfilled or active at the time of your application.
              Employers may close requisitions or withdraw postings at their sole discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. ATS Score &amp; Career Evaluation Advice
            </h2>
            <p>
              The ATS Score Evaluator and career tips provided on GetJobLink are algorithmic benchmarking
              tools designed for self-assessment and educational guidance. Passing score benchmarks do not
              guarantee an interview or offer from any prospective employer, as human hiring criteria, volume,
              and internal hiring priorities vary across companies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Reporting Inaccuracies or Expired Listings
            </h2>
            <p>
              If you discover an inactive, filled, or inaccurate job posting, please notify us immediately through
              our <Link to="/contact" className="text-blue-600 font-semibold hover:underline">Contact Form</Link> or the
              reporting flag on any job detail page. Our team reviews and removes reported listings within 24–48 hours.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
