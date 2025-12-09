import React, { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Loader2, ChevronRight, AlertCircle, FlaskConical, Mic, MicOff } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(false);

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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* HEADER */}
      {connected && (
        <header className="border-b border-gray-300 px-8 py-5">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex items-center gap-3">
              {testMode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 border border-orange-300 rounded-full">
                  <FlaskConical className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-700 font-semibold">TEST</span>
                </span>
              )}
              {connected && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-700 font-semibold">Live</span>
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-5xl">
          
          {/* NOT CONNECTED - START SCREEN */}
          {!connected && !connecting && (
            <div className="text-center">
              <div className="bg-gray-50 rounded-2xl border border-gray-300 p-16 mb-8">
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
              <div className="bg-gray-50 rounded-2xl border border-gray-300 p-16">
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
              {/* SPLIT SCREEN - INTERVIEWER & CANDIDATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* INTERVIEWER SIDE */}
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 border-4 border-purple-300 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Interviewer</h3>
                </div>

                {/* CANDIDATE SIDE (YOU) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-gray-400 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">You</h3>
                </div>
              </div>

              {/* CONTROL BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-6 py-2 rounded-full border border-gray-400 text-sm font-semibold 
                  bg-white hover:bg-gray-100
                  transition-all flex items-center justify-center gap-2 text-gray-900"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </button>

                <button
                  onClick={endConversation}
                  className="px-6 py-2 rounded-full border border-gray-400 text-sm font-semibold 
                  bg-white hover:bg-gray-100
                  transition-all flex items-center justify-center gap-2 text-gray-900"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-300 py-4 px-8 text-center">
        <p className="text-sm text-gray-600">
          Powered by <span className="font-semibold">FoloUp</span> 
          <span className="ml-1 text-blue-600">↗</span>
        </p>
      </footer>
    </div>
  );
}