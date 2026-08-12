import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface DbSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface DbReminder {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  notes?: string;
  urgencySuggested?: 'emergency' | 'urgent' | 'routine' | 'self_care';
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  reminderNoticeHours?: number;
}

export interface DbSymptomLog {
  id: string;
  userId: string;
  symptoms: string[];
  symptomLabels: string[];
  duration: string;
  severity: string;
  urgency: 'emergency' | 'urgent' | 'routine' | 'self_care';
  headline: string;
  explanation: string;
  recommendedSpecialist: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  sessions: DbSession[];
  reminders: DbReminder[];
  symptomLogs: DbSymptomLog[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'health_db.json');

class JsonDatabase {
  private data: DatabaseSchema = {
    users: [],
    sessions: [],
    reminders: [],
    symptomLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, recreating fresh store:', err);
      this.seedInitialData();
      this.save();
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  private seedInitialData() {
    const demoSalt = crypto.randomBytes(16).toString('hex');
    const demoPasswordHash = this.hashPassword('password123', demoSalt);
    const demoUserId = 'user_demo_jane';

    const demoUser: DbUser = {
      id: demoUserId,
      name: 'Jane Doe',
      email: 'demo@healthapp.local',
      passwordHash: demoPasswordHash,
      salt: demoSalt,
      createdAt: new Date().toISOString(),
    };

    // Today & future sample appointment dates
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 5);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 10);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const demoReminders: DbReminder[] = [
      {
        id: 'rem_1',
        userId: demoUserId,
        doctorName: 'Dr. Sarah Jenkins, MD',
        specialty: 'General Practitioner / Primary Care',
        date: tomorrowStr,
        time: '10:30',
        location: 'Cedar Health Clinic, Suite 402',
        notes: 'Follow-up on recent seasonal fatigue, review annual lab blood panel.',
        urgencySuggested: 'routine',
        isCompleted: false,
        reminderNoticeHours: 24,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rem_2',
        userId: demoUserId,
        doctorName: 'Dr. Robert Chen, MD',
        specialty: 'Cardiologist',
        date: nextWeekStr,
        time: '14:00',
        location: 'Metro Heart Institute & Imaging (Room 12B)',
        notes: 'Routine resting ECG checkup & blood pressure management.',
        urgencySuggested: 'routine',
        isCompleted: false,
        reminderNoticeHours: 48,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'rem_3',
        userId: demoUserId,
        doctorName: 'Dr. Elena Rostova, DDS',
        specialty: 'General Dentistry',
        date: pastDateStr,
        time: '09:00',
        location: 'Downtown Dental Studio',
        notes: 'Routine 6-month cleaning and preventive fluoride check.',
        urgencySuggested: 'self_care',
        isCompleted: true,
        completedAt: new Date(Date.now() - 864000000).toISOString(),
        reminderNoticeHours: 24,
        createdAt: new Date(Date.now() - 1000000000).toISOString(),
      },
    ];

