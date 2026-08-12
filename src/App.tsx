import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SymptomChecker } from './components/SymptomChecker';
import { AppointmentReminders } from './components/AppointmentReminders';
import { SymptomHistory } from './components/SymptomHistory';
import { AppointmentModal } from './components/AppointmentModal';
import { DoctorPrepModal } from './components/DoctorPrepModal';
import { AuthModal } from './components/AuthModal';
import { api } from './utils/api';
import { AppointmentReminder, SymptomLog, TriageResult, User, UrgencyLevel } from './types';
import { HeartPulse, Check, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'checker' | 'reminders' | 'history'>('checker');
  const [user, setUser] = useState<User | null>(null);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<AppointmentReminder | null>(null);
  const [apptInitialData, setApptInitialData] = useState<{
    doctorName?: string;
    specialty?: string;
    notes?: string;
    urgencySuggested?: UrgencyLevel;
  } | undefined>(undefined);

  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [activeTriageResult, setActiveTriageResult] = useState<TriageResult | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Auth & Data loading
  useEffect(() => {
    async function init() {
      try {
        const meRes = await api.getMe();
        if (meRes.user) {
          setUser(meRes.user);
          await loadUserData();
        }
      } catch (err) {
        console.warn('Could not verify session:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, []);

  const loadUserData = async () => {
    try {
      const [remRes, logsRes] = await Promise.all([
        api.getReminders().catch(() => ({ reminders: [] })),
        api.getSymptomHistory().catch(() => ({ logs: [] })),
      ]);
      setReminders(remRes.reminders || []);
      setSymptomLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    showToast(`Welcome, ${authenticatedUser.name}!`);
    await loadUserData();
  };

  const handleQuickDemo = async () => {
    try {
      const res = await api.loginDemo();
      setUser(res.user);
      showToast('Logged in as Demo Patient (Jane Doe)');
      await loadUserData();
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setReminders([]);
      setSymptomLogs([]);
      showToast('Signed out successfully', 'info');
      setActiveTab('checker');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Appointment Reminders CRUD
  const handleOpenAddReminder = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setEditingReminder(null);
    setApptInitialData(undefined);
    setIsApptModalOpen(true);
  };

  const handleOpenEditReminder = (reminder: AppointmentReminder) => {
    setEditingReminder(reminder);
    setApptInitialData(undefined);
    setIsApptModalOpen(true);
  };

  const handleSaveReminder = async (data: Omit<AppointmentReminder, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (editingReminder) {
      const res = await api.updateReminder(editingReminder.id, data);
      setReminders(prev => prev.map(r => (r.id === res.reminder.id ? res.reminder : r)));
      showToast('Appointment updated successfully');
    } else {
      const res = await api.createReminder(data);
      setReminders(prev => [res.reminder, ...prev]);
      showToast('Appointment reminder saved to database');
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const res = await api.updateReminder(id, { isCompleted });
      setReminders(prev => prev.map(r => (r.id === id ? res.reminder : r)));
      showToast(isCompleted ? 'Appointment marked as completed!' : 'Appointment moved to upcoming');
    } catch (err: any) {
      showToast(err.message || 'Failed to update reminder', 'error');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      showToast('Appointment reminder deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete reminder', 'error');
    }
  };

  // Symptom Triage Flow
  const handleBookFromTriage = (result: TriageResult) => {
    if (!user) {
      setIsAuthOpen(true);
      showToast('Please sign in or use demo account to save reminders', 'info');
      return;
    }

    setEditingReminder(null);
    setApptInitialData({
      doctorName: result.recommendedSpecialist.includes('Primary') ? 'Dr. Primary Care Clinic' : `Consultant (${result.recommendedSpecialist})`,
      specialty: result.recommendedSpecialist,
      notes: `Triage Assessment: ${result.urgencyTitle}\nReported Symptoms: ${result.symptoms.join(', ')}\nDuration: ${result.duration} | Severity: ${result.severity}`,
      urgencySuggested: result.urgency,
    });
    setIsApptModalOpen(true);
  };

  const handleOpenDoctorPrep = (resultOrReminder: TriageResult | AppointmentReminder) => {
    if ('symptoms' in resultOrReminder) {
      setActiveTriageResult(resultOrReminder as TriageResult);
    } else {
      const r = resultOrReminder as AppointmentReminder;
      setActiveTriageResult({
        urgency: r.urgencySuggested || 'routine',
        urgencyTitle: 'Scheduled Consultation',
        headline: `Appointment with ${r.doctorName}`,
        explanation: r.notes || 'Medical consultation',
        matchedRules: [],
        redFlagsDetected: [],
        recommendedSpecialist: r.specialty,
        nextSteps: [],
        warningSignsToWatch: [],
        timestamp: new Date().toISOString(),
        symptoms: r.notes ? [r.notes] : ['General checkup'],
        duration: '1-3 days',
        severity: 'Moderate',
      });
    }
    setIsPrepModalOpen(true);
  };

  const handleEvaluationComplete = (result: TriageResult) => {
    if (user) {
      // Reload history
      api.getSymptomHistory().then(res => setSymptomLogs(res.logs || [])).catch(() => {});
      showToast('Triage assessment saved to your profile');
    }
  };

  const handleDeleteHistoryLog = async (id: string) => {
    try {
      await api.deleteSymptomLog(id);
      setSymptomLogs(prev => prev.filter(l => l.id !== id));
      showToast('Assessment log removed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete log', 'error');
    }
  };

  const handleRecheckFromHistory = (log: SymptomLog) => {
    setActiveTab('checker');
    showToast('Loaded symptoms from history log', 'info');
  };

  const upcomingCount = reminders.filter(r => !r.isCompleted && r.date >= new Date().toISOString().split('T')[0]).length;

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#2d2a26] flex flex-col antialiased selection:bg-[#4a5d4e] selection:text-white">
      
      {/* Top Emergency Advisory */}
      <EmergencyBanner />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={mode => {
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onQuickDemo={handleQuickDemo}
        onLogout={handleLogout}
        upcomingRemindersCount={upcomingCount}
        historyCount={symptomLogs.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4.5 py-3 rounded-2xl shadow-lg border text-sm font-medium flex items-center gap-3 ${
            toastMessage.type === 'error'
              ? 'bg-[#7a2b22] text-white border-[#99473b]'
              : toastMessage.type === 'info'
              ? 'bg-[#2d2a26] text-[#faf9f6] border-[#4a4642]'
              : 'bg-[#3a443d] text-white border-[#4a5d4e]'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#f5b8b0]" />
            ) : toastMessage.type === 'info' ? (
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
            ) : (
              <Check className="w-4 h-4 text-[#a3c2a8]" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'checker' && (
          <SymptomChecker
            onBookAppointment={handleBookFromTriage}
            onOpenDoctorPrep={handleOpenDoctorPrep}
            onEvaluationComplete={handleEvaluationComplete}
            isLoggedIn={!!user}
          />
        )}

        {activeTab === 'reminders' && (
          <AppointmentReminders
            reminders={reminders}
            onAddReminder={handleOpenAddReminder}
            onEditReminder={handleOpenEditReminder}
            onToggleComplete={handleToggleComplete}
            onDeleteReminder={handleDeleteReminder}
            onOpenDoctorPrep={handleOpenDoctorPrep}
            isLoggedIn={!!user}
            onOpenAuth={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <SymptomHistory
            logs={symptomLogs}
            onDeleteLog={handleDeleteHistoryLog}
            onSelectLogForRecheck={handleRecheckFromHistory}
            isLoggedIn={!!user}
            onOpenAuth={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5e1d8] py-6 mt-12 text-xs text-[#6d6a66]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-4 h-4 text-[#4a5d4e]" />
            <span className="font-bold text-[#3a443d]">CarePulse Health Companion</span>
            <span>• Rule-Based Clinical Triage & Appointment Scheduler</span>
          </div>
          <div className="text-[#8a8680]">
            Clinical triage rules for guidance only; always consult a licensed medical physician for formal diagnosis.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSave={handleSaveReminder}
        editingReminder={editingReminder}
        initialData={apptInitialData}
      />

      <DoctorPrepModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        triageResult={activeTriageResult}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

    </div>
  );
}
