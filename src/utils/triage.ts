import { TriageEvaluationRequest, TriageResult, UrgencyLevel } from '../types';
import { SYMPTOMS_LIST, DURATION_OPTIONS, SEVERITY_OPTIONS } from '../constants/symptoms';

export function evaluateSymptoms(request: TriageEvaluationRequest): TriageResult {
  const { symptomIds, duration, severity, ageGroup, hasChronicConditions } = request;
  
  const selectedSymptoms = SYMPTOMS_LIST.filter(s => symptomIds.includes(s.id));
  const symptomNames = selectedSymptoms.map(s => s.label);
  const redFlags = selectedSymptoms.filter(s => s.isRedFlag).map(s => s.label);
  
  const hasChestPain = symptomIds.includes('chest_pain');
  const hasBreathingDifficulty = symptomIds.includes('shortness_of_breath');
  const hasHighFever = symptomIds.includes('high_fever');
  const hasMildFever = symptomIds.includes('mild_fever_chills') || hasHighFever;
  const hasStiffNeck = symptomIds.includes('stiff_neck');
  const hasConfusion = symptomIds.includes('confusion_slurred_speech');
  const hasSevereHeadache = symptomIds.includes('sudden_severe_headache');
  const hasAbdominalPain = symptomIds.includes('severe_abdominal_pain');
  const hasWheezing = symptomIds.includes('wheezing');
  const hasPersistentCough = symptomIds.includes('persistent_cough');
  const hasRash = symptomIds.includes('unexplained_rash');
  const hasPalpitations = symptomIds.includes('rapid_heartbeat');
  const hasNauseaVomiting = symptomIds.includes('nausea_vomiting');

  const durationWeight = DURATION_OPTIONS.find(d => d.value === duration)?.weight || 1;
  const severityMultiplier = SEVERITY_OPTIONS.find(s => s.value === severity)?.multiplier || 1.0;
  
  // Calculate weighted symptom score
  const baseWeight = selectedSymptoms.reduce((acc, s) => acc + s.severityWeight, 0);
  const totalScore = (baseWeight + (durationWeight * 1.5)) * severityMultiplier + (hasChronicConditions ? 2 : 0) + (ageGroup === 'senior' ? 1.5 : 0);

  const matchedRules: string[] = [];
  const redFlagsDetected: string[] = [...redFlags];
  let urgency: UrgencyLevel = 'self_care';
  let urgencyTitle = 'Low Urgency • Rest & Monitor at Home';
  let headline = 'Mild symptoms consistent with common viral or minor illness';
  let explanation = 'Your selected symptoms do not indicate acute critical warning signs. Prioritize rest, hydration, and monitoring over the next 24-48 hours.';
  let recommendedSpecialist = 'Primary Care / Telehealth';
  const nextSteps: string[] = [];
  const warningSignsToWatch: string[] = [
    'Sudden difficulty breathing or chest tightness',
    'Fever spiking over 103°F (39.4°C) or not responding to medication',
    'Severe persistent vomiting preventing fluid retention',
  ];

  // EMERGENCY CRITICAL RULES
  if (hasChestPain && (hasBreathingDifficulty || hasHighFever || hasPalpitations || severity === 'severe')) {
    urgency = 'emergency';
    matchedRules.push('CRITICAL RULE: Chest Pain combined with Respiratory Distress or Severe Distress');
    urgencyTitle = 'EMERGENCY: Seek Immediate Medical Care';
    headline = 'Potential cardiac or acute pulmonary event detected';
    explanation = 'The combination of chest pressure/pain with respiratory difficulty or high fever requires immediate medical evaluation in an emergency department.';
    recommendedSpecialist = 'Emergency Medicine / 911 Ambulance';
    nextSteps.push('Call emergency services (911 in the US) or go to the nearest Emergency Room immediately.');
    nextSteps.push('Do NOT drive yourself; have someone drive you or call an ambulance.');
    nextSteps.push('Rest in an upright seated position while waiting for help.');
  } else if (hasConfusion || hasSevereHeadache) {
    urgency = 'emergency';
    matchedRules.push('CRITICAL RULE: Acute Neurological Warning Sign (Confusion/Thunderclap Headache)');
    urgencyTitle = 'EMERGENCY: Urgent Neurological Assessment';
    headline = 'Acute neurological symptoms require urgent emergency care';
    explanation = 'Sudden confusion, speech changes, or severe thunderclap headache can indicate vascular or neurological emergencies like stroke or aneurysm.';
    recommendedSpecialist = 'Emergency Department (Stroke/Neuro Center)';
    nextSteps.push('Seek immediate emergency room evaluation without delay.');
    nextSteps.push('Note the exact time symptoms started for medical providers.');
  } else if (hasHighFever && hasStiffNeck) {
    urgency = 'emergency';
    matchedRules.push('CRITICAL RULE: High Fever paired with Severe Neck Stiffness (Meningeal Sign)');
    urgencyTitle = 'EMERGENCY: Possible Central Nervous System Infection';
    headline = 'Fever with neck stiffness requires immediate hospital evaluation';
    explanation = 'This symptom triad is a hallmark red flag for acute meningitis or serious spinal/brain infection requiring immediate IV antibiotics or diagnostics.';
    recommendedSpecialist = 'Emergency Department / Infectious Disease';
    nextSteps.push('Head to the nearest emergency department right away.');
  } else if (hasBreathingDifficulty && (severity === 'severe' || hasChronicConditions)) {
    urgency = 'emergency';
    matchedRules.push('CRITICAL RULE: Severe Shortness of Breath');
    urgencyTitle = 'EMERGENCY: Acute Respiratory Compromise';
    headline = 'Severe breathing difficulty detected';
    explanation = 'Inability to breathe comfortably at rest is a life-threatening symptom requiring emergency respiratory support.';
    recommendedSpecialist = 'Emergency Department / Pulmonology';
    nextSteps.push('Seek immediate emergency room care or call 911.');
  } 
  // URGENT CARE RULES
  else if (hasAbdominalPain && (severity === 'severe' || hasHighFever || duration !== 'less_than_24h')) {
    urgency = 'urgent';
    matchedRules.push('URGENT RULE: Acute / Severe Abdominal Pain');
    urgencyTitle = 'Urgent: Same-Day Doctor or Urgent Care Visit';
    headline = 'Significant abdominal distress needing clinical examination';
    explanation = 'Severe localized stomach pain with fever or lasting multiple days could indicate appendicitis, gallbladder inflammation, or acute gastrointestinal infection.';
    recommendedSpecialist = 'Urgent Care Physician / Gastroenterologist';
    nextSteps.push('Visit an Urgent Care clinic or contact your primary care doctor for a same-day appointment.');
    nextSteps.push('Avoid eating heavy foods or taking NSAID painkillers before examination.');
  } else if (hasHighFever && (duration === '4_to_7_days' || duration === 'more_than_1_week' || hasChronicConditions)) {
    urgency = 'urgent';
    matchedRules.push('URGENT RULE: Prolonged High Fever (> 3 days)');
    urgencyTitle = 'Urgent: Medical Assessment Recommended Soon';
    headline = 'Prolonged high fever requires diagnostic testing';
    explanation = 'A high fever persisting for more than 3 days may suggest a bacterial infection (e.g. pneumonia, strep, UTI) needing prescription medication.';
    recommendedSpecialist = 'Primary Care / Urgent Care Clinic';
    nextSteps.push('Schedule a same-day or next-day clinic visit for blood work or throat swabs.');
    nextSteps.push('Stay hydrated with electrolyte solutions and take antipyretics as advised by your doctor.');
  } else if (hasRash && (hasMildFever || severity === 'severe')) {
    urgency = 'urgent';
    matchedRules.push('URGENT RULE: Spreading Rash with Fever or Severe Discomfort');
    urgencyTitle = 'Urgent: Consult a Physician for Skin & Systemic Check';
    headline = 'Rash paired with fever warrants in-person examination';
    explanation = 'A spreading rash accompanied by fever may represent an allergic reaction or systemic bacterial/viral infection.';
    recommendedSpecialist = 'Dermatologist / Urgent Care';
    nextSteps.push('Consult an urgent care provider or dermatologist promptly.');
  } else if (hasBreathingDifficulty || (hasWheezing && hasMildFever)) {
    urgency = 'urgent';
    matchedRules.push('URGENT RULE: Wheezing / Respiratory Strain');
    urgencyTitle = 'Urgent: Respiratory Assessment Recommended';
    headline = 'Airway constriction or broncho-spasm signs';
    explanation = 'Wheezing alongside fever suggests acute bronchitis, asthma exacerbation, or respiratory infection.';
    recommendedSpecialist = 'Pulmonologist / Urgent Care';
    nextSteps.push('Book a medical visit within 24 hours. Use rescue inhaler if prescribed.');
  } else if (totalScore >= 12 || severity === 'severe') {
    urgency = 'urgent';
    matchedRules.push('URGENT RULE: High Cumulative Symptom Burden Score');
    urgencyTitle = 'Urgent: Clinical Review Strongly Advised';
    headline = 'Moderate-to-high illness burden disrupting normal routine';
    explanation = 'Your multi-symptom profile indicates an active illness that would benefit from clinical diagnosis and targeted treatment.';
    recommendedSpecialist = 'Primary Care Physician';
    nextSteps.push('Schedule an in-person or telehealth appointment within 24 to 48 hours.');
  } 
  // ROUTINE VISIT RULES
  else if (hasPersistentCough || duration === 'more_than_1_week' || totalScore >= 6) {
    urgency = 'routine';
    matchedRules.push('ROUTINE RULE: Lingering Symptoms (> 1 week) or Moderate Score');
    urgencyTitle = 'Routine: Schedule a Standard Doctor Visit';
    headline = 'Subacute symptoms that should be checked if not improving';
    explanation = 'Symptoms lasting over a week or recurring should be reviewed by your general practitioner to rule out secondary infections or allergies.';
    recommendedSpecialist = 'Primary Care / ENT Specialist';
    nextSteps.push('Book an appointment with your primary care doctor within the next 3–5 days.');
    nextSteps.push('Keep a symptom diary tracking temperature and triggers.');
  } 
  // SELF-CARE / HOME MONITORING
  else {
    urgency = 'self_care';
    matchedRules.push('SELF-CARE RULE: Mild self-limiting symptoms without red flags');
    urgencyTitle = 'Self-Care: Rest & Home Monitoring';
    headline = 'Mild symptoms suitable for supportive home care';
    explanation = 'Your symptoms appear mild and manageable with rest, plenty of liquids, and over-the-counter remedies as appropriate.';
    recommendedSpecialist = 'General Practitioner (if worsening)';
    nextSteps.push('Get plenty of rest and drink 8-10 glasses of water or warm tea daily.');
    nextSteps.push('Use warm salt-water gargles or steam inhalation for nasal/throat relief.');
    nextSteps.push('Re-evaluate if symptoms persist past 5 days or worsen significantly.');
  }

  // Always enrich warning signs
  if (urgency !== 'emergency') {
    warningSignsToWatch.push('New onset of chest pain or blue lips/fingers');
    warningSignsToWatch.push('Inability to swallow or stiff neck');
  }

  return {
    urgency,
    urgencyTitle,
    headline,
    explanation,
    matchedRules,
    redFlagsDetected,
    recommendedSpecialist,
    nextSteps,
    warningSignsToWatch,
    timestamp: new Date().toISOString(),
    symptoms: symptomNames.length > 0 ? symptomNames : ['None selected'],
    duration: DURATION_OPTIONS.find(d => d.value === duration)?.label || duration,
    severity: SEVERITY_OPTIONS.find(s => s.value === severity)?.label || severity,
  };
}
