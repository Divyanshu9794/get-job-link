import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 antialiased pb-16 transition-colors duration-200">
      <SEO
        title="Editorial Policy & Curation Standards"
        description="Learn how GetJobLink curates daily tech job openings, prevents recruitment fraud, verifies application links, and authors technical career roadmaps."
        canonicalUrl="/editorial-policy"
      />

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Editorial Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            GetJobLink Editorial &amp; Curation Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Our strict standards for listing verification, fraud prevention, and original career publications.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Job Curation &amp; Verification Principles
            </h2>
            <p>
              GetJobLink exists to solve the epidemic of &ldquo;ghost jobs,&rdquo; spam postings, and recruiter
              middlemen that frustrate tech job seekers. Every listing featured on our platform must pass four
              mandatory verification criteria:
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Official ATS Destination:</strong> The application link must route directly to an
                  authenticated corporate career portal (e.g. Greenhouse, Lever, Workday, SmartRecruiters) or
                  the employer&apos;s verified primary domain.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Zero Intermediary Forms:</strong> We never capture, hold, or sell user resumes as an
                  intermediary. Candidates apply directly on the employer&apos;s system.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">No Fee Prohibition:</strong> Any employer, recruiter, or listing requesting application
                  fees, interview fees, or training costs is permanently blacklisted.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Clean Metadata Integrity:</strong> We preserve original job descriptions, company
                  names, and requirements without fabricating salary data or distorting qualifications.
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              2. Career Guides &amp; Educational Publications
            </h2>
            <p>
              Our <Link to="/career-guides" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Career Guides</Link> are
              researched and authored by senior technical contributors and industry practitioners. We reject
              content-farm spam and thin automated summaries.
            </p>
            <p>
              Every career roadmap, interview prep guide, and ATS analysis article must provide:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Practical code, architectural diagrams, or measurable resume frameworks.</li>
              <li>Real compensation benchmarks sourced from verified offers across Indian tech hubs and remote teams.</li>
              <li>Transparent attribution of authorship, published dates, and revision histories.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Corrections &amp; Listing Removal Policy
            </h2>
            <p>
              We run daily automated and manual checks to identify filled or expired job requisitions. However,
              employers frequently close positions without prior notice.
            </p>
            <p>
              We maintain a rapid correction protocol: when a user flags an expired or broken link, our team
              reviews and removes or archives the entry within 24 to 48 hours. You can report listings via the
              flag icon on any job detail page or via <Link to="/contact" className="text-blue-600 font-semibold hover:underline">our contact desk</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Advertising &amp; Sponsorship Independence
            </h2>
            <p>
              GetJobLink maintains strict separation between editorial content, job curation, and third-party
              advertising (such as Google AdSense). Advertisements are clearly distinguished from editorial text
              and job application buttons. Advertisers exercise no editorial control over our curation decisions,
              ranking algorithms, or career guide conclusions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
