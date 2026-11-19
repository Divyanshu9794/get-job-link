import { ShieldCheck, Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">About GetJobLink</h2>
        <p className="mt-2 text-slate-500 text-sm max-w-xl mx-auto">
          GetJobLink is a free job board for tech openings across India. We publish
          fresh, verified job listings updated daily — no fees, no spam, no hidden
          charges for job seekers.
        </p>
      </div>

      {/* Trust bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600 text-sm mb-8">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="font-bold text-slate-800">100% Free</h4>
            <p className="text-xs text-slate-500">Never charge job seekers any fee.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Globe className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="font-bold text-slate-800">Daily Jobs</h4>
            <p className="text-xs text-slate-500">Fresh tech openings updated daily.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <ExternalLink className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="font-bold text-slate-800">Verified Openings</h4>
            <p className="text-xs text-slate-500">Links lead directly to the employer.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600 text-sm">
        <div>
          <h4 className="font-bold text-slate-800 mb-2">Contact</h4>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">support@getjoblink.in</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">+91 99999 99999</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2">Location</h4>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">Bengaluru, India</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2">Platform</h4>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <a href="#jobs" className="text-slate-500 hover:text-blue-600 transition">Explore Jobs</a>
            </li>
            <li className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <a href="#builder" className="text-slate-500 hover:text-blue-600 transition">Resume Builder</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}