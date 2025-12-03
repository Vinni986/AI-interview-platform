import { Routes, Route } from "react-router-dom";

import HomePage from "./components/HomePage";
import HRLogin from "./components/HRLogin";
import HRDashboard from "./components/HRDashboard";
import InterviewPortal from "./components/CandidateDashboard";
import InterviewLive from "./components/InterviewLive";   
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={<HomePage onHRLogin={() => (window.location.href = "/hr-login")} />}
        />

        <Route path="/hr-login" element={<HRLogin />} />

        <Route path="/hr-dashboard" element={<HRDashboard />} />

        {/* Candidate Waiting Room */}
        <Route path="/interview" element={<InterviewPortal />} />

        {/* Candidate LIVE Interview Page */}
        <Route path="/interview/live" element={<InterviewLive />} />   {/* <-- FIX */}

        {/* fallback */}
        <Route
          path="*"
          element={<HomePage onHRLogin={() => (window.location.href = "/hr-login")} />}
        />
      </Routes>
    </div>
  );
}

export default App;





