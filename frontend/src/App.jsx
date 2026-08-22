import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Opportunities from './pages/student/Opportunities';
import Applications from './pages/student/Applications';
import InterviewCenter from './pages/student/InterviewCenter';
import Readiness from './pages/student/Readiness';

// College Admin Pages
import CollegeDashboard from './pages/college/Dashboard';
import Students from './pages/college/Students';
import Companies from './pages/college/Companies';
import Drives from './pages/college/Drives';
import DriveDetail from './pages/college/DriveDetail';
import Venues from './pages/college/Venues';
import DynamicReplanning from './pages/college/DynamicReplanning';
import SkillGapAnalytics from './pages/college/SkillGapAnalytics';

// Company Recruiter Pages
import CompanyDashboard from './pages/company/Dashboard';
import CandidatePipeline from './pages/company/CandidatePipeline';
import InterviewResults from './pages/company/InterviewResults';
import JobRoles from './pages/company/JobRoles';
import InterviewPanels from './pages/company/InterviewPanels';
import InterviewScheduling from './pages/company/InterviewScheduling';
import Notifications from './pages/company/Notifications';

import useAuthStore from './store/authStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'college_admin') return <Navigate to="/college/dashboard" replace />;
    if (user.role === 'company_recruiter') return <Navigate to="/company/dashboard" replace />;
  }

  return children;
};

export default function App() {
  const { isAuthenticated, user, hydrateFromToken, loading } = useAuthStore();

  useEffect(() => {
    hydrateFromToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Redirect root */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate
                to={
                  user.role === 'college_admin' ? '/college/dashboard' :
                  user.role === 'company_recruiter' ? '/company/dashboard' :
                  '/student/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
        <Route path="/student/opportunities" element={<ProtectedRoute allowedRoles={['student']}><Opportunities /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><Applications /></ProtectedRoute>} />
        <Route path="/student/interview-center" element={<ProtectedRoute allowedRoles={['student']}><InterviewCenter /></ProtectedRoute>} />
        <Route path="/student/readiness" element={<ProtectedRoute allowedRoles={['student']}><Readiness /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><Notifications /></ProtectedRoute>} />

        {/* College Admin Routes */}
        <Route path="/college/dashboard" element={<ProtectedRoute allowedRoles={['college_admin']}><CollegeDashboard /></ProtectedRoute>} />
        <Route path="/college/students" element={<ProtectedRoute allowedRoles={['college_admin']}><Students /></ProtectedRoute>} />
        <Route path="/college/companies" element={<ProtectedRoute allowedRoles={['college_admin']}><Companies /></ProtectedRoute>} />
        <Route path="/college/drives" element={<ProtectedRoute allowedRoles={['college_admin']}><Drives /></ProtectedRoute>} />
        <Route path="/college/drives/:id" element={<ProtectedRoute allowedRoles={['college_admin']}><DriveDetail /></ProtectedRoute>} />
        <Route path="/college/venues" element={<ProtectedRoute allowedRoles={['college_admin']}><Venues /></ProtectedRoute>} />
        <Route path="/college/dynamic-replanning" element={<ProtectedRoute allowedRoles={['college_admin']}><DynamicReplanning /></ProtectedRoute>} />
        <Route path="/college/skill-gap-analytics" element={<ProtectedRoute allowedRoles={['college_admin']}><SkillGapAnalytics /></ProtectedRoute>} />

        {/* Company Recruiter Routes */}
        <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['company_recruiter']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/job-roles" element={<ProtectedRoute allowedRoles={['company_recruiter']}><JobRoles /></ProtectedRoute>} />
        <Route path="/company/candidate-pipeline" element={<ProtectedRoute allowedRoles={['company_recruiter']}><CandidatePipeline /></ProtectedRoute>} />
        <Route path="/company/pipeline" element={<ProtectedRoute allowedRoles={['company_recruiter']}><CandidatePipeline /></ProtectedRoute>} />
        <Route path="/company/interview-panels" element={<ProtectedRoute allowedRoles={['company_recruiter']}><InterviewPanels /></ProtectedRoute>} />
        <Route path="/company/scheduling" element={<ProtectedRoute allowedRoles={['company_recruiter']}><InterviewScheduling /></ProtectedRoute>} />
        <Route path="/company/interview-results" element={<ProtectedRoute allowedRoles={['company_recruiter']}><InterviewResults /></ProtectedRoute>} />
        <Route path="/company/notifications" element={<ProtectedRoute allowedRoles={['company_recruiter']}><Notifications /></ProtectedRoute>} />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
