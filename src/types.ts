export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'self_care';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SymptomItem {
  id: string;
  label: string;
  category: 'respiratory' | 'cardiovascular' | 'gastrointestinal' | 'neurological' | 'systemic' | 'musculoskeletal';
  severityWeight: number; // 1 to 5
  isRedFlag?: boolean;
  description?: string;
}

export interface TriageEvaluationRequest {
  symptomIds: string[];
  duration: 'less_than_24h' | '1_to_3_days' | '4_to_7_days' | 'more_than_1_week';
  severity: 'mild' | 'moderate' | 'severe';
  ageGroup?: 'child' | 'adult' | 'senior';
  hasChronicConditions?: boolean;
  additionalNotes?: string;
}

export interface TriageResult {
  id?: string;
  urgency: UrgencyLevel;
  urgencyTitle: string;
  headline: string;
  explanation: string;
  matchedRules: string[];
  redFlagsDetected: string[];
  recommendedSpecialist: string;
  nextSteps: string[];
  warningSignsToWatch: string[];
  timestamp: string;
  symptoms: string[];
  duration: string;
  severity: string;
}

export interface AppointmentReminder {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  notes?: string;
  urgencySuggested?: UrgencyLevel;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  reminderNoticeHours?: number; // e.g. 24, 2, 1
}

export interface SymptomLog {
  id: string;
  userId: string;
  symptoms: string[];
  symptomLabels: string[];
  duration: string;
  severity: string;
  urgency: UrgencyLevel;
  headline: string;
  explanation: string;
  recommendedSpecialist: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User | null;
  message?: string;
  success: boolean;
}
