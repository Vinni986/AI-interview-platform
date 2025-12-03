import React from 'react';
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Brain, Mic, ArrowRight, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

export default function HomePage() {
  const navigate = useNavigate();

  const goToHRLogin = () => {
    navigate("/hr-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl text-gray-900">AI HR Interview</span>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Zap className="w-3 h-3" />
                <span>Powered by Gemini AI</span>
              </div>
            </div>
          </div>

          <Button
            onClick={goToHRLogin}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
          >
            HR Login
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 relative overflow-hidden">

        {/* BG Blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Next-Generation Recruitment Platform</span>
            </div>

            <h1 className="text-6xl lg:text-7xl text-gray-900 mb-8 leading-tight">
              AI-Powered Hiring
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your recruitment with intelligent CV analysis, automated voice interviews,
              and AI-driven candidate evaluation.
            </p>

            <div className="flex justify-center mb-12">
              <Button
                size="lg"
                onClick={goToHRLogin}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/30 h-14 px-8 text-lg"
              >
                Get Started as HR
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Setup in 5 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>100% Automated</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-gray-500">AI HR Dashboard</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="text-3xl text-blue-600 mb-2">156</div>
                  <div className="text-gray-700">Applications</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="text-3xl text-green-600 mb-2">42</div>
                  <div className="text-gray-700">Accepted</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="text-3xl text-purple-600 mb-2">8.7</div>
                  <div className="text-gray-700">Avg Score</div>
                </div>
              </div>

              <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* (kept same as yours) */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600 relative">
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl lg:text-5xl text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>

          <Button
            size="lg"
            onClick={goToHRLogin}
            className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl h-14 px-8 text-lg"
          >
            Start Hiring with AI Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
