import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Download,
  AlertCircle,
  Sparkles,
  FileText,
  Search,
  Bell,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppointmentReminder, UrgencyLevel } from '../types';
import { downloadIcsFile, formatFriendlyDate } from '../utils/calendar';

interface AppointmentRemindersProps {
  reminders: AppointmentReminder[];
  onAddReminder: () => void;
  onEditReminder: (reminder: AppointmentReminder) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  onOpenDoctorPrep?: (reminder: AppointmentReminder) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export const AppointmentReminders: React.FC<AppointmentRemindersProps> = ({
  reminders,
  onAddReminder,
  onEditReminder,
  onToggleComplete,
  onDeleteReminder,
  onOpenDoctorPrep,
  isLoggedIn,
  onOpenAuth,
}) => {
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReminders = reminders.filter(r => {
    const isUpcoming = !r.isCompleted && r.date >= todayStr;
    const isPast = !r.isCompleted && r.date < todayStr;
    
    if (filter === 'upcoming') {
      if (r.isCompleted) return false;
    } else if (filter === 'completed') {
      if (!r.isCompleted) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.doctorName.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const upcomingCount = reminders.filter(r => !r.isCompleted && r.date >= todayStr).length;
  const completedCount = reminders.filter(r => r.isCompleted).length;

  const nextAppointment = reminders
    .filter(r => !r.isCompleted && r.date >= todayStr)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];

  const handleToggle = async (reminder: AppointmentReminder) => {
    const willBeCompleted = !reminder.isCompleted;
    if (willBeCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
    await onToggleComplete(reminder.id, willBeCompleted);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment reminder?')) {
      setDeletingId(id);
      try {
        await onDeleteReminder(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getUrgencyBadge = (urgency?: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#fae2de] text-[#7a2b22] border border-[#f0d2ce]">Emergency</span>;
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#faebe0] text-[#8a5d33] border border-[#ecdccb]">Urgent</span>;
      case 'routine':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#eef2ef] text-[#3a443d] border border-[#dce5dc]">Routine</span>;
      case 'self_care':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0ede6] text-[#4a5d4e] border border-[#e5e1d8]">Self-Care</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Next Appointment Alert */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d2a26] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#4a5d4e]" />
            <span>Appointment Reminders</span>
          </h1>
          <p className="text-sm text-[#6d6a66] mt-0.5">
            Manage your scheduled medical visits, doctor notes, and calendar alerts
          </p>
        </div>

        <button
          id="add-appointment-btn"
          onClick={onAddReminder}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] shadow-xs hover:shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Next Upcoming Highlight Banner */}
      {nextAppointment && (
        <div className="bg-[#3a443d] text-white rounded-[32px] p-6 sm:p-7 shadow-sm border border-[#2e3731] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-[#d8e6db] text-xs font-semibold uppercase tracking-wider border border-white/15">
              <Clock className="w-3 h-3 text-[#d4a373]" /> Next Upcoming Visit
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {nextAppointment.doctorName}
            </h3>
            <p className="text-xs sm:text-sm text-[#e2ede5] flex flex-wrap items-center gap-3">
              <span className="font-medium text-[#d8e6db]">{nextAppointment.specialty}</span>
              <span>•</span>
              <strong className="text-white">{formatFriendlyDate(nextAppointment.date, nextAppointment.time)}</strong>
              {nextAppointment.location && (
                <>
                  <span>•</span>
                  <span>{nextAppointment.location}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="next-appt-download-ics-btn"
              onClick={() => downloadIcsFile(nextAppointment)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              title="Add to Calendar (.ICS)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .ICS</span>
            </button>
            <button
              id="next-appt-complete-btn"
              onClick={() => handleToggle(nextAppointment)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-[#3a443d] hover:bg-[#f3efe8] transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-[#f3efe8] p-1 rounded-xl border border-[#e5e1d8]">
          <button
            id="filter-upcoming-btn"
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-white text-[#3a443d] font-bold shadow-2xs'
                : 'text-[#6d6a66] hover:text-[#2d2a26]'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            id="filter-completed-btn"
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-white text-[#3a443d] font-bold shadow-2xs'
                : 'text-[#6d6a66] hover:text-[#2d2a26]'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            id="filter-all-btn"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-[#3a443d] font-bold shadow-2xs'
                : 'text-[#6d6a66] hover:text-[#2d2a26]'
            }`}
          >
            All ({reminders.length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-[#8a8680] absolute left-3 top-2.5" />
          <input
            id="reminder-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctor or clinic..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e5e1d8] focus:outline-none focus:ring-1 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
          />
        </div>

      </div>

      {/* Reminder Cards List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#e5e1d8] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#eef2ef] text-[#4a5d4e] flex items-center justify-center mx-auto shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2d2a26]">
            {filter === 'completed' ? 'No completed appointments' : 'No scheduled appointments'}
          </h3>
          <p className="text-xs text-[#6d6a66] max-w-sm mx-auto">
            {filter === 'completed'
              ? 'Appointments you check off as completed will show up here.'
              : 'Add an appointment to keep track of clinic visits, doctor notes, and calendar notifications.'}
          </p>
          <button
            id="empty-add-appointment-btn"
            onClick={onAddReminder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule First Appointment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReminders.map(reminder => {
            const isPast = !reminder.isCompleted && reminder.date < todayStr;
            return (
              <div
                key={reminder.id}
                id={`reminder-card-${reminder.id}`}
                className={`rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between ${
                  reminder.isCompleted
                    ? 'bg-[#faf9f6] border-[#ece9e2] opacity-80'
                    : isPast
                    ? 'bg-[#faf4ed] border-[#ecdccb]'
                    : 'bg-white border-[#e5e1d8] hover:border-[#ded9ce] shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Card Header: Doctor & Urgency */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-base font-bold ${reminder.isCompleted ? 'text-[#8a8680] line-through' : 'text-[#2d2a26]'}`}>
                          {reminder.doctorName}
                        </h4>
                        {getUrgencyBadge(reminder.urgencySuggested)}
                      </div>
                      <p className="text-xs font-semibold text-[#4a5d4e]">{reminder.specialty}</p>
                    </div>

                    <button
                      id={`toggle-complete-${reminder.id}`}
                      onClick={() => handleToggle(reminder)}
                      className={`p-2 rounded-xl transition-colors ${
                        reminder.isCompleted
                          ? 'text-[#4a5d4e] bg-[#eef2ef] hover:bg-[#e0eae2]'
                          : 'text-[#8a8680] hover:text-[#4a5d4e] hover:bg-[#eef2ef]'
                      }`}
                      title={reminder.isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Date, Time & Location */}
                  <div className="mt-4 space-y-1.5 text-xs text-[#6d6a66]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#8a8680] shrink-0" />
                      <span className="font-bold text-[#2d2a26]">
                        {formatFriendlyDate(reminder.date, reminder.time)}
                      </span>
                      {isPast && (
                        <span className="text-[10px] font-bold text-[#8a5d33] bg-[#faebe0] px-2 py-0.5 rounded-full border border-[#ecdccb]">
                          Past Due
                        </span>
                      )}
                    </div>

                    {reminder.location && (
                      <div className="flex items-center gap-2 text-[#6d6a66]">
                        <MapPin className="w-3.5 h-3.5 text-[#8a8680] shrink-0" />
                        <span className="truncate">{reminder.location}</span>
                      </div>
                    )}

                    {reminder.reminderNoticeHours && (
                      <div className="flex items-center gap-2 text-[#8a8680] text-[11px]">
                        <Bell className="w-3 h-3 text-[#8a8680] shrink-0" />
                        <span>Alert: {reminder.reminderNoticeHours}h before</span>
                      </div>
                    )}
                  </div>

                  {/* Notes / Triage Context */}
                  {reminder.notes && (
                    <div className="mt-3.5 p-3 bg-[#fcfbf9] rounded-2xl border border-[#ece9e2] text-xs text-[#6d6a66] leading-relaxed">
                      <span className="font-semibold text-[#3a443d]">Notes:</span> {reminder.notes}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-4 border-t border-[#f0ede6] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      id={`export-ics-${reminder.id}`}
                      onClick={() => downloadIcsFile(reminder)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2d2a26] hover:text-[#1e1d1a] bg-[#f3efe8] hover:bg-[#ece7de] rounded-xl transition-colors"
                      title="Add to Calendar (.ICS file)"
                    >
                      <Download className="w-3 h-3" />
                      <span>.ICS</span>
                    </button>

                    {onOpenDoctorPrep && (
                      <button
                        id={`prep-notes-${reminder.id}`}
                        onClick={() => onOpenDoctorPrep(reminder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8a5d33] bg-[#faf2eb] hover:bg-[#f4e6d8] border border-[#e8d5c4] rounded-xl transition-colors"
                        title="Doctor Visit Prep Checklist"
                      >
                        <Sparkles className="w-3 h-3 text-[#d4a373]" />
                        <span>Visit Prep</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-reminder-${reminder.id}`}
                      onClick={() => onEditReminder(reminder)}
                      className="p-2 text-[#8a8680] hover:text-[#2d2a26] hover:bg-[#f3efe8] rounded-xl transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-reminder-${reminder.id}`}
                      onClick={() => handleDelete(reminder.id)}
                      disabled={deletingId === reminder.id}
                      className="p-2 text-[#8a8680] hover:text-[#99473b] hover:bg-[#fcf2f0] rounded-xl transition-colors disabled:opacity-50"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Guest Notice */}
      {!isLoggedIn && (
        <div className="p-5 bg-[#eef2ef] border border-[#dce5dc] rounded-3xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#3a443d]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#d4a373] shrink-0" />
            <span>
              <strong className="font-bold text-[#2d2a26]">Personalized Database Storage:</strong> Sign in or use the demo patient profile to keep your appointment history synchronized across devices.
            </span>
          </div>
          <button
            id="auth-banner-login-btn"
            onClick={onOpenAuth}
            className="font-bold text-[#4a5d4e] underline hover:text-[#3a443d]"
          >
            Sign In / Register
          </button>
        </div>
      )}

    </div>
  );
};
