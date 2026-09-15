import logoImg from "../assets/logo.jpeg";
import { LayoutGrid, Table } from "lucide-react";

export default function Header({ currentUser, isAdmin, onLogin, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 select-none shrink-0">
          <img src={logoImg} alt="Get Job Link Logo - Direct Hiring Platform" className="w-8 h-8 object-contain rounded-lg" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline">
            GetJob<span className="text-blue-600">Link</span>
          </span>
        </div>

        <div className="flex-1 max-w-2xl mx-2">
          <label htmlFor="search-input" className="sr-only">Search jobs and companies</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Search jobs by title, company, or tech stack..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              {currentUser.photoURL && <img src={currentUser.photoURL} alt="User avatar" className="w-7 h-7 rounded-full border border-slate-200" />}
              <button onClick={onLogout} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}