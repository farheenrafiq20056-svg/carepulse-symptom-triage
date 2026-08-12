import React from 'react';
import { Stethoscope, Calendar, History, User, LogOut, Activity, Sparkles, LogIn } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  activeTab: 'checker' | 'reminders' | 'history';
  setActiveTab: (tab: 'checker' | 'reminders' | 'history') => void;
  user: UserType | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onQuickDemo: () => void;
  onLogout: () => void;
  upcomingRemindersCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onQuickDemo,
  onLogout,
  upcomingRemindersCount,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fdfcf8]/95 backdrop-blur border-b border-[#e5e1d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('checker')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4a5d4e] flex items-center justify-center text-white shadow-sm group-hover:bg-[#3a443d] transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-[#3a443d] tracking-tight flex items-center gap-2">
                  CarePulse <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#eef2ef] text-[#4a5d4e] border border-[#dce5dc] px-2 py-0.5 rounded-full">Triage & Schedule</span>
                </span>
                <span className="block text-xs text-[#6d6a66] font-medium">Rule-Based Symptom Checker & Appointment Hub</span>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#f3efe8] p-1.5 rounded-2xl border border-[#e5e1d8]">
            <button
              id="nav-tab-checker"
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'checker'
                  ? 'bg-white text-[#3a443d] shadow-2xs font-semibold'
                  : 'text-[#6d6a66] hover:text-[#2d2a26] hover:bg-[#ece7de]/60'
              }`}
            >
              <Stethoscope className={`w-4 h-4 ${activeTab === 'checker' ? 'text-[#4a5d4e]' : 'text-[#6d6a66]'}`} />
              <span>Symptom Checker</span>
            </button>

            <button
              id="nav-tab-reminders"
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all relative ${
                activeTab === 'reminders'
                  ? 'bg-white text-[#3a443d] shadow-2xs font-semibold'
                  : 'text-[#6d6a66] hover:text-[#2d2a26] hover:bg-[#ece7de]/60'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'reminders' ? 'text-[#4a5d4e]' : 'text-[#6d6a66]'}`} />
              <span>Appointments</span>
              {upcomingRemindersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-bold bg-[#4a5d4e] text-white rounded-full">
                  {upcomingRemindersCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all relative ${
                activeTab === 'history'
                  ? 'bg-white text-[#3a443d] shadow-2xs font-semibold'
                  : 'text-[#6d6a66] hover:text-[#2d2a26] hover:bg-[#ece7de]/60'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-[#4a5d4e]' : 'text-[#6d6a66]'}`} />
              <span>Triage History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-bold bg-[#e5e1d8] text-[#3a443d] rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5 bg-[#f7f5f0] border border-[#e5e1d8] px-3.5 py-1.5 rounded-2xl shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#d4a373] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#2d2a26] leading-tight truncate max-w-[130px]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[#6d6a66] truncate max-w-[130px]">{user.email}</div>
                </div>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Sign Out"
                  className="ml-1 text-[#8a8680] hover:text-[#99473b] p-1.5 rounded-lg hover:bg-[#edeae3] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="quick-demo-login-btn"
                  onClick={onQuickDemo}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a5d33] bg-[#faf2eb] hover:bg-[#f4e6d8] border border-[#e8d5c4] px-3 py-2 rounded-xl transition-colors shadow-2xs"
                  title="Instant Demo Profile with Sample Records"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Demo Patient</span>
                </button>
                <button
                  id="navbar-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2d2a26] hover:text-[#1e1d1a] bg-white hover:bg-[#f3efe8] border border-[#e5e1d8] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  id="navbar-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#e5e1d8]">
          <button
            id="mobile-tab-checker"
            onClick={() => setActiveTab('checker')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'checker' ? 'text-[#4a5d4e] font-bold' : 'text-[#6d6a66]'
            }`}
          >
            <Stethoscope className="w-4 h-4 mb-0.5" />
            <span>Symptom Checker</span>
          </button>
          <button
            id="mobile-tab-reminders"
            onClick={() => setActiveTab('reminders')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg relative ${
              activeTab === 'reminders' ? 'text-[#4a5d4e] font-bold' : 'text-[#6d6a66]'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Appointments</span>
            {upcomingRemindersCount > 0 && (
              <span className="absolute top-0 right-3 w-2 h-2 bg-[#4a5d4e] rounded-full" />
            )}
          </button>
          <button
            id="mobile-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'history' ? 'text-[#4a5d4e] font-bold' : 'text-[#6d6a66]'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span>History</span>
          </button>
        </div>

      </div>
    </header>
  );
};
