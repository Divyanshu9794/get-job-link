import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <SEO
        title="Privacy Policy"
        description="Official Privacy Policy for GetJobLink (getjoblink.in). Explains our data collection, Google AdSense cookies, Firebase authentication, and candidate data security."
        canonicalUrl="/privacy-policy"
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-400">
                Effective Date: February 2026 • Website: getjoblink.in
              </p>
            </div>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">1. Introduction &amp; Scope</h2>
            <p>
              GetJobLink (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates{" "}
              <a href="https://getjoblink.in" className="text-blue-600 font-semibold hover:underline">
                https://getjoblink.in
              </a>
              . This Privacy Policy outlines how we collect, handle, protect, and process user data
              across our job board, career guides, ATS Score Evaluator, and candidate resume management tools.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
            <p>
              We adhere strictly to data minimization principles:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Public Browsing:</strong> You can search, filter, and review all job openings and
                career guides without creating an account or providing personal details.
              </li>
              <li>
                <strong>Account Information:</strong> When you sign in using Google Authentication, we
                receive your name, email address, and profile photo provided by Google Auth. We do not
                receive or store your Google password.
              </li>
              <li>
                <strong>Uploaded Resumes:</strong> If you upload a resume to your profile, the file is
                stored securely in Firebase Storage with restricted access granted only to your authenticated
                account. Extracted text is used solely for on-demand ATS evaluations against job descriptions.
              </li>
              <li>
                <strong>Saved Jobs &amp; ATS History:</strong> We store job IDs you bookmark and ATS match
                scores under your user document to enable your personal dashboard.
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">3. Google AdSense &amp; Cookies</h2>
            <p>
              GetJobLink works with third-party vendors, including Google, to serve advertisements when you visit our website:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits
                to your website or other websites.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based
                on their visit to your sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-semibold"
                >
                  Google Ads Settings
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">4. Analytics &amp; Performance</h2>
            <p>
              We use Google Analytics to understand aggregate website performance, popular career topics,
              and job search patterns. This data is collected anonymously and cannot be used to identify
              individual candidates personally.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">5. Third-Party Employer Application Links</h2>
            <p>
              When you click &ldquo;Apply Now&rdquo; on any listing, you are redirected to the official career portal
              or Applicant Tracking System (such as Greenhouse, Lever, Workday, or SmartRecruiters) of that employer.
              We do not act as an application broker and do not receive copies of applications you submit on
              employer portals.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">6. User Rights &amp; Data Deletion</h2>
            <p>
              You have complete control over your data. You may delete your uploaded resume, clear your
              saved jobs, or delete your account at any time directly through your{" "}
              <Link to="/profile" className="text-blue-600 font-semibold hover:underline">
                Profile Settings
              </Link>
              . To request a complete deletion of all associated records, email{" "}
              <a href="mailto:getjoblink647@gmail.com" className="text-blue-600 font-semibold hover:underline">
                getjoblink647@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-slate-900">7. Security Safeguards</h2>
            <p>
              All user data is encrypted in transit via Transport Layer Security (TLS/HTTPS). User profiles,
              resumes, and evaluation histories are protected by fine-grained Firebase Security Rules that
              restrict data access strictly to authenticated account owners.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
