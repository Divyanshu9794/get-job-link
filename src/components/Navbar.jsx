import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Sparkles,
  Info,
  Shield,
  Menu,
  X,
  LogOut,
  User,
  Bookmark,
  History,
  BookOpen,
  ChevronDown,
  LogIn,
  Radio,
} from "lucide-react";
import logoImg from "../assets/logo.jpeg";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, loginWithGoogle, logout, savedJobIds } = useAuth();
  const { showToast } = useToast();

  const currentPath = location.pathname;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/jobs/india" && (currentPath === "/" || currentPath === "/jobs/india")) {
      return true;
    }
    return currentPath.startsWith(path);
  };

  const navLinks = [
    { name: "Jobs", path: "/jobs/india", icon: Briefcase },
    { name: "Hiring Radar", path: "/hiring-radar", icon: Radio },
    { name: "Career Guides", path: "/career-guides", icon: BookOpen },
    { name: "Resume Builder", path: "/resume", icon: FileText },
    { name: "ATS Checker", path: "/ats-checker", icon: Sparkles },
    { name: "About Us", path: "/about", icon: Info },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast("Signed in successfully with Google!");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast("Login failed: " + err.message, "error");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      showToast("Signed out successfully.");
      navigate("/jobs/india");
    } catch (err) {
      showToast("Error signing out: " + err.message, "error");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/jobs/india"
            className="flex items-center space-x-2.5 group select-none shrink-0"
            onClick={handleNavClick}
          >
            <img
              src={logoImg}
              alt="GetJobLink Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-xs border border-slate-200 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                GetJob<span className="text-blue-600">Link</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:inline">
                Verified Daily Tech Jobs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Single Login Button or User Profile Dropdown */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {!currentUser ? (
              <button
                onClick={handleLogin}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">
                    {currentUser.displayName || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Menu Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.displayName || "User"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/profile?tab=resume"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>My Resume</span>
                    </Link>

                    <Link
                      to="/profile/saved-jobs"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>My Saved Jobs</span>
                      </div>
                      {savedJobIds.size > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                          {savedJobIds.size}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/profile?tab=history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>My ATS History</span>
                    </Link>

                    {/* Authorized Admins Only */}
                    {isAdmin && (
                      <div className="pt-1 border-t border-slate-100">
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50/70 hover:bg-amber-100/70 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu & Auth Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {!currentUser ? (
              <button
                onClick={handleLogin}
                className="inline-flex items-center space-x-1 bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <Link
                to="/profile"
                className="p-1 rounded-lg border border-slate-200"
                aria-label="My Profile"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-6 h-6 rounded-md object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in fade-in">
          <div className="grid grid-cols-2 gap-1.5 pt-1 pb-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-50 text-blue-600 font-bold border border-blue-100"
                      : "text-slate-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile Links in Mobile Menu */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Signed in as {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/profile?tab=resume"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Resume</span>
                </Link>
                <Link
                  to="/profile/saved-jobs"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>Saved Jobs ({savedJobIds.size})</span>
                </Link>
                <Link
                  to="/profile?tab=history"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>ATS History</span>
                </Link>
              </div>

              {/* Mobile Admin Link if Admin */}
              {isAdmin && (
                <div className="pt-1.5">
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
