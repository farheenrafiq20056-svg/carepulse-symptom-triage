import { SymptomItem } from '../types';

export const SYMPTOM_CATEGORIES = [
  { id: 'all', label: 'All Symptoms' },
  { id: 'respiratory', label: 'Respiratory & Throat' },
  { id: 'cardiovascular', label: 'Chest & Circulation' },
  { id: 'neurological', label: 'Head & Neurological' },
  { id: 'gastrointestinal', label: 'Stomach & Digestion' },
  { id: 'systemic', label: 'Whole Body & Fever' },
  { id: 'musculoskeletal', label: 'Joints & Muscles' },
] as const;

export const SYMPTOMS_LIST: SymptomItem[] = [
  // Respiratory
  {
    id: 'shortness_of_breath',
    label: 'Shortness of Breath / Breathing Difficulty',
    category: 'respiratory',
    severityWeight: 5,
    isRedFlag: true,
    description: 'Struggling to catch your breath or gasping at rest.',
  },
  {
    id: 'persistent_cough',
    label: 'Persistent Cough (> 1 week)',
    category: 'respiratory',
    severityWeight: 2,
    description: 'Dry or productive hacking cough lasting several days.',
  },
  {
    id: 'wheezing',
    label: 'Wheezing / High-Pitched Breathing',
    category: 'respiratory',
    severityWeight: 3,
    description: 'Whistling sound when exhaling, tight airways.',
  },
  {
    id: 'sore_throat',
    label: 'Sore or Scratchy Throat',
    category: 'respiratory',
    severityWeight: 1,
    description: 'Pain when swallowing, redness or scratchiness.',
  },
  {
    id: 'runny_stuffy_nose',
    label: 'Runny or Stuffy Nose / Congestion',
    category: 'respiratory',
    severityWeight: 1,
    description: 'Nasal drainage, post-nasal drip, sinus fullness.',
  },
  {
    id: 'loss_of_smell_taste',
    label: 'Loss of Taste or Smell',
    category: 'respiratory',
    severityWeight: 2,
    description: 'Anosmia or sudden alteration in taste perception.',
  },

  // Cardiovascular & Chest
  {
    id: 'chest_pain',
    label: 'Chest Pain or Pressure / Tightness',
    category: 'cardiovascular',
    severityWeight: 5,
    isRedFlag: true,
    description: 'Crushing, squeezing sensation in center or left side of chest.',
  },
  {
    id: 'rapid_heartbeat',
    label: 'Rapid or Irregular Heartbeat (Palpitations)',
    category: 'cardiovascular',
    severityWeight: 3,
    description: 'Heart racing, fluttering, or skipping beats while resting.',
  },
  {
    id: 'swollen_legs_ankles',
    label: 'Swollen Feet, Ankles or Legs (Edema)',
    category: 'cardiovascular',
    severityWeight: 2,
    description: 'Noticeable fluid retention in lower extremities.',
  },

  // Neurological & Head
  {
    id: 'sudden_severe_headache',
    label: 'Sudden "Thunderclap" Severe Headache',
    category: 'neurological',
    severityWeight: 5,
    isRedFlag: true,
    description: 'Worst headache of your life, sudden onset within seconds.',
  },
  {
    id: 'mild_moderate_headache',
    label: 'Mild to Moderate Tension Headache',
    category: 'neurological',
    severityWeight: 1,
    description: 'Dull ache around forehead, temples, or back of head.',
  },
  {
    id: 'confusion_slurred_speech',
    label: 'Confusion, Dizziness or Slurred Speech',
    category: 'neurological',
    severityWeight: 5,
    isRedFlag: true,
    description: 'Trouble speaking, facial drooping, one-sided weakness or sudden disorientation.',
  },
  {
    id: 'dizziness_lightheaded',
    label: 'Lightheadedness or Mild Dizziness',
    category: 'neurological',
    severityWeight: 2,
    description: 'Feeling unsteady when standing up or turning quickly.',
  },
  {
    id: 'stiff_neck',
    label: 'Stiff Neck with Inability to Touch Chin to Chest',
    category: 'neurological',
    severityWeight: 4,
    isRedFlag: true,
    description: 'Severe neck rigidity accompanied by illness.',
  },

  // Gastrointestinal
  {
    id: 'severe_abdominal_pain',
    label: 'Severe or Sharp Abdominal Pain',
    category: 'gastrointestinal',
    severityWeight: 4,
    isRedFlag: true,
    description: 'Intense cramping or localized sharp stomach pain.',
  },
  {
    id: 'nausea_vomiting',
    label: 'Nausea and Repeated Vomiting',
    category: 'gastrointestinal',
    severityWeight: 2,
    description: 'Unable to keep liquids down for over 12-24 hours.',
  },
  {
    id: 'persistent_diarrhea',
    label: 'Frequent Diarrhea / Loose Stools',
    category: 'gastrointestinal',
    severityWeight: 2,
    description: 'Watery bowel movements multiple times per day.',
  },
  {
    id: 'loss_of_appetite',
    label: 'Loss of Appetite & Stomach Upset',
    category: 'gastrointestinal',
    severityWeight: 1,
    description: 'Feeling full quickly or mild indigestion.',
  },

  // Systemic & Whole Body
  {
    id: 'high_fever',
    label: 'High Fever (> 101.5°F / 38.6°C)',
    category: 'systemic',
    severityWeight: 4,
    description: 'Elevated body temperature with sweating or chills.',
  },
  {
    id: 'mild_fever_chills',
    label: 'Low-Grade Fever / Chills (99.5 - 101°F)',
    category: 'systemic',
    severityWeight: 2,
    description: 'Warm feeling, shivering, mild feverish state.',
  },
  {
    id: 'extreme_fatigue',
    label: 'Extreme Fatigue & Weakness',
    category: 'systemic',
    severityWeight: 2,
    description: 'Difficulty getting out of bed, feeling completely drained.',
  },
  {
    id: 'unexplained_rash',
    label: 'Spreading Skin Rash or Hives',
    category: 'systemic',
    severityWeight: 3,
    description: 'Red spots, blisters, or itchy hives spreading rapidly.',
  },

  // Musculoskeletal
  {
    id: 'muscle_body_aches',
    label: 'Generalized Body & Muscle Aches',
    category: 'musculoskeletal',
    severityWeight: 2,
    description: 'Flu-like widespread muscular soreness.',
  },
  {
    id: 'joint_pain_swelling',
    label: 'Joint Pain or Swelling',
    category: 'musculoskeletal',
    severityWeight: 2,
    description: 'Pain, warmth, or stiffness in knees, fingers, or wrists.',
  },
];

export const DURATION_OPTIONS = [
  { value: 'less_than_24h', label: 'Today (< 24 hours)', weight: 1 },
  { value: '1_to_3_days', label: '1 – 3 Days', weight: 2 },
  { value: '4_to_7_days', label: '4 – 7 Days', weight: 3 },
  { value: 'more_than_1_week', label: 'More than 1 Week', weight: 4 },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild (Noticeable but does not disrupt daily tasks)', multiplier: 1.0 },
  { value: 'moderate', label: 'Moderate (Disrupts work or sleep; requires resting)', multiplier: 1.4 },
  { value: 'severe', label: 'Severe (Incapacitating, intense pain or distress)', multiplier: 2.0 },
] as const;

export const COMMON_SPECIALTIES = [
  'General Practitioner / Primary Care',
  'Urgent Care Physician',
  'Cardiologist',
  'Pulmonologist (Lungs)',
  'Gastroenterologist',
  'Neurologist',
  'ENT (Ear, Nose, Throat) Specialist',
  'Dermatologist',
  'Orthopedic / Rheumatologist',
  'Infectious Disease Specialist',
  'Telehealth Virtual Doctor',
];
