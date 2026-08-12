import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { requireAuth, optionalAuth, sanitizeUser, AuthenticatedRequest } from './server/auth';
import { evaluateSymptoms } from './src/utils/triage';
import { generateDoctorPrep } from './server/geminiService';
import { TriageEvaluationRequest } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Health check route
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================

  // Signup
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
        return;
      }

      const user = db.createUser(name, email, password);
      const session = db.createSession(user.id);

      res.cookie('session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: sanitizeUser(user),
        token: session.token,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create account.' });
    }
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const user = db.findUserByEmail(email);
      if (!user || !db.verifyPassword(user, password)) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const session = db.createSession(user.id);

      res.cookie('session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: sanitizeUser(user),
        token: session.token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Login failed unexpectedly.' });
    }
  });

  // Quick Demo Login
  app.post('/api/auth/demo', (req: Request, res: Response) => {
    try {
      const demoUser = db.findUserByEmail('demo@healthapp.local');
      if (!demoUser) {
        res.status(404).json({ success: false, error: 'Demo account not initialized.' });
        return;
      }

      const session = db.createSession(demoUser.id);

      res.cookie('session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: sanitizeUser(demoUser),
        token: session.token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Demo login failed.' });
    }
  });

  // Current User Session Check
  app.get('/api/auth/me', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.json({ success: true, user: null });
      return;
    }
    res.json({ success: true, user: sanitizeUser(req.user) });
  });

  // Logout
  app.post('/api/auth/logout', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
    if (req.token) {
      db.deleteSession(req.token);
    }
    res.clearCookie('session_token');
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // ==========================================
  // SYMPTOM CHECKER & TRIAGE ROUTES
  // ==========================================

  // Evaluate Symptoms & optionally save log
  app.post('/api/symptoms/check', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const body: TriageEvaluationRequest = req.body;
      if (!body.symptomIds || !Array.isArray(body.symptomIds)) {
        res.status(400).json({ success: false, error: 'symptomIds array is required.' });
        return;
      }

      // Execute rule-based triage
      const triageResult = evaluateSymptoms(body);

      // If user is logged in, automatically save assessment history
      let savedLogId: string | undefined;
      if (req.user && body.symptomIds.length > 0) {
        const log = db.createSymptomLog(req.user.id, {
          symptoms: body.symptomIds,
          symptomLabels: triageResult.symptoms,
          duration: triageResult.duration,
          severity: triageResult.severity,
          urgency: triageResult.urgency,
          headline: triageResult.headline,
          explanation: triageResult.explanation,
          recommendedSpecialist: triageResult.recommendedSpecialist,
        });
        savedLogId = log.id;
      }

      res.json({
        success: true,
        result: {
          ...triageResult,
          id: savedLogId,
        },
      });
    } catch (err: any) {
      console.error('Error checking symptoms:', err);
      res.status(500).json({ success: false, error: 'Failed to evaluate symptoms.' });
    }
  });

  // List user's past triage logs
  app.get('/api/symptoms/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = db.getSymptomLogs(req.user!.id);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve symptom history.' });
    }
  });

  // Delete symptom history log
  app.delete('/api/symptoms/history/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = db.deleteSymptomLog(req.user!.id, req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Log not found.' });
        return;
      }
      res.json({ success: true, message: 'Log deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to delete symptom log.' });
    }
  });

  // ==========================================
  // APPOINTMENT REMINDERS ROUTES
  // ==========================================

  // List all reminders for the authenticated user
  app.get('/api/reminders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const reminders = db.getReminders(req.user!.id);
      res.json({ success: true, reminders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch appointment reminders.' });
    }
  });

  // Create new appointment reminder
  app.post('/api/reminders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorName, specialty, date, time, location, notes, urgencySuggested, reminderNoticeHours } = req.body;
      
      if (!doctorName || !specialty || !date) {
        res.status(400).json({ success: false, error: 'Doctor name, specialty, and date are required.' });
        return;
      }

      const reminder = db.createReminder(req.user!.id, {
        doctorName,
        specialty,
        date,
        time: time || '09:00',
        location: location || 'General Clinic',
        notes: notes || '',
        urgencySuggested: urgencySuggested || 'routine',
        reminderNoticeHours: Number(reminderNoticeHours) || 24,
      });

      res.status(201).json({ success: true, reminder });
    } catch (err: any) {
      console.error('Error creating reminder:', err);
      res.status(500).json({ success: false, error: 'Failed to save appointment reminder.' });
    }
  });

  // Update existing reminder (e.g. toggle complete, edit details)
  app.patch('/api/reminders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = db.updateReminder(req.user!.id, req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Reminder not found or unauthorized.' });
        return;
      }
      res.json({ success: true, reminder: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update reminder.' });
    }
  });

  // Delete reminder
  app.delete('/api/reminders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = db.deleteReminder(req.user!.id, req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Reminder not found or unauthorized.' });
        return;
      }
      res.json({ success: true, message: 'Reminder deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to delete reminder.' });
    }
  });

  // ==========================================
  // AI DOCTOR PREP ROUTE
  // ==========================================
  app.post('/api/ai/prep-notes', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { symptoms = [], duration = '1-3 days', severity = 'Moderate', specialty, doctorName, notes } = req.body;
      const prep = await generateDoctorPrep({
        symptoms,
        duration,
        severity,
        specialty,
        doctorName,
        notes,
      });
      res.json({ success: true, prep });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to generate visit prep notes.' });
    }
  });

  // ==========================================
  // VITE DEV OR PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
