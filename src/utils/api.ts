import { AppointmentReminder, SymptomLog, TriageEvaluationRequest, TriageResult, User } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async getMe(): Promise<{ success: boolean; user: User | null }> {
    return fetchJson('/api/auth/me');
  },

  async login(email: string, password: string):Promise<{ success: boolean; user: User; token: string }> {
    return fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(name: string, email: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    return fetchJson('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async loginDemo(): Promise<{ success: boolean; user: User; token: string }> {
    return fetchJson('/api/auth/demo', {
      method: 'POST',
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return fetchJson('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Symptoms & Triage
  async checkSymptoms(request: TriageEvaluationRequest): Promise<{ success: boolean; result: TriageResult }> {
    return fetchJson('/api/symptoms/check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getSymptomHistory(): Promise<{ success: boolean; logs: SymptomLog[] }> {
    return fetchJson('/api/symptoms/history');
  },

  async deleteSymptomLog(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/symptoms/history/${id}`, {
      method: 'DELETE',
    });
  },

  // Appointments
  async getReminders(): Promise<{ success: boolean; reminders: AppointmentReminder[] }> {
    return fetchJson('/api/reminders');
  },

  async createReminder(reminder: Omit<AppointmentReminder, 'id' | 'userId' | 'createdAt' | 'isCompleted'>): Promise<{ success: boolean; reminder: AppointmentReminder }> {
    return fetchJson('/api/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  },

  async updateReminder(id: string, updates: Partial<AppointmentReminder>): Promise<{ success: boolean; reminder: AppointmentReminder }> {
    return fetchJson(`/api/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteReminder(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/reminders/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Visit Prep
  async generateVisitPrep(params: {
    symptoms: string[];
    duration?: string;
    severity?: string;
    specialty?: string;
    doctorName?: string;
    notes?: string;
  }): Promise<{ success: boolean; prep: { questionsToAsk: string[]; whatToBring: string[]; symptomLogSummary: string; selfCareAdvice: string[] } }> {
    return fetchJson('/api/ai/prep-notes', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
