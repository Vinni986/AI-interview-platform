import React, { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Loader2, ChevronRight, AlertCircle, FlaskConical } from "lucide-react";
import { Conversation } from "@11labs/client";
import config from "../config";

export default function InterviewLive() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const eventId = searchParams.get("eventId");
  const email = searchParams.get("email");
  const testMode = searchParams.get("test") === "true" && config.features.testModeEnabled;

  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [unexpectedDisconnect, setUnexpectedDisconnect] = useState(false);

  const conversationRef = useRef<any>(null);
  const hasConnectedRef = useRef(false);

  const isConfigured = !!config.elevenLabs.agentId;

async function startElevenLabsConversation() {
  if (!isConfigured) {
    setError("Interview service not configured. Please contact support.");
    return;
  }

  setConnecting(true);
  setError(null);
  setUnexpectedDisconnect(false);
  hasConnectedRef.current = false;

  try {
    console.log("🔌 Starting ElevenLabs session...");
    console.log("Candidate Email:", email);
    console.log("Event ID:", eventId);
    console.log("Test Mode:", testMode);

    const conversation = await Conversation.startSession({
      agentId: config.elevenLabs.agentId,
      connectionType: "webrtc",
      
      onConnect: () => {
        console.log("✅ Connected to ElevenLabs");
        hasConnectedRef.current = true;
        setConnected(true);
        setConversationActive(true);
        setConnecting(false);
      },
      
      onDisconnect: () => {
        console.log("❌ Disconnected from ElevenLabs");
        
        // If we connected but then disconnected unexpectedly (not user-initiated)
        if (hasConnectedRef.current && conversationActive) {
          console.log("⚠️ Unexpected disconnect - likely quota issue");
          setUnexpectedDisconnect(true);
          setError("Connection lost. This is usually caused by insufficient ElevenLabs credits. Please check your account balance.");
        }
        
        setConnected(false);
        setConversationActive(false);
      },
      
      onMessage: (message: any) => {
        console.log("📨 Message:", message);
        
        if (message.source === "ai" || message.type === "agent") {
          const text = message.message || message.text;
          setCurrentQuestion(text);
          setTranscript(prev => [...prev, { role: "agent", text }]);
        } else if (message.source === "user" || message.type === "user") {
          const text = message.message || message.text;
          setTranscript(prev => [...prev, { role: "user", text }]);
        }
      },
      
      onError: (error: any) => {
        console.error("❌ ElevenLabs Error:", error);
        setError(error.message || "Connection error");
        setConnecting(false);
      },
    });

    conversationRef.current = conversation;
    console.log("✅ Conversation started successfully");

  } catch (err: any) {
    console.error("❌ Failed to start conversation:", err);
    
    let errorMessage = "Failed to connect to interview system";
    
    if (err.message?.includes('agent')) {
      errorMessage = "Invalid agent configuration. Please contact support.";
    } else if (err.message?.includes('microphone') || err.message?.includes('permission')) {
      errorMessage = "Microphone access denied. Please allow microphone access and try again.";
    } else if (err.message?.includes('network')) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (err.message?.includes('quota') || err.message?.includes('credit') || err.message?.includes('limit') || err.message?.includes('balance')) {
      errorMessage = "ElevenLabs quota exceeded. Please add credits to your account at elevenlabs.io";
    } else if (err.message?.includes('Unknown connection type')) {
      errorMessage = "Configuration error. Please contact support.";
    }
    
    setError(errorMessage);
    setConnecting(false);
  }
}

  function endConversation() {
    if (conversationRef.current) {
      try {
        conversationRef.current.endSession();
      } catch (err) {
        console.error("Error ending session:", err);
      }
      conversationRef.current = null;
    }
    hasConnectedRef.current = false;
    setConnected(false);
    setConversationActive(false);
  }

  function completeInterview() {
    endConversation();
    
    const confirmed = window.confirm(
      "Interview Completed!\n\nThank you for your time. You will receive feedback via email within 24-48 hours.\n\nClick OK to return to home."
    );
    
    if (confirmed) {
      navigate("/");
    }
  }

  // ERROR STATE OR UNEXPECTED DISCONNECT
  if ((error && !connected) || unexpectedDisconnect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-red-200 p-10 max-w-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {unexpectedDisconnect ? "Connection Lost" : "Connection Failed"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The connection was lost unexpectedly. This is typically caused by insufficient ElevenLabs credits."}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={startElevenLabsConversation}
              disabled={!isConfigured}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
            >
              Return to Home
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-900 font-semibold mb-2">
              💳 Check Your ElevenLabs Credits
            </p>
            <p className="text-xs text-yellow-800 mb-3">
              Conversational AI requires active credits. Please verify your balance:
            </p>
            <a 
              href="https://elevenlabs.io/app/usage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg font-semibold transition-all"
            >
              Check ElevenLabs Account →
            </a>
          </div>

          {transcript.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
              <p className="text-xs font-semibold text-gray-700 mb-2">Partial Transcript:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {transcript.map((item, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    <strong>{item.role === "agent" ? "AI:" : "You:"}</strong> {item.text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900">
      {/* HEADER */}
      <header className="backdrop-blur-md bg-white/80 border-b border-gray-200 p-6 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
              AI Voice Interview
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Powered by ElevenLabs Conversational AI
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-600 text-sm">{email}</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              {testMode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 border border-orange-300 rounded-full">
                  <FlaskConical className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-700 font-semibold">TEST</span>
                </span>
              )}
              {connected && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-700 font-semibold">LIVE</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="container mx-auto max-w-6xl py-14 px-6">
        
        {/* NOT CONNECTED - START SCREEN */}
        {!connected && !connecting && (
          <div className="text-center">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-16 mb-8">
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Interview?
              </h2>
              
              <p className="text-gray-600 text-lg mb-8">
                Click below to connect with our AI interviewer.<br/>
                Make sure your microphone is enabled.
              </p>

              <button
                onClick={startElevenLabsConversation}
                disabled={!isConfigured}
                className="px-16 py-6 rounded-full shadow-lg text-2xl font-bold 
                bg-gradient-to-r from-green-600 to-blue-600
                hover:from-green-700 hover:to-blue-700
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-4 mx-auto 
                text-white"
              >
                Start Interview
              </button>

              {!isConfigured && (
                <p className="text-red-600 text-sm mt-4">
                  ⚠️ Interview service not configured
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Interview Tips:</h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left max-w-md mx-auto">
                <li>✓ Speak clearly and at a normal pace</li>
                <li>✓ Find a quiet environment</li>
                <li>✓ Take your time to think before answering</li>
                <li>✓ Be honest and authentic</li>
                <li>✓ Ensure stable internet connection</li>
              </ul>
            </div>
          </div>
        )}

        {/* CONNECTING */}
        {connecting && (
          <div className="text-center">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-16">
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connecting to AI Interviewer...
              </h2>
              <p className="text-gray-600">Please wait a moment</p>
            </div>
          </div>
        )}

        {/* CONNECTED - SPLIT SCREEN UI */}
        {connected && conversationActive && (
          <div className="space-y-6">
            {/* ✅ SPLIT SCREEN - INTERVIEWER & CANDIDATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* INTERVIEWER SIDE */}
              <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-300 flex items-center justify-center shadow-xl">
                    <svg className="w-24 h-24 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Interviewer</h3>
                <div className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold">Speaking</span>
                </div>
              </div>

              {/* CANDIDATE SIDE (YOU) */}
              <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-gray-400 flex items-center justify-center shadow-xl">
                    <svg className="w-24 h-24 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You</h3>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold">Listening</span>
                </div>
              </div>
            </div>

            {/* CURRENT QUESTION (Optional - shows below avatars) */}
            {currentQuestion && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-2">Current Question:</p>
                <p className="text-xl font-semibold text-gray-900">{currentQuestion}</p>
              </div>
            )}

            {/* CONTROL BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={endConversation}
                className="px-8 py-4 rounded-full shadow-lg text-lg font-bold 
                bg-gradient-to-r from-red-600 to-orange-500
                hover:from-red-700 hover:to-orange-600
                transition-all flex items-center justify-center gap-3 text-white"
              >
                <PhoneOff className="w-6 h-6" />
                End Interview
              </button>

              <button
                onClick={completeInterview}
                className="px-8 py-4 rounded-full shadow-lg text-lg font-bold 
                bg-gradient-to-r from-green-600 to-blue-600
                hover:from-green-700 hover:to-blue-700
                transition-all flex items-center justify-center gap-3 text-white"
              >
                <ChevronRight className="w-6 h-6" />
                Complete Interview
              </button>
            </div>

            {/* Live Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-6 py-3 rounded-full">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-700 font-semibold">Interview in Progress</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}