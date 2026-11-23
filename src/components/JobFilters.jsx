import { useState } from "react";
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Filter,
} from "lucide-react";

export default function JobFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
}) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(filters.experience) ||
    Boolean(filters.employmentType) ||
    Boolean(filters.workMode) ||
    Boolean(filters.country) ||
    Boolean(filters.domain) ||
    Boolean(filters.postedDate);

  const handleFieldChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const activeCount = [
    filters.experience,
    filters.employmentType,
    filters.workMode,
    filters.country,
    filters.domain,
    filters.postedDate,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-4 sm:p-5 mb-6 space-y-3.5 transition-colors duration-150">
      {/* Top Bar: Search Input + Action Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by job title, company, skills, or location..."
            className="w-full h-11 pl-10 pr-9 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className={`lg:hidden flex items-center space-x-1.5 h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
            activeCount > 0
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Reset All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="hidden sm:inline-flex items-center space-x-1.5 h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-900/50 bg-slate-50/80 dark:bg-slate-800/80 transition-all shrink-0"
            title="Reset all filters and search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Desktop Filter Dropdowns (Aligned Grid with Custom Chevrons) */}
      <div className="hidden lg:grid grid-cols-6 gap-2.5 pt-1">
        {/* Experience Filter */}
        <div className="relative">
          <select
            value={filters.experience}
            onChange={(e) => handleFieldChange("experience", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Experience (All)</option>
            <option value="fresher">Fresher (0-1 yrs)</option>
            <option value="1-3">1-3 Years</option>
            <option value="3-5">3-5 Years</option>
            <option value="5+">5+ Years</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Employment Type */}
        <div className="relative">
          <select
            value={filters.employmentType}
            onChange={(e) => handleFieldChange("employmentType", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Job Type (All)</option>
            <option value="Full Time">Full Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Part Time">Part Time</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Work Mode */}
        <div className="relative">
          <select
            value={filters.workMode}
            onChange={(e) => handleFieldChange("workMode", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Work Mode (All)</option>
            <option value="remote">Remote Only</option>
            <option value="onsite">On-Site</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Country */}
        <div className="relative">
          <select
            value={filters.country}
            onChange={(e) => handleFieldChange("country", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Country (All)</option>
            <option value="india">India</option>
            <option value="usa">United States</option>
            <option value="canada">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="germany">Germany</option>
            <option value="singapore">Singapore</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Domain */}
        <div className="relative">
          <select
            value={filters.domain}
            onChange={(e) => handleFieldChange("domain", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Domain (All)</option>
            <option value="Engineering">Engineering / Tech</option>
            <option value="Design">Product Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Management">Management</option>
            <option value="Data Entry">Data Entry / Ops</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Posted Date */}
        <div className="relative">
          <select
            value={filters.postedDate}
            onChange={(e) => handleFieldChange("postedDate", e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="">Posted (Anytime)</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Mobile Filters Dropdown Container */}
      {mobileFilterOpen && (
        <div className="lg:hidden bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Filter Listings</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Experience</label>
              <div className="relative">
                <select
                  value={filters.experience}
                  onChange={(e) => handleFieldChange("experience", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Experience Levels</option>
                  <option value="fresher">Fresher (0-1 yrs)</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="3-5">3-5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Job Type</label>
              <div className="relative">
                <select
                  value={filters.employmentType}
                  onChange={(e) => handleFieldChange("employmentType", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Part Time">Part Time</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Work Mode</label>
              <div className="relative">
                <select
                  value={filters.workMode}
                  onChange={(e) => handleFieldChange("workMode", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Modes</option>
                  <option value="remote">Remote Only</option>
                  <option value="onsite">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Country</label>
              <div className="relative">
                <select
                  value={filters.country}
                  onChange={(e) => handleFieldChange("country", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Countries</option>
                  <option value="india">India</option>
                  <option value="usa">United States</option>
                  <option value="canada">Canada</option>
                  <option value="uk">United Kingdom</option>
                  <option value="germany">Germany</option>
                  <option value="singapore">Singapore</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Domain</label>
              <div className="relative">
                <select
                  value={filters.domain}
                  onChange={(e) => handleFieldChange("domain", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Domains</option>
                  <option value="Engineering">Engineering / Tech</option>
                  <option value="Design">Product Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Data Entry">Data Entry / Ops</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Posted Date</label>
              <div className="relative">
                <select
                  value={filters.postedDate}
                  onChange={(e) => handleFieldChange("postedDate", e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Anytime</option>
                  <option value="24h">Past 24 Hours</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips Bar */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mr-1">Active Filters:</span>
          {Object.entries(filters).map(([key, val]) => {
            if (!val) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/90 dark:border-blue-900/60 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs"
              >
                <span className="capitalize">{key}: {val}</span>
                <button
                  onClick={() => handleFieldChange(key, "")}
                  className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  aria-label={`Remove ${key} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={onClearFilters}
            className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 ml-1 underline transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
