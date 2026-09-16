import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "../App";
import HomePage from "../pages/HomePage";
import JobListPage from "../pages/JobListPage";
import JobDetailPage from "../pages/JobDetailPage";
import ResumeBuilder from "../pages/ResumeBuilder";
import ATSEvaluator from "../pages/ATSEvaluator";
import AdminPage from "../pages/AdminPage";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Router() {
  const { currentUser, isAdmin, onLogin, onLogout } = useApp();

  return (
    <BrowserRouter>
      <Header currentUser={currentUser} isAdmin={isAdmin} onLogin={onLogin} onLogout={onLogout} />
      <main className="page-enter min-h-[calc(100vh-80px)] flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="/ats" element={<ATSEvaluator />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}