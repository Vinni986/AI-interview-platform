import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, XCircle, Mail, FileText, TrendingUp } from 'lucide-react';
import apiService from '../../services/api';

interface DashboardStats {
  totalApplications: number;
  pendingInterviews: number;
  accepted: number;
  rejected: number;
  emailsSent: number;
  emailsPending: number;
  emailsFailed: number;
  totalQuestions: number;
  avgScore: number;
  recentApplications: number;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'application' | 'interview' | 'shortlist' | 'email';
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingInterviews: 0,
    accepted: 0,
    rejected: 0,
    emailsSent: 0,
    emailsPending: 0,
    emailsFailed: 0,
    totalQuestions: 0,
    avgScore: 0,
    recentApplications: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // ✅ Use apiService instead of direct fetch
      const { results, emails, questions } = await apiService.getDashboardData();

      // Process results data
      const resultsList = results.results || [];
      const accepted = resultsList.filter((r: any) => r.status === 'accepted').length;
      const rejected = resultsList.filter((r: any) => r.status === 'rejected').length;
      const pending = resultsList.filter((r: any) => r.status === 'pending').length;
      
      // Calculate average score
      const avgScore = resultsList.length > 0
        ? (resultsList.reduce((sum: number, r: any) => sum + r.score, 0) / resultsList.length).toFixed(1)
        : 0;

      // Get recent applications (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentApps = resultsList.filter((r: any) => new Date(r.date) >= weekAgo).length;

      // Email stats
      const emailStats = emails.stats || { sent: 0, pending: 0, failed: 0 };

      // Questions count
      const totalQuestions = questions.questions?.length || 0;

      setStats({
        totalApplications: resultsList.length,
        pendingInterviews: pending,
        accepted,
        rejected,
        emailsSent: emailStats.sent,
        emailsPending: emailStats.pending,
        emailsFailed: emailStats.failed,
        totalQuestions,
        avgScore: Number(avgScore),
        recentApplications: recentApps,
      });

      // Build recent activities
      const recentActivities: ActivityItem[] = [];

      // Add recent results
      resultsList.slice(0, 3).forEach((r: any) => {
        recentActivities.push({
          id: r.id,
          title: r.status === 'accepted' ? 'Candidate Shortlisted' : 'Interview Completed',
          description: `${r.name} - ${r.role} (Score: ${r.score}/10)`,
          time: formatTimeAgo(r.date),
          type: r.status === 'accepted' ? 'shortlist' : 'interview',
        });
      });

      // Add recent emails
      const emailsList = emails.emails || [];
      emailsList.slice(0, 2).forEach((email: any, idx: number) => {
        recentActivities.push({
          id: `email-${idx}`,
          title: 'Email Sent',
          description: `${email.type} email to ${email.recipient}`,
          time: formatTimeAgo(email.sentAt),
          type: 'email',
        });
      });

      // Sort by most recent
      setActivities(recentActivities.slice(0, 5));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your recruitment.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Applications"
          value={stats.totalApplications.toString()}
          change={`+${stats.recentApplications} this week`}
          changeType="positive"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          label="Pending Interviews"
          value={stats.pendingInterviews.toString()}
          change="Awaiting review"
          changeType="neutral"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          label="Accepted"
          value={stats.accepted.toString()}
          change={`Avg score: ${stats.avgScore}/10`}
          changeType="positive"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          label="Rejected"
          value={stats.rejected.toString()}
          change={`${stats.totalApplications > 0 ? ((stats.rejected / stats.totalApplications) * 100).toFixed(0) : 0}% rejection rate`}
          changeType="neutral"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Mail className="w-6 h-6 text-purple-600" />}
          label="Emails Sent"
          value={stats.emailsSent.toString()}
          change={`${stats.emailsPending} pending, ${stats.emailsFailed} failed`}
          changeType="neutral"
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-indigo-600" />}
          label="Interview Questions"
          value={stats.totalQuestions.toString()}
          change="Active question bank"
          changeType="neutral"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-teal-600" />}
          label="Average Score"
          value={`${stats.avgScore}/10`}
          change="All candidates"
          changeType={stats.avgScore >= 7 ? "positive" : stats.avgScore >= 5 ? "neutral" : "negative"}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button 
            onClick={loadDashboardData}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
        
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItemComponent
                key={activity.id}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                type={activity.type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  changeType 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}) {
  const changeColor = 
    changeType === 'positive' 
      ? 'text-green-600' 
      : changeType === 'negative' 
      ? 'text-red-600' 
      : 'text-gray-600';
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-sm ${changeColor}`}>{change}</div>
    </div>
  );
}

function ActivityItemComponent({ title, description, time, type }: { 
  title: string; 
  description: string; 
  time: string;
  type: 'application' | 'interview' | 'shortlist' | 'email';
}) {
  const getIcon = () => {
    switch (type) {
      case 'application':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'interview':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'shortlist':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'email':
        return <div className="w-2 h-2 bg-purple-500 rounded-full" />;
    }
  };

  return (
    <div className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="pt-1.5">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{time}</span>
        </div>
      </div>
    </div>
  );
}