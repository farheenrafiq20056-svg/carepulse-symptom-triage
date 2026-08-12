import React, { useState, useEffect } from 'react';
import { X, Sparkles, HelpCircle, CheckSquare, FileText, HeartHandshake, Copy, Check, Loader2 } from 'lucide-react';
import { TriageResult } from '../types';
import { api } from '../utils/api';

interface DoctorPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageResult: TriageResult | null;
  defaultDoctorName?: string;
  defaultSpecialty?: string;
}

export const DoctorPrepModal: React.FC<DoctorPrepModalProps> = ({
  isOpen,
  onClose,
  triageResult,
  defaultDoctorName,
  defaultSpecialty,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prepData, setPrepData] = useState<{
    questionsToAsk: string[];
    whatToBring: string[];
    symptomLogSummary: string;
    selfCareAdvice: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && triageResult) {
      loadPrep();
    }
  }, [isOpen, triageResult]);

  const loadPrep = async () => {
    if (!triageResult) return;
    setLoading(true);
    try {
      const res = await api.generateVisitPrep({
        symptoms: triageResult.symptoms,
        duration: triageResult.duration,
        severity: triageResult.severity,
        specialty: defaultSpecialty || triageResult.recommendedSpecialist,
        doctorName: defaultDoctorName || 'Doctor',
      });
      setPrepData(res.prep);
    } catch (err) {
      console.error('Failed to load prep:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!prepData || !triageResult) return;
    const text = `--- APPOINTMENT PREPARATION GUIDE ---
Patient Summary: ${prepData.symptomLogSummary}
Target Specialist: ${triageResult.recommendedSpecialist}

QUESTIONS TO ASK THE DOCTOR:
${prepData.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}

WHAT TO BRING:
${prepData.whatToBring.map((item, i) => `[ ] ${item}`).join('\n')}

SELF-CARE WHILE WAITING:
${prepData.selfCareAdvice.map((a, i) => `- ${a}`).join('\n')}
------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="doctor-prep-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e5e1d8] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e1d8] bg-[#fcfbf9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#faf2eb] text-[#8a5d33] rounded-2xl shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#d4a373]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2d2a26]">Doctor Visit Preparation Guide</h3>
              <p className="text-xs text-[#6d6a66]">Tailored questions & checklist for your consultation</p>
            </div>
          </div>
          <button
            id="close-prep-modal-btn"
            onClick={onClose}
            className="p-2 text-[#8a8680] hover:text-[#2d2a26] hover:bg-[#f3efe8] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2d2a26]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#4a5d4e] animate-spin" />
              <p className="text-sm font-medium text-[#6d6a66]">Generating customized medical questions...</p>
            </div>
          ) : prepData ? (
            <>
              {/* Patient Opening Statement */}
              <div className="bg-[#faf2eb] border border-[#e8d5c4] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8a5d33] mb-1.5">
                  <FileText className="w-4 h-4 text-[#d4a373]" />
                  <span>How to Describe Your Condition to the Doctor:</span>
                </div>
                <p className="text-sm text-[#5e3814] font-medium leading-relaxed italic">
                  "{prepData.symptomLogSummary}"
                </p>
              </div>

              {/* High-Yield Questions to Ask */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-3">
                  <HelpCircle className="w-4 h-4 text-[#4a5d4e]" />
                  <span>Recommended Questions to Ask During Your Visit</span>
                </div>
                <div className="space-y-2.5">
                  {prepData.questionsToAsk.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#fcfbf9] border border-[#e5e1d8] rounded-2xl p-4 text-sm text-[#2d2a26]">
                      <span className="w-6 h-6 rounded-full bg-[#4a5d4e] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Bring Checklist */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-3">
                  <CheckSquare className="w-4 h-4 text-[#4a5d4e]" />
                  <span>What to Bring to the Clinic</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prepData.whatToBring.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#e5e1d8] bg-white shadow-2xs">
                      <input type="checkbox" id={`prep-check-${idx}`} className="mt-1 rounded text-[#4a5d4e] focus:ring-[#4a5d4e] accent-[#4a5d4e]" />
                      <label htmlFor={`prep-check-${idx}`} className="text-xs text-[#2d2a26] font-medium cursor-pointer leading-normal">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Supportive Care */}
              <div className="bg-[#eef2ef] border border-[#dce5dc] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3a443d] mb-2.5">
                  <HeartHandshake className="w-4 h-4 text-[#4a5d4e]" />
                  <span>Supportive Care While Waiting</span>
                </div>
                <ul className="space-y-2 text-xs text-[#3a443d]">
                  {prepData.selfCareAdvice.map((advice, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a5d4e] shrink-0" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6d6a66]">No visit prep generated.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 border-t border-[#e5e1d8] bg-[#fcfbf9] flex items-center justify-between">
          <button
            id="copy-prep-guide-btn"
            onClick={handleCopy}
            disabled={!prepData || loading}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2d2a26] hover:text-[#1e1d1a] bg-white border border-[#e5e1d8] px-4 py-2 rounded-2xl transition-colors shadow-2xs disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-[#4a5d4e]" /> : <Copy className="w-4 h-4 text-[#8a8680]" />}
            <span>{copied ? 'Copied Guide!' : 'Copy to Clipboard'}</span>
          </button>
          <button
            id="done-prep-guide-btn"
            onClick={onClose}
            className="text-xs sm:text-sm font-semibold text-white bg-[#4a5d4e] hover:bg-[#3a443d] px-6 py-2 rounded-2xl transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
