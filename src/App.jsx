import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingFeedbackWidget from "./components/FloatingFeedbackWidget";

// Critical landing page loaded synchronously for immediate render
import JobListingPage from "./pages/JobListingPage";

// Other pages code-split dynamically
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ResumePage = lazy(() => import("./pages/ResumePage"));
const AtsCheckerPage = lazy(() => import("./pages/AtsCheckerPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CareerGuidesPage = lazy(() => import("./pages/CareerGuidesPage"));
const CareerGuideDetailPage = lazy(() => import("./pages/CareerGuideDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const EditorialPolicyPage = lazy(() => import("./pages/EditorialPolicyPage"));
const HiringRadarPage = lazy(() => import("./pages/HiringRadarPage"));
const CompanyIntelligencePage = lazy(() => import("./pages/CompanyIntelligencePage"));

function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
            {/* Responsive Navbar with Single Login & Profile Dropdown */}
            <Navbar />

            {/* Application Routes */}
            <div className="flex-1">
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  {/* Home & Job Categories */}
                  <Route path="/" element={<JobListingPage />} />
                  <Route path="/jobs/india" element={<JobListingPage />} />
                  <Route path="/jobs/world" element={<JobListingPage />} />
                  <Route path="/jobs/remote" element={<JobListingPage />} />

                  {/* Dedicated Job Detail Route */}
                  <Route path="/job/:jobId" element={<JobDetailPage />} />

                  {/* Public Hiring Radar & Company Intelligence */}
                  <Route path="/hiring-radar" element={<HiringRadarPage />} />
                  <Route path="/hiring-radar/company/:companySlug" element={<CompanyIntelligencePage />} />

                  {/* Editorial Career Guides */}
                  <Route path="/career-guides" element={<CareerGuidesPage />} />
                  <Route path="/career-guides/:slug" element={<CareerGuideDetailPage />} />

                  {/* Candidate Tools */}
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/ats-checker" element={<AtsCheckerPage />} />

                  {/* User Profile & Saved Jobs */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/saved-jobs" element={<ProfilePage />} />

                  {/* About, Contact & Trust Pages */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/editorial-policy" element={<EditorialPolicyPage />} />

                  {/* Legal Pages with Aliases */}
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/terms-and-conditions" element={<TermsPage />} />

                  {/* Separate Secure Admin Gateway */}
                  <Route path="/admin" element={<AdminPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/jobs/india" replace />} />
                </Routes>
              </Suspense>
            </div>

            {/* Global Footer */}
            <Footer />

            {/* Global Floating Feedback Widget */}
            <FloatingFeedbackWidget />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
