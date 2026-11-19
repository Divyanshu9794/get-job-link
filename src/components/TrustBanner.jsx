import { ShieldCheck } from "lucide-react";

export default function TrustBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200/70 text-emerald-900 px-4 sm:px-6 py-3 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span>100% Free for Candidates — Direct links to verified employers. No spam, no hidden fees.</span>
      </div>
      <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-200/50">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Verified Employer Feeds</span>
      </div>
    </div>
  );
}
