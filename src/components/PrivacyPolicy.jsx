import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy({ onClose }) {
  return (
    <section
      className="fixed inset-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm p-6 sm:p-12 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
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

          <h3 className="text-slate-900 font-bold text-lg mb-2">Who we are</h3>
          <p>
            GetJobLink ("we", "us", or "our") operates getjoblink.in ("the Site"), a free
            job board for tech openings in India.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Information we collect</h3>
          <p>
            We do not collect personal data from visitors browsing job listings. If you use
            the Resume Builder, the data you enter stays in your browser and is not sent to
            our servers. We may collect anonymous usage statistics to improve the site.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">How we use your information</h3>
          <p>
            We never sell or share your personal information. We never charge job seekers any
            fee, and we do not request payment details.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Cookies</h3>
          <p>
            The Site may use cookies to remember your preferences and improve your experience.
            You can disable cookies in your browser settings at any time.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">External links</h3>
          <p>
            Job listings link directly to employer websites. We are not responsible for the
            privacy practices of those external sites.
          </p>

          <h3 className="text-slate-900 font-bold text-lg mb-2">Contact us</h3>
          <p>
            Questions about this Privacy Policy? Email us at
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