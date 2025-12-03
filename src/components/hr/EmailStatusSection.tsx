import React, { useEffect, useState } from "react";
import { Mail, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import apiService from "../../services/api";

interface EmailRecord {
  recipient: string;
  type: string;
  subject: string;
  status: string;
  sentAt: string;
}

interface EmailStats {
  sent: number;
  pending: number;
  failed: number;
  total: number;
}

export default function EmailStatusSection() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    sent: 0,
    pending: 0,
    failed: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmailStatus();
  }, []);

  async function loadEmailStatus() {
    try {
      setLoading(true);
      setError("");

      // ✅ Use apiService instead of direct fetch
      const data = await apiService.getEmailStatus();

      setEmails(data.emails || []);
      setStats(data.stats || { sent: 0, pending: 0, failed: 0, total: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to load email logs");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadEmailStatus();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading email logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Email Logs</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadEmailStatus}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Tracking</h2>
          <p className="text-gray-600">Monitor all automated emails sent by the system</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Mail className="w-5 h-5 text-blue-600" />}
          label="Total Emails"
          value={stats.total || emails.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Sent Successfully"
          value={stats.sent}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          label="Pending"
          value={stats.pending}
          color="yellow"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          label="Failed"
          value={stats.failed}
          color="red"
        />
      </div>

      {/* Email Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No emails sent yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Email logs will appear here once the system sends automated emails
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emails.map((email, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{email.recipient}</td>
                    <td className="px-6 py-4">
                      <EmailTypeBadge type={email.type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
                    <td className="px-6 py-4">
                      <EmailStatusBadge status={email.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(email.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- HELPER FUNCTIONS ---- */

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/* ---- COMPONENTS ---- */

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const bgColor = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    red: "bg-red-50",
  }[color] || "bg-gray-50";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${bgColor} rounded-lg`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function EmailTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    shortlist: { label: "Shortlist", color: "bg-green-100 text-green-700 border-green-200" },
    rejection: { label: "Rejection", color: "bg-red-100 text-red-700 border-red-200" },
    schedule: { label: "Schedule", color: "bg-blue-100 text-blue-700 border-blue-200" },
    invitation: { label: "Invitation", color: "bg-purple-100 text-purple-700 border-purple-200" },
  };

  const { label, color } = config[type.toLowerCase()] || {
    label: type,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

function EmailStatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: any; label: string; color: string }> = {
    sent: { icon: CheckCircle, label: "Sent", color: "text-green-600" },
    pending: { icon: Clock, label: "Pending", color: "text-yellow-600" },
    failed: { icon: XCircle, label: "Failed", color: "text-red-600" },
  };

  const { icon: Icon, label, color } = config[status.toLowerCase()] || {
    icon: Mail,
    label: status,
    color: "text-gray-600",
  };

  return (
    <div className={`flex items-center gap-2 ${color} font-medium`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </div>
  );
}