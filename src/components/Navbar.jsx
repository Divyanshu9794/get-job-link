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
  Bell,
  SlidersHorizontal,
  Mail,
} from "lucide-react";
import logoImg from "../assets/logo.jpeg";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "./ThemeToggle";
import PreferencesModal from "./PreferencesModal";
import NewsletterDigestModal from "./NewsletterDigestModal";
import { useActiveUsers } from "../utils/useActiveUsers";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [digestModalOpen, setDigestModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const activeUsers = useActiveUsers();

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
    { name: "For You", path: "/for-you", icon: Sparkles, badge: "Matches" },
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
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <Link
            to="/jobs/india"
            className="flex items-center space-x-2.5 group select-none shrink-0"
            onClick={handleNavClick}
          >
            <img
              src={logoImg}
              alt="GetJobLink Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-xs border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                GetJob<span className="text-blue-600 dark:text-blue-400">Link</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-1 hidden sm:inline">
                Verified Daily Tech Jobs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center space-x-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Theme Toggle + Login / Profile Dropdown */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            {/* Real-Time Total Active Users on Website */}
            <div
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold select-none shadow-2xs transition-all hover:scale-102"
              title={`${activeUsers} verified active job seekers on GetJobLink right now`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold tabular-nums tracking-tight">{activeUsers}</span>
              <span className="hidden xl:inline text-[11px] text-emerald-800/90 dark:text-emerald-300/90 font-medium">Active Online</span>
            </div>

            <button
              type="button"
              onClick={() => setDigestModalOpen(true)}
              title="Subscribe to Weekly Tech Jobs Digest"
              className="inline-flex items-center space-x-1.5 px-2.5 xl:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden xl:inline whitespace-nowrap">Weekly Digest</span>
            </button>

            <ThemeToggle />

            {!currentUser ? (
              <button
                onClick={handleLogin}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="max-w-[75px] xl:max-w-[110px] truncate">
                    {currentUser.displayName || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Profile Menu Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName || "User"}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/profile?tab=resume"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>My Resume</span>
                    </Link>

                    <Link
                      to="/profile/saved-jobs"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>My Saved Jobs</span>
                      </div>
                      {savedJobIds.size > 0 && (
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded-full">
                          {savedJobIds.size}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/alerts"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span>Smart Job Alerts</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setPrefModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      <span>Career Preferences</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setDigestModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Weekly Tech Digest</span>
                    </button>

                    <Link
                      to="/profile?tab=history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>My ATS History</span>
                    </Link>

                    {/* Authorized Admins Only */}
                    {isAdmin && (
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
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
          <div className="flex items-center space-x-1.5 sm:space-x-2 lg:hidden">
            {/* Real-Time Total Active Users on Website (Mobile) */}
            <div
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold select-none"
              title={`${activeUsers} active users on website right now`}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="tabular-nums font-black">{activeUsers}</span>
            </div>

            <ThemeToggle compact />

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
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700"
                aria-label="My Profile"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-6 h-6 rounded-md object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in fade-in">
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
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/50"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Preferences & Digest for all mobile users */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                setPrefModalOpen(true);
              }}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                setDigestModalOpen(true);
              }}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Weekly Digest</span>
            </button>
          </div>

          {/* User Profile Links in Mobile Menu */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Signed in as {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/profile?tab=resume"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Resume</span>
                </Link>
                <Link
                  to="/profile/saved-jobs"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>Saved Jobs ({savedJobIds.size})</span>
                </Link>
                <Link
                  to="/profile?tab=history"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>ATS History</span>
                </Link>
                <Link
                  to="/alerts"
                  onClick={handleNavClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>Job Alerts</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    setPrefModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preferences</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    setDigestModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Weekly Digest</span>
                </button>
              </div>

              {/* Mobile Admin Link if Admin */}
              {isAdmin && (
                <div className="pt-1.5">
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60"
                  >
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>

    {/* Preferences Customizer Modal */}
    <PreferencesModal
      isOpen={prefModalOpen}
      onClose={() => setPrefModalOpen(false)}
    />

    {/* Weekly Tech Jobs Digest Modal */}
    <NewsletterDigestModal
      isOpen={digestModalOpen}
      onClose={() => setDigestModalOpen(false)}
    />
  </>
);
}
