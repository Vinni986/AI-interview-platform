import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./components/HomePage";
import HRLogin from "./components/HRLogin";
import HRSignup from "./components/HRSignup";
import HRDashboard from "./components/HRDashboard";
import InterviewPortal from "./components/CandidateDashboard";
import InterviewLive from "./components/InterviewLive";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* HR Auth */}
        <Route path="/hr-login" element={<HRLogin />} />
        <Route path="/hr-signup" element={<HRSignup />} />

        {/* HR Dashboard with protection */}
        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        {/* Candidate Pages */}
        <Route path="/interview" element={<InterviewPortal />} />
        <Route path="/interview/live" element={<InterviewLive />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;





