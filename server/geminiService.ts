import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

export interface DoctorPrepNotes {
  questionsToAsk: string[];
  whatToBring: string[];
  symptomLogSummary: string;
  selfCareAdvice: string[];
}

export async function generateDoctorPrep(params: {
  symptoms: string[];
  duration: string;
  severity: string;
  specialty?: string;
  doctorName?: string;
  notes?: string;
}): Promise<DoctorPrepNotes> {
  const { symptoms, duration, severity, specialty = 'Primary Care', doctorName = 'Doctor', notes = '' } = params;
  
  const ai = getAiClient();

  if (ai) {
    try {
      const prompt = `You are a clinical communication assistant helping a patient prepare for their medical appointment.
Patient details:
- Symptoms: ${symptoms.join(', ') || 'General consultation'}
- Duration: ${duration}
- Severity: ${severity}
- Doctor/Specialty: ${doctorName} (${specialty})
- Patient Notes: ${notes || 'None'}

Please return a strictly valid JSON object with the following structure:
{
  "questionsToAsk": ["4-5 concise, specific, high-yield questions for the doctor"],
  "whatToBring": ["3-4 items to bring like medication list, timeline log, insurance card"],
  "symptomLogSummary": "1-2 sentence clinical summary the patient can read to the doctor",
  "selfCareAdvice": ["3 safe temporary home care tips while waiting for the visit"]
}
Do not include markdown codeblocks or backticks if possible, just the raw JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const cleaned = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        const parsed = JSON.parse(cleaned);
        return {
          questionsToAsk: parsed.questionsToAsk || [],
          whatToBring: parsed.whatToBring || [],
          symptomLogSummary: parsed.symptomLogSummary || `Symptoms of ${symptoms.join(', ')} lasting ${duration}.`,
          selfCareAdvice: parsed.selfCareAdvice || [],
        };
      }
    } catch (error) {
      console.warn('Gemini API call failed or timed out, using rule-based fallback:', error);
    }
  }

  // Fallback clinical checklist
  return {
    questionsToAsk: [
      `Could my ${symptoms.slice(0, 2).join(' and ') || 'symptoms'} be related to a viral infection, allergy, or something requiring antibiotics?`,
      'What warning symptoms should prompt me to go to an urgent care or emergency room?',
      'Are there any medications or over-the-counter supplements I should avoid right now?',
      'How long should I expect recovery to take before scheduling another follow-up?',
    ],
    whatToBring: [
      'A complete list of current medications and daily supplements with dosages',
      'A record or notes on when these symptoms started and what makes them better or worse',
      'Health insurance card and photo ID',
      'Recent lab test results or relevant vaccination records if applicable',
    ],
    symptomLogSummary: `I have been experiencing ${symptoms.join(', ') || 'symptoms'} for ${duration} at ${severity.toLowerCase()} severity.`,
    selfCareAdvice: [
      'Rest adequately and avoid strenuous physical exertion until your consultation.',
      'Maintain continuous hydration with water, herbal teas, or oral rehydration fluids.',
      'Record your body temperature morning and night to share with your provider.',
    ],
  };
}
