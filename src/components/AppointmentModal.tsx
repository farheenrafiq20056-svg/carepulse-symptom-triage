import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Stethoscope, FileText, Bell, AlertCircle, Loader2 } from 'lucide-react';
import { AppointmentReminder, UrgencyLevel } from '../types';
import { COMMON_SPECIALTIES } from '../constants/symptoms';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AppointmentReminder, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => Promise<void>;
  editingReminder?: AppointmentReminder | null;
  initialData?: {
    doctorName?: string;
    specialty?: string;
    notes?: string;
    urgencySuggested?: UrgencyLevel;
  };
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingReminder,
  initialData,
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState(COMMON_SPECIALTIES[0]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [urgencySuggested, setUrgencySuggested] = useState<UrgencyLevel>('routine');
  const [reminderNoticeHours, setReminderNoticeHours] = useState<number>(24);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingReminder) {
        setDoctorName(editingReminder.doctorName);
        if (COMMON_SPECIALTIES.includes(editingReminder.specialty)) {
          setSpecialty(editingReminder.specialty);
          setCustomSpecialty('');
        } else {
          setSpecialty('Other');
          setCustomSpecialty(editingReminder.specialty);
        }
        setDate(editingReminder.date);
        setTime(editingReminder.time || '10:00');
        setLocation(editingReminder.location || '');
        setNotes(editingReminder.notes || '');
        setUrgencySuggested(editingReminder.urgencySuggested || 'routine');
        setReminderNoticeHours(editingReminder.reminderNoticeHours || 24);
      } else if (initialData) {
        setDoctorName(initialData.doctorName || '');
        
        // Find best match in specialties
        const matched = COMMON_SPECIALTIES.find(s => s.toLowerCase().includes((initialData.specialty || '').toLowerCase().split('/')[0].trim()));
        if (matched) {
          setSpecialty(matched);
          setCustomSpecialty('');
        } else if (initialData.specialty) {
          setSpecialty('Other');
          setCustomSpecialty(initialData.specialty);
        } else {
          setSpecialty(COMMON_SPECIALTIES[0]);
        }

        // Default date: tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('10:00');
        setLocation('Main Health Clinic');
        setNotes(initialData.notes || '');
        setUrgencySuggested(initialData.urgencySuggested || 'routine');
        setReminderNoticeHours(24);
      } else {
        // Fresh appointment
        setDoctorName('');
        setSpecialty(COMMON_SPECIALTIES[0]);
        setCustomSpecialty('');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('10:00');
        setLocation('');
        setNotes('');
        setUrgencySuggested('routine');
        setReminderNoticeHours(24);
      }
      setError('');
    }
  }, [isOpen, editingReminder, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError('Please enter the doctor or clinic name.');
      return;
    }
    if (!date) {
      setError('Please select an appointment date.');
      return;
    }

    const finalSpecialty = specialty === 'Other' ? (customSpecialty.trim() || 'General Specialist') : specialty;

    setSubmitting(true);
    setError('');
    try {
      await onSave({
        doctorName: doctorName.trim(),
        specialty: finalSpecialty,
        date,
        time,
        location: location.trim() || 'Clinic / Telehealth',
        notes: notes.trim(),
        urgencySuggested,
        reminderNoticeHours,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save appointment reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="appointment-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-lg w-full max-h-[95vh] flex flex-col shadow-2xl border border-[#e5e1d8] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e1d8] bg-[#fcfbf9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#eef2ef] text-[#4a5d4e] rounded-2xl shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2d2a26]">
                {editingReminder ? 'Edit Appointment Reminder' : 'Set Appointment Reminder'}
              </h3>
              <p className="text-xs text-[#6d6a66]">Save your upcoming doctor visit to your health profile</p>
            </div>
          </div>
          <button
            id="close-appointment-modal-btn"
            onClick={onClose}
            className="p-2 text-[#8a8680] hover:text-[#2d2a26] hover:bg-[#f3efe8] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-[#fcf2f0] border border-[#f0d2ce] rounded-2xl text-xs text-[#7a2b22] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b84a39]" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctor Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
              Doctor or Clinic Name *
            </label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
              <input
                id="modal-doctor-name-input"
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins or Metro City Clinic"
                className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] focus:border-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                required
              />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
              Medical Specialty
            </label>
            <select
              id="modal-specialty-select"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] focus:border-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
            >
              {COMMON_SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Other">Other / Custom Specialty</option>
            </select>

            {specialty === 'Other' && (
              <input
                id="modal-custom-specialty-input"
                type="text"
                value={customSpecialty}
                onChange={e => setCustomSpecialty(e.target.value)}
                placeholder="Enter specialty name"
                className="mt-2 w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
              />
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
                Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
                <input
                  id="modal-appointment-date-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
                Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
                <input
                  id="modal-appointment-time-input"
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
              Location / Clinic / Room
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
              <input
                id="modal-location-input"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. 104 Medical Plaza, Suite 2B or Zoom Link"
                className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
              />
            </div>
          </div>

          {/* Reminder Advance Notice */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
              Notification Reminder Alert
            </label>
            <div className="relative">
              <Bell className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
              <select
                id="modal-notice-select"
                value={reminderNoticeHours}
                onChange={e => setReminderNoticeHours(Number(e.target.value))}
                className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
              >
                <option value={2}>2 hours before</option>
                <option value={12}>12 hours before</option>
                <option value={24}>1 day before (24h)</option>
                <option value={48}>2 days before (48h)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1.5">
              Visit Notes / Symptoms Log
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#8a8680] absolute left-3 top-3.5" />
              <textarea
                id="modal-notes-textarea"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Symptoms logged, questions for doctor, or insurance details..."
                className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-[#e5e1d8] flex items-center justify-end gap-2.5">
            <button
              id="cancel-appointment-modal-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-[#2d2a26] hover:text-[#1e1d1a] bg-[#f3efe8] hover:bg-[#ece7de] rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-appointment-modal-btn"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] rounded-2xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              <span>{editingReminder ? 'Update Reminder' : 'Save Reminder'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
