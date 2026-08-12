import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        const res = await api.signup(name, email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.loginDemo();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-md w-full shadow-2xl border border-[#e5e1d8] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e1d8] bg-[#fcfbf9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#eef2ef] text-[#4a5d4e] flex items-center justify-center font-bold text-sm shadow-2xs">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-[#2d2a26]">
              {mode === 'login' ? 'Sign In to CarePulse' : 'Create a Patient Account'}
            </h3>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-2 text-[#8a8680] hover:text-[#2d2a26] hover:bg-[#f3efe8] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-6 pt-5">
          <div className="flex bg-[#f3efe8] p-1 rounded-xl border border-[#e5e1d8]">
            <button
              id="switch-login-tab-btn"
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-[#3a443d] font-bold shadow-2xs' : 'text-[#6d6a66] hover:text-[#2d2a26]'
              }`}
            >
              Sign In
            </button>
            <button
              id="switch-signup-tab-btn"
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-[#3a443d] font-bold shadow-2xs' : 'text-[#6d6a66] hover:text-[#2d2a26]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* 1-Click Demo Shortcut */}
        <div className="px-6 pt-4">
          <button
            id="modal-quick-demo-btn"
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#faf2eb] hover:bg-[#f4e6d8] border border-[#e8d5c4] rounded-2xl text-xs font-semibold text-[#8a5d33] transition-colors shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>1-Click Test as Demo Patient (Jane Doe)</span>
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e1d8]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-[#8a8680]">
              <span className="bg-white px-2">Or with email</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
          {error && (
            <div className="p-3.5 bg-[#fcf2f0] border border-[#f0d2ce] rounded-2xl text-xs text-[#7a2b22] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b84a39]" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a8680] absolute left-3 top-3" />
                <input
                  id="auth-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9.5 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8a8680] absolute left-3 top-3" />
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9.5 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6d6a66] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8a8680] absolute left-3 top-3" />
              <input
                id="auth-password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9.5 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#e5e1d8] focus:outline-none focus:ring-2 focus:ring-[#4a5d4e] bg-[#fcfbf9] focus:bg-white text-[#2d2a26]"
                required
              />
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-[#8a8680] mt-1">Minimum 6 characters</p>
            )}
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#4a5d4e] hover:bg-[#3a443d] rounded-2xl text-xs sm:text-sm font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
