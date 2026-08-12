import React, { useState } from 'react';
import { History, Calendar, Trash2, ArrowRight, ShieldAlert, AlertTriangle, Clock, CheckCircle2, FileText } from 'lucide-react';
import { SymptomLog, UrgencyLevel } from '../types';
import { formatFriendlyDate } from '../utils/calendar';

interface SymptomHistoryProps {
  logs: SymptomLog[];
  onDeleteLog: (id: string) => Promise<void>;
  onSelectLogForRecheck: (log: SymptomLog) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export const SymptomHistory: React.FC<SymptomHistoryProps> = ({
  logs,
  onDeleteLog,
  onSelectLogForRecheck,
  isLoggedIn,
  onOpenAuth,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getUrgencyIcon = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return <ShieldAlert className="w-4 h-4 text-[#b84a39]" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-[#d4a373]" />;
      case 'routine':
        return <Clock className="w-4 h-4 text-[#4a5d4e]" />;
      case 'self_care':
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#4a5d4e]" />;
    }
  };

  const getUrgencyTagClass = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-[#fae2de] text-[#7a2b22] border-[#f0d2ce]';
      case 'urgent':
        return 'bg-[#faebe0] text-[#8a5d33] border-[#ecdccb]';
      case 'routine':
        return 'bg-[#eef2ef] text-[#3a443d] border-[#dce5dc]';
      case 'self_care':
      default:
        return 'bg-[#f0ede6] text-[#4a5d4e] border-[#e5e1d8]';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this assessment log?')) {
      setDeletingId(id);
      try {
        await onDeleteLog(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-3xl border border-[#e5e1d8] p-12 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-[#eef2ef] text-[#4a5d4e] flex items-center justify-center mx-auto shadow-2xs">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#2d2a26]">Symptom History Logging</h3>
        <p className="text-xs sm:text-sm text-[#6d6a66] max-w-md mx-auto">
          Sign in or use the demo patient profile to securely save past triage records, symptom evolution over time, and doctor recommendations to the database.
        </p>
        <button
          id="history-signin-btn"
          onClick={onOpenAuth}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] transition-colors shadow-xs"
        >
          <span>Sign In to Access History</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d2a26] tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#4a5d4e]" />
            <span>Triage History & Past Assessments</span>
          </h1>
          <p className="text-sm text-[#6d6a66] mt-0.5">
            Review previous rule-based evaluations and health logs stored in your database
          </p>
        </div>
        <div className="text-xs font-bold text-[#6d6a66] bg-[#f3efe8] px-3.5 py-1.5 rounded-xl border border-[#e5e1d8]">
          {logs.length} {logs.length === 1 ? 'Assessment' : 'Assessments'} Recorded
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#e5e1d8] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f3efe8] text-[#8a8680] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2d2a26]">No past assessments found</h3>
          <p className="text-xs text-[#6d6a66] max-w-sm mx-auto">
            Whenever you evaluate symptoms while signed in, a summary log is automatically saved here for future reference.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => {
            const dateStr = log.createdAt.split('T')[0];
            return (
              <div
                key={log.id}
                id={`history-log-${log.id}`}
                className="bg-white rounded-3xl border border-[#e5e1d8] p-6 shadow-2xs hover:border-[#ded9ce] transition-all space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {getUrgencyIcon(log.urgency)}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getUrgencyTagClass(log.urgency)}`}>
                          {log.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-[#8a8680]">
                        {formatFriendlyDate(dateStr)} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#2d2a26]">{log.headline}</h4>
                  </div>

                  <button
                    id={`delete-history-${log.id}`}
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="text-[#8a8680] hover:text-[#99473b] p-2 rounded-xl hover:bg-[#fcf2f0] transition-colors disabled:opacity-50"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Log Details */}
                <p className="text-xs sm:text-sm text-[#3a443d] leading-relaxed">{log.explanation}</p>

                {/* Symptoms Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {log.symptomLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#f3efe8] text-[#2d2a26] border border-[#e5e1d8]"
                    >
                      {lbl}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#f0ede6] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6d6a66]">
                  <div className="flex items-center gap-4">
                    <span><strong className="text-[#3a443d]">Duration:</strong> {log.duration}</span>
                    <span><strong className="text-[#3a443d]">Severity:</strong> {log.severity}</span>
                    <span><strong className="text-[#3a443d]">Suggested:</strong> {log.recommendedSpecialist}</span>
                  </div>

                  <button
                    id={`recheck-history-${log.id}`}
                    onClick={() => onSelectLogForRecheck(log)}
                    className="font-bold text-[#4a5d4e] hover:text-[#3a443d] inline-flex items-center gap-1"
                  >
                    <span>Load into Symptom Checker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
