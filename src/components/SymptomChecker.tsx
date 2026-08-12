import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  Clock,
  Activity,
  Flame,
  Info,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { SYMPTOMS_LIST, SYMPTOM_CATEGORIES, DURATION_OPTIONS, SEVERITY_OPTIONS } from '../constants/symptoms';
import { TriageEvaluationRequest, TriageResult, UrgencyLevel } from '../types';
import { TriageResultCard } from './TriageResultCard';
import { api } from '../utils/api';
import { evaluateSymptoms } from '../utils/triage';

interface SymptomCheckerProps {
  onBookAppointment: (result: TriageResult) => void;
  onOpenDoctorPrep: (result: TriageResult) => void;
  onEvaluationComplete?: (result: TriageResult) => void;
  isLoggedIn: boolean;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onBookAppointment,
  onOpenDoctorPrep,
  onEvaluationComplete,
  isLoggedIn,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [duration, setDuration] = useState<'less_than_24h' | '1_to_3_days' | '4_to_7_days' | 'more_than_1_week'>('1_to_3_days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [hasChronicConditions, setHasChronicConditions] = useState<boolean>(false);
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>('adult');
  
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  // Filter symptoms by category and search
  const filteredSymptoms = SYMPTOMS_LIST.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearAllSymptoms = () => {
    setSelectedSymptomIds([]);
    setResult(null);
  };

  // Quick Preset buttons for demonstration and testing common medical clinical scenarios
  const applyPreset = (preset: 'fever_chest_pain' | 'mild_cold' | 'prolonged_cough' | 'stomach_bug') => {
    if (preset === 'fever_chest_pain') {
      setSelectedSymptomIds(['chest_pain', 'high_fever', 'shortness_of_breath']);
      setDuration('less_than_24h');
      setSeverity('severe');
    } else if (preset === 'mild_cold') {
      setSelectedSymptomIds(['runny_stuffy_nose', 'sore_throat', 'mild_moderate_headache']);
      setDuration('1_to_3_days');
      setSeverity('mild');
    } else if (preset === 'prolonged_cough') {
      setSelectedSymptomIds(['persistent_cough', 'extreme_fatigue']);
      setDuration('more_than_1_week');
      setSeverity('moderate');
    } else if (preset === 'stomach_bug') {
      setSelectedSymptomIds(['severe_abdominal_pain', 'nausea_vomiting', 'mild_fever_chills']);
      setDuration('1_to_3_days');
      setSeverity('moderate');
    }
  };

  const handleEvaluate = async () => {
    if (selectedSymptomIds.length === 0) return;

    setEvaluating(true);
    const reqData: TriageEvaluationRequest = {
      symptomIds: selectedSymptomIds,
      duration,
      severity,
      hasChronicConditions,
      ageGroup,
    };

    try {
      // Execute via backend route if reachable, with local deterministic fallback
      const apiRes = await api.checkSymptoms(reqData);
      setResult(apiRes.result);
      if (onEvaluationComplete) onEvaluationComplete(apiRes.result);
    } catch (err) {
      console.warn('Backend route offline, executing client-side rule triage:', err);
      const localResult = evaluateSymptoms(reqData);
      setResult(localResult);
      if (onEvaluationComplete) onEvaluationComplete(localResult);
    } finally {
      setEvaluating(false);
      // Scroll smoothly to results card
      setTimeout(() => {
        document.getElementById('triage-result-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const selectedCount = selectedSymptomIds.length;
  const hasRedFlags = SYMPTOMS_LIST.filter(s => selectedSymptomIds.includes(s.id) && s.isRedFlag).length > 0;

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Explanation Card */}
      <div className="bg-[#3a443d] rounded-[32px] p-6 sm:p-8 text-white shadow-sm border border-[#2e3731] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#d8e6db] text-xs font-semibold uppercase tracking-wider mb-3 border border-white/15">
            <HeartPulse className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>Rule-Based Medical Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            What symptoms are you experiencing today?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#e2ede5] leading-relaxed">
            Select your symptoms from the checklist below to receive instant clinical triage advice, urgency guidance (Emergency, Urgent Care, Routine, or Home Care), and recommended specialist type.
          </p>

          {/* Quick Scenario Preset Chips */}
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#e2ede5] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" /> Try Sample Scenarios:
            </span>
            <button
              id="preset-fever-chest-btn"
              onClick={() => applyPreset('fever_chest_pain')}
              className="px-3 py-1.5 rounded-xl bg-[#7a2b22]/40 hover:bg-[#7a2b22]/60 text-[#fbd8d3] border border-[#b84a39]/50 transition-colors"
            >
              ⚠️ Fever + Chest Pain
            </button>
            <button
              id="preset-mild-cold-btn"
              onClick={() => applyPreset('mild_cold')}
              className="px-3 py-1.5 rounded-xl bg-[#4a5d4e]/60 hover:bg-[#4a5d4e]/80 text-[#e8f0e8] border border-[#6b8570]/60 transition-colors"
            >
              🌿 Mild Cold & Congestion
            </button>
            <button
              id="preset-prolonged-cough-btn"
              onClick={() => applyPreset('prolonged_cough')}
              className="px-3 py-1.5 rounded-xl bg-[#d4a373]/30 hover:bg-[#d4a373]/50 text-[#fbeee0] border border-[#d4a373]/50 transition-colors"
            >
              ⏱️ Persistent Cough (&gt;1 wk)
            </button>
            <button
              id="preset-stomach-bug-btn"
              onClick={() => applyPreset('stomach_bug')}
              className="px-3 py-1.5 rounded-xl bg-[#8a5d33]/40 hover:bg-[#8a5d33]/60 text-[#fae9db] border border-[#c2966b]/50 transition-colors"
            >
              🥣 Stomach Pain & Nausea
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Checklist Section */}
      <div className="bg-white rounded-[32px] border border-[#e5e1d8] p-6 sm:p-8 shadow-sm">
        
        {/* Step 1: Symptom Checklist Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#e5e1d8]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#4a5d4e] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                1
              </span>
              <h2 className="text-xl font-bold text-[#2d2a26]">Select Your Symptoms</h2>
            </div>
            <p className="text-xs text-[#6d6a66] mt-0.5 ml-9.5">Choose all symptoms that apply to your current condition</p>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#4a5d4e] bg-[#eef2ef] border border-[#dce5dc] px-3 py-1 rounded-full">
                {selectedCount} {selectedCount === 1 ? 'symptom' : 'symptoms'} selected
              </span>
              <button
                id="clear-all-symptoms-btn"
                onClick={clearAllSymptoms}
                className="text-xs text-[#6d6a66] hover:text-[#99473b] font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Search & Category Filter Pills */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a8680] absolute left-3.5 top-3" />
            <input
              id="symptom-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search symptoms (e.g. fever, cough, chest, headache, stomach)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SYMPTOM_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#4a5d4e] text-white shadow-2xs font-semibold'
                    : 'bg-[#f3efe8] text-[#6d6a66] hover:bg-[#ece7de] hover:text-[#2d2a26]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Symptoms Tag Bar (if any selected) */}
        {selectedCount > 0 && (
          <div className="mt-4 p-3.5 bg-[#eef2ef] border border-[#dce5dc] rounded-2xl flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#3a443d]">Active Selection:</span>
            {selectedSymptomIds.map(id => {
              const item = SYMPTOMS_LIST.find(s => s.id === id);
              if (!item) return null;
              return (
                <span
                  key={id}
                  onClick={() => toggleSymptom(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    item.isRedFlag
                      ? 'bg-[#fae2de] text-[#7a2b22] border border-[#f0d2ce] hover:bg-[#f7cfc8]'
                      : 'bg-white text-[#2d2a26] border border-[#dce5dc] hover:border-[#b84a39] hover:bg-[#fae2de]'
                  }`}
                  title="Click to remove"
                >
                  {item.isRedFlag && <span className="w-1.5 h-1.5 rounded-full bg-[#b84a39]" />}
                  <span>{item.label}</span>
                  <span className="text-[#8a8680] hover:text-[#7a2b22] font-bold ml-0.5">×</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Checklist Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredSymptoms.map(item => {
            const isSelected = selectedSymptomIds.includes(item.id);
            return (
              <div
                key={item.id}
                id={`symptom-item-${item.id}`}
                onClick={() => toggleSymptom(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  isSelected
                    ? item.isRedFlag
                      ? 'bg-[#fcf2f0] border-[#b84a39] shadow-2xs'
                      : 'bg-[#eef2ef] border-[#4a5d4e] shadow-2xs'
                    : 'bg-[#fcfbf9] border-[#ece9e2] hover:border-[#ded9ce] hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by container onClick
                  className={`mt-1 rounded w-4 h-4 accent-[#4a5d4e] ${
                    item.isRedFlag ? 'accent-[#b84a39]' : 'accent-[#4a5d4e]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-[#2d2a26] font-bold' : 'text-[#2d2a26]'}`}>
                      {item.label}
                    </span>
                    {item.isRedFlag && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7a2b22] bg-[#fae2de] border border-[#f0d2ce] px-2 py-0.5 rounded-full shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5" /> Red Flag
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-[#6d6a66] mt-0.5 leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2: Duration, Severity & Patient Context */}
        <div className="mt-8 pt-6 border-t border-[#e5e1d8]">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#4a5d4e] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
              2
            </span>
            <h2 className="text-xl font-bold text-[#2d2a26]">Duration & Severity Context</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6d6a66] mb-2">
                How long have you had these symptoms?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    id={`duration-opt-${opt.value}`}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium border text-left transition-all ${
                      duration === opt.value
                        ? 'bg-[#eef2ef] text-[#3a443d] border-[#4a5d4e] font-bold ring-1 ring-[#4a5d4e]'
                        : 'bg-[#fcfbf9] text-[#6d6a66] border-[#ece9e2] hover:bg-[#f3efe8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6d6a66] mb-2">
                Overall Intensity / Severity
              </label>
              <div className="space-y-2">
                {SEVERITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    id={`severity-opt-${opt.value}`}
                    type="button"
                    onClick={() => setSeverity(opt.value)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      severity === opt.value
                        ? 'bg-[#eef2ef] text-[#3a443d] border-[#4a5d4e] font-bold ring-1 ring-[#4a5d4e]'
                        : 'bg-[#fcfbf9] text-[#6d6a66] border-[#ece9e2] hover:bg-[#f3efe8]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.value === 'severe' && (
                      <span className="text-[10px] uppercase font-bold text-[#7a2b22] bg-[#fae2de] px-2 py-0.5 rounded-full border border-[#f0d2ce]">
                        High Priority
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Optional Health Profile Context */}
          <div className="mt-6 p-4 bg-[#faf9f6] rounded-2xl border border-[#e5e1d8] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#3a443d] select-none">
                <input
                  id="chronic-condition-toggle"
                  type="checkbox"
                  checked={hasChronicConditions}
                  onChange={e => setHasChronicConditions(e.target.checked)}
                  className="rounded w-4 h-4 accent-[#4a5d4e]"
                />
                <span>Pre-existing chronic condition (Asthma, Diabetes, Heart Disease, Immuno-compromised)</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6d6a66]">
              <span className="font-semibold text-[#3a443d]">Age Group:</span>
              <select
                id="age-group-select"
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value as any)}
                className="bg-white border border-[#e5e1d8] rounded-xl px-2.5 py-1 text-xs focus:ring-[#4a5d4e] text-[#2d2a26]"
              >
                <option value="adult">Adult (18–64)</option>
                <option value="child">Pediatric / Child (&lt;18)</option>
                <option value="senior">Senior (65+)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Live Safety Warning & Evaluate Button */}
        <div className="mt-8 pt-6 border-t border-[#e5e1d8] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#6d6a66]">
            {hasRedFlags ? (
              <span className="text-[#7a2b22] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#b84a39]" />
                Critical warning symptoms flagged. Please evaluate immediately.
              </span>
            ) : selectedCount > 0 ? (
              <span className="text-[#4a5d4e] font-semibold">Ready for clinical rule triage evaluation</span>
            ) : (
              <span>Select at least 1 symptom to proceed</span>
            )}
          </div>

          <button
            id="evaluate-symptoms-main-btn"
            onClick={handleEvaluate}
            disabled={selectedCount === 0 || evaluating}
            className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-sm ${
              selectedCount === 0 || evaluating
                ? 'bg-[#ded9ce] cursor-not-allowed text-[#8a8680]'
                : 'bg-[#4a5d4e] hover:bg-[#3a443d] hover:shadow-md'
            }`}
          >
            {evaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Analyze Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Triage Result Card */}
      {result && (
        <TriageResultCard
          result={result}
          onBookAppointment={onBookAppointment}
          onOpenDoctorPrep={onOpenDoctorPrep}
          onReset={clearAllSymptoms}
        />
      )}

    </div>
  );
};
