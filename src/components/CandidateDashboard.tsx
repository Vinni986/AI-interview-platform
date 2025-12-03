import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Mic,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Beaker,
} from "lucide-react";
import apiService from "../services/api";
import config from "../config";

export default function InterviewPortal() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const email = searchParams.get("email");
  const testMode = searchParams.get("test") === "true" && config.features.testModeEnabled;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Fetch interview session
  useEffect(() => {
    if (!eventId || !email) {
      setError("Invalid interview link. Please check your email for the correct link.");
      setLoading(false);
      return;
    }

    loadInterviewSession();
  }, [eventId, email, testMode]);

  async function loadInterviewSession() {
    try {
      setLoading(true);
      setError(null);

      // 🧪 TEST MODE: Skip API call and create fake active session
      if (testMode) {
        console.log("🧪 TEST MODE ENABLED: Bypassing schedule check");
        
        setData({
          firstName: email!.split("@")[0],
          eventName: "Interview (Test Mode)",
          scheduled_time: new Date().toISOString(),
          interview_status: "active", // Force active status
          time_remaining_mins: 30,
        });
        
        setLoading(false);
        return;
      }

      // ✅ Use apiService instead of direct fetch
      const response = await apiService.getInterviewSession(eventId!, email!);

      if (!response.success) {
        setError(response.message || "Interview not found");
      } else {
        setData(response.data);

        // Setup countdown (seconds)
        if (response.data.interview_status === "too_early") {
          setCountdown(
            Math.max(0, Math.floor(response.data.time_until_start_ms / 1000))
          );
        }
      }
    } catch (err: any) {
      console.error("Failed to load interview session:", err);
      setError(err.message || "Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Auto-refresh when countdown reaches zero
  useEffect(() => {
    if (countdown === 0 && data?.interview_status === "too_early") {
      console.log("⏰ Countdown finished, refreshing session status...");
      loadInterviewSession();
    }
  }, [countdown]);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const formatCountdown = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const startInterview = () => {
    setStarting(true);
    // Pass test mode to the live interview page
    const testParam = testMode ? "&test=true" : "";
    window.location.href = `/interview/live?eventId=${eventId}&email=${email}${testParam}`;
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading your interview session...</p>
      </div>
    );
  }

  // ERROR SCREEN
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-xl p-10 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="text-gray-700 mb-1">
              <strong>Event ID:</strong> {eventId || "Not provided"}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {email || "Not provided"}
            </p>
          </div>

          <Button
            onClick={() => loadInterviewSession()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const status = data.interview_status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Welcome, {data.firstName}
              </h1>
              <p className="text-gray-600 mt-1">AI-Powered Interview Portal</p>
            </div>
            
            {/* Test Mode Badge */}
            {testMode && (
              <div className="bg-orange-100 border border-orange-300 px-4 py-2 rounded-full flex items-center gap-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                <span className="text-orange-700 font-semibold text-sm">
                  TEST MODE
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl border">

          {/* INTERVIEW DETAILS */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {data.eventName}
            </h2>
            <p className="text-gray-600 text-lg">
              Scheduled for{" "}
              <span className="font-semibold text-gray-900">
                {formatDate(data.scheduled_time)} at{" "}
                {formatTime(data.scheduled_time)}
              </span>
              <span className="text-gray-500"> (IST)</span>
            </p>
          </div>

          {/* WAITING ROOM / COUNTDOWN */}
          {status === "too_early" && (
            <div className="text-center">
              <Clock className="w-14 h-14 text-purple-600 mx-auto mb-4 animate-pulse" />

              <h3 className="text-2xl font-bold text-purple-700 mb-3">
                Your interview will begin soon
              </h3>

              <p className="text-lg text-gray-600 mb-6">
                The interview will start automatically at the scheduled time.
              </p>

              <div className="text-6xl font-mono font-bold text-blue-700 mb-8 animate-[pulse_2.5s_ease-in-out_infinite]">
                {formatCountdown(countdown || 0)}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 font-medium">
                  ⏰ Please wait. The "Join Now" button will activate automatically when it's time.
                </p>
              </div>

              <Button
                disabled
                className="w-full h-14 bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                <Play className="w-5 h-5 mr-2" /> Join Now
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                Time remaining until interview starts
              </p>
            </div>
          )}

          {/* LIVE */}
          {status === "active" && (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4 animate-bounce" />

              <h3 className="text-3xl font-bold text-green-700 mb-4">
                {testMode ? "🧪 Test Mode Active" : "Interview is LIVE"}
              </h3>

              <p className="text-lg text-gray-600 mb-4">
                {testMode ? "Ready to test the interview system" : "Time Remaining:"}
              </p>

              {!testMode && (
                <div className="text-5xl font-bold text-green-700 mb-8">
                  {data.time_remaining_mins} mins
                </div>
              )}

              {testMode && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
                  <p className="text-orange-800 font-semibold">
                    <Beaker className="w-5 h-5 inline mr-2" />
                    Schedule validation is disabled for testing
                  </p>
                </div>
              )}

              <Button
                onClick={startInterview}
                disabled={starting}
                className={`w-full h-16 text-xl font-bold ${
                  testMode
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700 animate-pulse"
                }`}
              >
                {starting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3" /> 
                    {testMode ? "Start Test Interview" : "Join Interview Now"}
                  </>
                )}
              </Button>

              {!testMode && (
                <p className="text-sm text-gray-500 mt-4">
                  Click the button above to begin your interview
                </p>
              )}
            </div>
          )}

          {/* EXPIRED */}
          {status === "expired" && (
            <div className="text-center">
              <XCircle className="w-14 h-14 text-red-600 mx-auto mb-4" />
              
              <h3 className="text-3xl font-bold text-red-700 mb-4">
                Interview Expired
              </h3>
              
              <p className="text-gray-600 mb-6">
                The scheduled interview time has passed.
              </p>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800 text-sm">
                  Please contact HR if you need to reschedule your interview.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}