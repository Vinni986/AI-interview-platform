import React, { useEffect, useState } from "react";
import { Loader2, Search, AlertCircle, FileText } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import apiService from "../../services/api";

export default function InterviewQuestionsSection() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.getQuestionsList();

      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error("Failed to load questions:", err);
      setError(err.message || "Failed to load interview questions");
    } finally {
      setLoading(false);
    }
  }

  // Filtered view
  const filteredQuestions = questions.filter(
    (q) =>
      q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.jd_hash?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading questions...</span>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Questions</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={loadQuestions} className="bg-red-600 hover:bg-red-700">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Questions</h1>
          <p className="text-gray-600 mt-1">
            View all interview questions and model answers
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-900">{questions.length}</span> questions
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search by question, role or JD hash..."
          className="pl-10 h-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(questions.map((q) => q.role)).size}
              </p>
              <p className="text-sm text-gray-600">Unique Roles</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter((q) => q.hr_answer).length}
              </p>
              <p className="text-sm text-gray-600">With Model Answers</p>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No questions match your search" : "No questions found"}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map((q, index) => (
              <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  {/* HEADER */}
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {q.role}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-mono text-xs">
                        {q.jd_hash}
                      </span>
                    </div>
                  </div>

                  {/* QUESTION */}
                  <div className="pl-11">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {q.question}
                    </h3>

                    {/* HR ANSWER */}
                    {q.hr_answer && (
                      <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Model Answer
                        </p>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {q.hr_answer}
                        </p>
                      </div>
                    )}

                    {/* NO ANSWER */}
                    {!q.hr_answer && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-gray-500 text-sm italic">
                          No model answer provided
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      {filteredQuestions.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredQuestions.length} of {questions.length} questions
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
}