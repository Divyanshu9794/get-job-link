import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  X,
  Plus,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const POPULAR_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "React Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "Android Developer",
  "Data Analyst",
  "DevOps Engineer",
  "QA / Test Engineer",
];

const POPULAR_SKILLS = [
  "React",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "AWS",
  "Docker",
  "Next.js",
  "MongoDB",
  "Git",
  "REST APIs",
  "Tailwind CSS",
];

const POPULAR_LOCATIONS = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Delhi NCR",
  "Mumbai",
  "Chennai",
  "Remote",
];

export default function PreferencesModal({ isOpen, onClose, onSaved }) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [roles, setRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher (0 - 1 Years)");
  const [workMode, setWorkMode] = useState("Any");
  const [jobType, setJobType] = useState("Full Time");
  const [saving, setSaving] = useState(false);

  // Load preferences from userProfile or localStorage
  useEffect(() => {
    let initial = null;
    if (userProfile?.preferences) {
      initial = userProfile.preferences;
    } else {
      try {
        const stored = localStorage.getItem("gjl_user_preferences");
        if (stored) initial = JSON.parse(stored);
      } catch (e) {
        console.warn("Could not parse local preferences:", e);
      }
    }

    if (initial) {
      setRoles(initial.preferredRoles || []);
      setSkills(initial.skills || []);
      setLocations(initial.preferredLocations || []);
      setExperienceLevel(initial.experienceLevel || "Fresher (0 - 1 Years)");
      setWorkMode(initial.workMode || "Any");
      setJobType(initial.jobType || "Full Time");
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const toggleArrayItem = (setter, item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomRole = (e) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    if (!roles.includes(roleInput.trim())) {
      setRoles([...roles, roleInput.trim()]);
    }
    setRoleInput("");
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput("");
  };

  const handleAddCustomLocation = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    if (!locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
    }
    setLocationInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    const prefsData = {
      preferredRoles: roles,
      skills,
      preferredLocations: locations,
      experienceLevel,
      workMode,
      jobType,
      isRemoteOnly: workMode === "Remote",
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save locally for instantaneous offline / guest capability
      localStorage.setItem("gjl_user_preferences", JSON.stringify(prefsData));

      // 2. Broadcast update across all open components
      window.dispatchEvent(new CustomEvent("gjl_preferences_updated", { detail: prefsData }));

      // 3. Persist to Firestore if user is authenticated
      if (currentUser && updateUserProfile) {
        try {
          await updateUserProfile({ preferences: prefsData });
        } catch (syncErr) {
          console.warn("Firestore preferences remote sync notice:", syncErr.message);
        }
      }

      showToast("Career preferences saved! Your feed is now personalized.");
      if (onSaved) onSaved(prefsData);
      onClose();
    } catch (err) {
      console.error("Error saving preferences:", err);
      showToast("Career preferences saved locally.", "info");
      if (onSaved) onSaved(prefsData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Customize Your Job Discovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your target roles, skills, and work preferences for high-precision match scores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5 text-xs">
          {/* 1. Target Roles */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Target Job Roles (Select or type custom)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_ROLES.map((role) => {
                const isSelected = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleArrayItem(setRoles, role)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? `✓ ${role}` : role}
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleAddCustomRole} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add other role (e.g. AI Engineer)..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* 2. Top Skills */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Technical Skills &amp; Stack
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleArrayItem(setSkills, skill)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? `✓ ${skill}` : skill}
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Flutter, Golang)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* 3. Experience & Job Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium"
              >
                <option>Fresher (0 - 1 Years)</option>
                <option>1 - 2 Years</option>
                <option>2 - 4 Years</option>
                <option>More than 4 years</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="Any">Any Mode</option>
                <option value="Remote">100% Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Opportunity Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="Full Time">Full-Time Only</option>
                <option value="Internship">Internship Only</option>
                <option value="Any">Any (Full-time &amp; Intern)</option>
              </select>
            </div>
          </div>

          {/* 4. Preferred Locations */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Preferred Locations
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = locations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleArrayItem(setLocations, loc)}
                    className={`px-3 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? `✓ ${loc}` : loc}
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleAddCustomLocation} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Or add another location/city..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-xs"
          >
            Skip for now
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
