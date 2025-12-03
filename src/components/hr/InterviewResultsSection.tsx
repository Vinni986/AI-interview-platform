import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import apiService from "../../services/api";

interface QuestionScore {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

interface CandidateResult {
  id: string;
  name: string;
  email: string;
  role: string;
  jd_hash: string;
  score: number;
  feedback: string;
  status: "accepted" | "rejected" | "pending";
  date: string;
  cvLink: string;
  questionScores: QuestionScore[];
}

export default function InterviewResultsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      setLoading(true);
      setError(null);

      // ✅ Use apiService instead of direct fetch
      const data = await apiService.getResultsList();

      setResults(data.results || []);
    } catch (err: any) {
      console.error("Failed to load results:", err);
      setError(err.message || "Failed to load interview results");
      toast.error("Failed to load interview results");
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = results.filter(
    (result) =>
      result.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    setExporting(true);
    
    try {
      // Convert results to CSV
      const headers = ["Name", "Email", "Role", "JD Hash", "Score", "Status", "Date", "Feedback"];
      const csvData = filteredResults.map(r => [
        r.name,
        r.email,
        r.role,
        r.jd_hash,
        r.score,
        r.status,
        r.date,
        r.feedback?.replace(/"/g, '""') || ''
      ]);

      const csv = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-results-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Results exported successfully");
    } catch (err) {
      toast.error("Failed to export results");
    } finally {
      setExporting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading interview results...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Results</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={loadResults} className="bg-red-600 hover:bg-red-700">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Results</h2>
          <p className="text-gray-600 mt-1">View candidate evaluations and scores</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={exporting || filteredResults.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Candidates"
          value={results.length}
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        <StatCard
          label="Accepted"
          value={results.filter(r => r.status === 'accepted').length}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard
          label="Rejected"
          value={results.filter(r => r.status === 'rejected').length}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="red"
        />
        <StatCard
          label="Pending"
          value={results.filter(r => r.status === 'pending').length}
          icon={<AlertCircle className="w-5 h-5 text-yellow-600" />}
          color="yellow"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No results match your search" : "No interview results yet"}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    JD Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-500">{result.email}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">{result.role}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{result.jd_hash}</td>

                    <td className="px-6 py-4">
                      <ScoreBadge score={result.score} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={result.status} />
                    </td>

                    <td className="px-6 py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCandidate(result)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Candidate Scorecard</DialogTitle>
                          </DialogHeader>
                          {selectedCandidate && (
                            <ScorecardPanel candidate={selectedCandidate} />
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filteredResults.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500 text-center">
            Showing {filteredResults.length} of {results.length} results
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const bgColor = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
  }[color] || "bg-gray-50";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${bgColor} rounded-lg`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- BADGES ---------------- */

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 5
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${color}`}>
      {score}/10
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "accepted" | "rejected" | "pending";
}) {
  const config = {
    accepted: {
      label: "Accepted",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
    },
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: AlertCircle,
    },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={`${color} font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

/* ---------------- SCORECARD PANEL ---------------- */

function ScorecardPanel({ candidate }: { candidate: CandidateResult }) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{candidate.name}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <Mail className="w-4 h-4 inline mr-2" />
                {candidate.email}
              </p>
              <p className="text-gray-700">
                <FileText className="w-4 h-4 inline mr-2" />
                {candidate.role}
              </p>
              <p className="text-gray-600 font-mono text-xs">
                JD Hash: {candidate.jd_hash}
              </p>
              <p className="text-gray-600 text-xs">
                Interviewed: {formatDate(candidate.date)}
              </p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {candidate.score}<span className="text-2xl text-gray-500">/10</span>
            </div>
            <StatusBadge status={candidate.status} />
          </div>
        </div>

        {candidate.feedback && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Overall Feedback:</p>
            <p className="text-gray-800">{candidate.feedback}</p>
          </div>
        )}
      </div>

      {/* Question Breakdown */}
      {candidate.questionScores && candidate.questionScores.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Question-by-Question Breakdown
          </h4>
          <div className="space-y-4">
            {candidate.questionScores.map((qs, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-semibold text-gray-900 flex-1 pr-4">
                    {idx + 1}. {qs.question}
                  </p>
                  <ScoreBadge score={qs.score} />
                </div>
                
                <div className="bg-blue-50 rounded p-3 mb-2">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Candidate's Answer:</p>
                  <p className="text-sm text-blue-800">{qs.answer}</p>
                </div>
                
                {qs.feedback && (
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">AI Feedback:</p>
                    <p className="text-sm text-gray-700 italic">{qs.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions - Removed as requested */}
      {/* You can add actions back if needed */}
    </div>
  );
}