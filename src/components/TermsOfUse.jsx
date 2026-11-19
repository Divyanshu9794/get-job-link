import { FileText } from "lucide-react";

export default function TermsOfUse({ onClose }) {
  return (
    <section
      className="fixed inset-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm p-6 sm:p-12 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Terms of Use</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <span className="text-2xl font-bold">&times;</span>
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            Last updated: <span className="font-bold text-slate-900">{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Acceptance of terms</h3>
          <p>
            By accessing and using getjoblink.in ("the Site"), you agree to these Terms of Use.
            If you do not agree, please discontinue use of the Site.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Free service</h3>
          <p>
            GetJobLink is 100% free for job seekers. We never charge any fee to view or apply to
            job listings. All job links direct you to the original employer's career page.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Job listings</h3>
          <p>
            Job listings are provided for informational purposes only. We strive to keep listings
            accurate and up to date, but we do not guarantee the availability or accuracy of any
            posting. Applying to a job is between you and the employer.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">User conduct</h3>
          <p>
            You agree not to use the Site for any unlawful purpose, to post false or misleading
            content, or to attempt to interfere with the proper working of the Site.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Limitation of liability</h3>
          <p>
            The Site and its contents are provided "as is" without warranties of any kind. We are
            not liable for any damages arising from your use of the Site or any job listing.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Changes to terms</h3>
          <p>
            We may update these Terms of Use from time to time. Continued use of the Site after
            changes are posted constitutes acceptance of the new terms.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Contact us</h3>
          <p>
            Questions about these Terms? Email us at
            <span className="font-bold">support@getjoblink.in</span>.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
}