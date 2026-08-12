import { AppointmentReminder } from '../types';

export function downloadIcsFile(reminder: AppointmentReminder) {
  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hours, minutes] = reminder.time ? reminder.time.split(':').map(Number) : [9, 0];

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45 min duration

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CarePulse Health//Symptom Checker & Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:carepulse-${reminder.id}@healthapp.local`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Medical Appt: ${reminder.doctorName} (${reminder.specialty})`,
    `DESCRIPTION:${(reminder.notes || 'Medical consultation appointment').replace(/\n/g, '\\n')}`,
    `LOCATION:${reminder.location || 'Clinic'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminder.reminderNoticeHours || 24}H`,
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Upcoming appointment with ${reminder.doctorName}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `appointment-${reminder.doctorName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatFriendlyDate(dateStr: string, timeStr?: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (diffDays === 0) dayLabel = 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    else if (diffDays === 1) dayLabel = 'Tomorrow, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    else if (diffDays === -1) dayLabel = 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let timeFormatted = '';
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hours12 = h % 12 || 12;
      timeFormatted = ` at ${hours12}:${m < 10 ? '0' + m : m} ${period}`;
    }

    return `${dayLabel}${timeFormatted}`;
  } catch (e) {
    return `${dateStr} ${timeStr || ''}`;
  }
}