    const demoSymptomLogs: DbSymptomLog[] = [
      {
        id: 'log_1',
        userId: demoUserId,
        symptoms: ['sore_throat', 'runny_stuffy_nose', 'mild_fever_chills'],
        symptomLabels: ['Sore or Scratchy Throat', 'Runny or Stuffy Nose / Congestion', 'Low-Grade Fever / Chills (99.5 - 101°F)'],
        duration: '1 – 3 Days',
        severity: 'Mild (Noticeable but does not disrupt daily tasks)',
        urgency: 'self_care',
        headline: 'Mild symptoms consistent with common viral or minor illness',
        explanation: 'Your selected symptoms do not indicate acute critical warning signs. Prioritize rest, hydration, and monitoring over the next 24-48 hours.',
        recommendedSpecialist: 'General Practitioner (if worsening)',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    this.data = {
      users: [demoUser],
      sessions: [],
      reminders: demoReminders,
      symptomLogs: demoSymptomLogs,
    };
  }

  private save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // --- USER METHODS ---
  createUser(name: string, email: string, passwordPlain: string): DbUser {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(passwordPlain, salt);
    const user: DbUser = {
      id: `usr_${crypto.randomUUID()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(user);
    this.save();
    return user;
  }

  findUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserById(id: string): DbUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  verifyPassword(user: DbUser, passwordPlain: string): boolean {
    const computed = this.hashPassword(passwordPlain, user.salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(user.passwordHash, 'hex'));
  }

  // --- SESSIONS ---
  createSession(userId: string): DbSession {
    const token = crypto.randomBytes(32).toString('hex');
    // Session valid for 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const session: DbSession = {
      id: `sess_${crypto.randomUUID()}`,
      token,
      userId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    // Clean expired sessions
    this.data.sessions = this.data.sessions.filter(s => new Date(s.expiresAt) > new Date());
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  findSession(token: string): DbSession | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) <= new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // --- REMINDERS ---
  getReminders(userId: string): DbReminder[] {
    return this.data.reminders
      .filter(r => r.userId === userId)
      .sort((a, b) => {
        // Sort upcoming first by date and time
        const dateA = `${a.date}T${a.time || '00:00'}`;
        const dateB = `${b.date}T${b.time || '00:00'}`;
        return dateA.localeCompare(dateB);
      });
  }

  createReminder(userId: string, data: Omit<DbReminder, 'id' | 'userId' | 'createdAt' | 'isCompleted'>): DbReminder {
    const reminder: DbReminder = {
      id: `rem_${crypto.randomUUID()}`,
      userId,
      doctorName: data.doctorName.trim(),
      specialty: data.specialty.trim(),
      date: data.date,
      time: data.time || '09:00',
      location: data.location?.trim() || 'Clinic / Telehealth',
      notes: data.notes?.trim() || '',
      urgencySuggested: data.urgencySuggested || 'routine',
      isCompleted: false,
      reminderNoticeHours: data.reminderNoticeHours ?? 24,
      createdAt: new Date().toISOString(),
    };

    this.data.reminders.push(reminder);
    this.save();
    return reminder;
  }

  updateReminder(userId: string, reminderId: string, updates: Partial<DbReminder>): DbReminder | null {
    const idx = this.data.reminders.findIndex(r => r.id === reminderId && r.userId === userId);
    if (idx === -1) return null;

    const current = this.data.reminders[idx];
    const updated: DbReminder = {
      ...current,
      ...updates,
      id: current.id,
      userId: current.userId,
      createdAt: current.createdAt,
    };

    if (updates.isCompleted && !current.isCompleted && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    } else if (updates.isCompleted === false) {
      updated.completedAt = undefined;
    }

    this.data.reminders[idx] = updated;
    this.save();
    return updated;
  }

  deleteReminder(userId: string, reminderId: string): boolean {
    const initialLen = this.data.reminders.length;
    this.data.reminders = this.data.reminders.filter(r => !(r.id === reminderId && r.userId === userId));
    const deleted = this.data.reminders.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- SYMPTOM LOGS ---
  getSymptomLogs(userId: string): DbSymptomLog[] {
    return this.data.symptomLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createSymptomLog(userId: string, logData: Omit<DbSymptomLog, 'id' | 'userId' | 'createdAt'>): DbSymptomLog {
    const log: DbSymptomLog = {
      id: `log_${crypto.randomUUID()}`,
      userId,
      ...logData,
      createdAt: new Date().toISOString(),
    };

    this.data.symptomLogs.unshift(log);
    // Keep max 50 logs per user
    const userLogs = this.data.symptomLogs.filter(l => l.userId === userId);
    if (userLogs.length > 50) {
      const oldestToPrune = userLogs.slice(50).map(l => l.id);
      this.data.symptomLogs = this.data.symptomLogs.filter(l => !oldestToPrune.includes(l.id));
    }

    this.save();
    return log;
  }

  deleteSymptomLog(userId: string, logId: string): boolean {
    const initialLen = this.data.symptomLogs.length;
    this.data.symptomLogs = this.data.symptomLogs.filter(l => !(l.id === logId && l.userId === userId));
    const deleted = this.data.symptomLogs.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

export const db = new JsonDatabase();
