import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Mail, 
  Settings, 
  LogOut,
  Bell,
  ClipboardList
} from 'lucide-react';
import { Button } from './ui/button';
import DashboardOverview from './hr/DashboardOverview';
import PostJobSection from './hr/PostJobSection';
import InterviewQuestionsSection from './hr/InterviewQuestionsSection';
import InterviewResultsSection from './hr/InterviewResultsSection';
import EmailStatusSection from './hr/EmailStatusSection';

type Section = 'dashboard' | 'post-job' | 'questions' | 'results' | 'email' | 'settings';

export default function HRDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const userName = 'HR Manager'; // 🔹 temp hard-coded

  const handleLogout = () => {
    // TEMP: just reload or go to home
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900">HR Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <NavItem
            icon={<FileText className="w-5 h-5" />}
            label="Post Job"
            active={activeSection === 'post-job'}
            onClick={() => setActiveSection('post-job')}
          />
          <NavItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Interview Questions"
            active={activeSection === 'questions'}
            onClick={() => setActiveSection('questions')}
          />
          <NavItem
            icon={<ClipboardList className="w-5 h-5" />}
            label="Interview Results"
            active={activeSection === 'results'}
            onClick={() => setActiveSection('results')}
          />
          <NavItem
            icon={<Mail className="w-5 h-5" />}
            label="Email Status"
            active={activeSection === 'email'}
            onClick={() => setActiveSection('email')}
          />
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-gray-900">Welcome back, {userName}</h1>
              <p className="text-gray-600">Manage your recruitment pipeline</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">
                    {userName.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {activeSection === 'dashboard' && <DashboardOverview />}
          {activeSection === 'post-job' && <PostJobSection />}
          {activeSection === 'questions' && <InterviewQuestionsSection />}
          {activeSection === 'results' && <InterviewResultsSection />}
          {activeSection === 'email' && <EmailStatusSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SettingsSection() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-gray-900 mb-6">Settings</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600">
          Settings section - Configure your preferences, integrations, and notification settings.
        </p>
      </div>
    </div>
  );
}
