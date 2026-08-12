import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarPlus,
  HelpCircle,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TriageResult, UrgencyLevel } from '../types';

interface TriageResultCardProps {
  result: TriageResult;
  onBookAppointment: (result: TriageResult) => void;
  onOpenDoctorPrep: (result: TriageResult) => void;
  onReset: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({
  result,
  onBookAppointment,
  onOpenDoctorPrep,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const getUrgencyConfig = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return {
          bg: 'bg-[#fcf2f0]',
          border: 'border-[#f0d2ce]',
          badgeBg: 'bg-[#b84a39] text-white',
          titleColor: 'text-[#662017]',
          accentColor: 'text-[#7a2b22]',
          icon: ShieldAlert,
          tag: 'CRITICAL EMERGENCY',
          actionText: 'Seek Immediate Emergency Care',
        };
      case 'urgent':
        return {
          bg: 'bg-[#faf4ed]',
          border: 'border-[#ecdccb]',
          badgeBg: 'bg-[#d4a373] text-white',
          titleColor: 'text-[#5e3814]',
          accentColor: 'text-[#8a5d33]',
          icon: AlertTriangle,
          tag: 'URGENT MEDICAL ATTENTION',
          actionText: 'Visit Urgent Care or Same-Day Clinic',
        };
      case 'routine':
        return {
          bg: 'bg-[#eef2ef]',
          border: 'border-[#dce5dc]',
          badgeBg: 'bg-[#4a5d4e] text-white',
          titleColor: 'text-[#2b352e]',
          accentColor: 'text-[#3a443d]',
          icon: Clock,
          tag: 'PRIMARY CARE CONSULTATION',
          actionText: 'Schedule Standard Appointment',
        };
      case 'self_care':
      default:
        return {
          bg: 'bg-[#faf9f6]',
          border: 'border-[#ece9e2]',
          badgeBg: 'bg-[#4a5d4e] text-white',
          titleColor: 'text-[#2d2a26]',
          accentColor: 'text-[#4a5d4e]',
          icon: CheckCircle2,
          tag: 'SUPPORTIVE HOME CARE',
          actionText: 'Rest & Monitor at Home',
        };
    }
  };

  const config = getUrgencyConfig(result.urgency);
  const Icon = config.icon;

  const handleCopySummary = () => {
    const text = `--- CAREPULSE TRIAGE REPORT ---
Urgency: ${result.urgencyTitle}
Reported Symptoms: ${result.symptoms.join(', ')}
Duration: ${result.duration} | Severity: ${result.severity}
Recommended Specialist: ${result.recommendedSpecialist}
Explanation: ${result.explanation}
Next Steps:
${result.nextSteps.map(s => `- ${s}`).join('\n')}
--------------------------------`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="triage-result-card" className={`rounded-[32px] border ${config.border} ${config.bg} p-6 sm:p-8 shadow-sm transition-all`}>
      
      {/* Header Badge & Urgency Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#e5e1d8]">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl ${config.badgeBg} shadow-2xs`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${config.badgeBg}`}>
                {config.tag}
              </span>
              <span className="text-xs text-[#6d6a66] font-medium">
                {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${config.titleColor} mt-1.5`}>
              {result.urgencyTitle}
            </h2>
          </div>
        </div>

        <button
          id="copy-triage-summary-btn"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2d2a26] hover:text-[#1e1d1a] bg-white hover:bg-[#f3efe8] border border-[#e5e1d8] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#4a5d4e]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Main Clinical Recommendation & Explanation */}
      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#2d2a26]">{result.headline}</h3>
          <p className="text-sm text-[#3a443d] leading-relaxed mt-1">{result.explanation}</p>
        </div>

        {/* Symptoms Evaluated Summary */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e1d8] shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-2.5">Evaluated Profile</div>
          <div className="flex flex-wrap items-center gap-2">
            {result.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-[#f3efe8] text-[#2d2a26] border border-[#e5e1d8]"
              >
                {symptom}
              </span>
            ))}
          </div>
          <div className="mt-3.5 pt-3.5 border-t border-[#f0ede6] flex flex-wrap gap-4 text-xs text-[#6d6a66]">
            <div>
              <span className="font-semibold text-[#3a443d]">Duration:</span> {result.duration}
            </div>
            <div>
              <span className="font-semibold text-[#3a443d]">Severity:</span> {result.severity}
            </div>
            <div>
              <span className="font-semibold text-[#3a443d]">Recommended Specialty:</span>{' '}
              <strong className="text-[#2d2a26]">{result.recommendedSpecialist}</strong>
            </div>
          </div>
        </div>

        {/* Clinical Rule Triggers / Red Flags */}
        {result.matchedRules.length > 0 && (
          <div className="bg-[#f3efe8] rounded-2xl p-4 border border-[#e5e1d8]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3a443d] uppercase tracking-wider mb-2">
              <Info className="w-4 h-4 text-[#4a5d4e]" />
              <span>Clinical Triage Rules Triggered</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#6d6a66]">
              {result.matchedRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#4a5d4e] font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Action Steps */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e1d8] shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3a443d] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4a5d4e]" />
            <span>Recommended Next Steps</span>
          </div>
          <ol className="space-y-2.5 text-sm text-[#2d2a26] list-decimal list-inside">
            {result.nextSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="text-[#2d2a26] font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Warning Signs */}
        {result.warningSignsToWatch && result.warningSignsToWatch.length > 0 && (
          <div className="p-5 bg-[#fcf2f0] border border-[#f0d2ce] rounded-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7a2b22] mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#b84a39]" />
              <span>Red-Flag Symptoms to Watch (Seek Immediate Care if Any Appear):</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#7a2b22]">
              {result.warningSignsToWatch.map((warning, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b84a39] shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons Hub */}
      <div className="mt-8 pt-6 border-t border-[#e5e1d8] flex flex-wrap items-center justify-between gap-3">
        <button
          id="re-evaluate-symptoms-btn"
          onClick={onReset}
          className="text-xs sm:text-sm font-medium text-[#6d6a66] hover:text-[#2d2a26] bg-white hover:bg-[#f3efe8] border border-[#e5e1d8] px-4 py-2.5 rounded-2xl transition-colors shadow-2xs"
        >
          Check Different Symptoms
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="open-doctor-prep-btn"
            onClick={() => onOpenDoctorPrep(result)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#8a5d33] bg-[#faf2eb] hover:bg-[#f4e6d8] border border-[#e8d5c4] px-4 py-2.5 rounded-2xl transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#d4a373]" />
            <span>Doctor Visit Prep & Questions</span>
          </button>

          <button
            id="book-reminder-from-triage-btn"
            onClick={() => onBookAppointment(result)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] px-5 py-2.5 rounded-2xl shadow-xs transition-all hover:shadow-sm"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Set Appointment Reminder</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
