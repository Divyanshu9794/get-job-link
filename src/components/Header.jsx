import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.jpeg";
import {
  LayoutGrid, Table
} from "lucide-react";

export default function Header({ currentUser, isAdmin, onLogin, onLogout, onSearch }) {
  const location = window.location.pathname;

  const isActive = (path) => location === path || (path !== "/" && location.startsWith(path));

  const Nav = [
    { to: "/", label: "Home", icon: LayoutGrid },
    { to: "/jobs", label: "Jobs", icon: LayoutGrid },
    { to: "/resume", label: "Resume", icon: Table },
    { to: "/ats", label: "ATS", icon: Table },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Table }] : []),
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(document.getElementById("search-input").value);
  };

  return (
    <header className="bg-white/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 select-none shrink-0">
          <Link to="/" className="flex items-center space-x-2.5">
            <img src={logoImg} alt="Get Job Link Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline">
              GetJob<span className="text-blue-600">Link</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-2">
          <label htmlFor="search-input" className="sr-only">Search jobs and companies</label>
          <div className="relative">
            {/* Search icon rendered via CSS background or inline SVG */}
            <input
              id="search-input"
              type="search"
              placeholder="Search jobs by title, company, or tech stack..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <nav className="hidden md:flex items-center space-x-1">
            {Nav.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
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
      </div>
    </header>
  );
}