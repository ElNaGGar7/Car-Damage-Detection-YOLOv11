'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Car, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Zap, Target, Shield, CheckCircle, ChevronRight } from 'lucide-react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { useLang } from '@/contexts/LanguageContext';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onLogin: (user: { id: string; name: string; email: string; phone?: string; avatar?: string }, token: string) => void;
}

export default function AuthPage({ onNavigate, onLogin }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t, lang, isRTL } = useLang();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
      onNavigate('dashboard');
    } catch { setError(t('connectionError')); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError(t('passwordMismatch')); return; }
    if (formData.password.length < 6) { setError(t('passwordTooShort')); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
      onNavigate('dashboard');
    } catch { setError(t('connectionError')); } finally { setLoading(false); }
  };

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { width: '20%', color: '#ef4444', text: t('weak') };
    if (pwd.length < 10) return { width: '60%', color: '#F59E0B', text: t('medium') };
    return { width: '100%', color: '#22c55e', text: t('severe') };
  };

  const strength = getPasswordStrength(formData.password);
  const loginTabCls = activeTab === 'login' ? 'tab-active' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5';
  const registerTabCls = activeTab === 'register' ? 'tab-active' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5';
  const BackArrow = isRTL ? ArrowRight : ChevronRight;

  const sideFeatures = [
    { icon: Zap, titleKey: 'feature4Title', descKey: 'feature4Desc' },
    { icon: Target, titleKey: 'feature1Title', descKey: 'feature1Desc' },
    { icon: Shield, titleKey: 'feature5Title', descKey: 'feature5Desc' },
  ];

  return (
    <div className="relative min-h-screen flex" style={{ fontFamily: 'var(--font-cairo), Cairo, sans-serif' }}>
      <AnimatedBackground />

      {/* Right Panel - Visual (desktop) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <Image src="/images/auth-visual.png" alt="AutoCost" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0B1120CC] to-[#0B1120EE]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-3 glass px-4 py-3 rounded-xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AutoCost</h1>
              <p className="text-[var(--text-dim)] text-[10px]">{t('appTagline')}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-16 right-12 left-12 space-y-3">
          {sideFeatures.map((f) => (
            <div key={f.titleKey} className="glass rounded-xl p-4 flex items-center gap-4 hover:translate-x-[-8px] transition-all cursor-default">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">{t(f.titleKey)}</div>
                <div className="text-[var(--text-secondary)] text-xs">{t(f.descKey)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-1/3 left-12 glass rounded-xl p-4 text-center" style={{ animation: 'floatSlow 5s ease-in-out infinite' }}>
          <div className="text-2xl font-black text-gradient">10,000+</div>
          <div className="text-[var(--text-secondary)] text-xs">{t('statsCars')}</div>
        </div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">AutoCost</h1>
              <p className="text-[var(--text-dim)] text-xs">{t('appTagline')}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {activeTab === 'login' ? t('welcomeBack') : t('createNewAccount')}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {activeTab === 'login' ? t('loginDesc') : t('registerDesc')}
            </p>
          </div>

          <div className="rounded-xl p-7 md:p-9 relative overflow-hidden card-static">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan), var(--accent-gold))' }} />

            <div className="flex rounded-xl p-1 mb-7" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
              <button onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm ${loginTabCls}`}>
                {t('login')}
              </button>
              <button onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all text-sm ${registerTabCls}`}>
                {t('register')}
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.35s ease' }}>
                <div className="mb-5">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="example@email.com" className="input-field pr-12" required dir="ltr" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={handleChange} placeholder={t('enterPassword')}
                      className="input-field pr-12 pl-12" required dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-teal-500" />
                    <span className="text-[var(--text-muted)] text-sm">{t('rememberMe')}</span>
                  </label>
                  <button type="button" className="text-[var(--primary-light)] text-sm font-semibold hover:text-[var(--primary)]">{t('forgotPassword')}</button>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                  {loading ? <span className="spinner" /> : t('signIn')}
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.35s ease' }}>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('fullName')}</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="name" type="text" value={formData.name} onChange={handleChange}
                      placeholder={t('enterFullName')} className="input-field pr-12" required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="example@email.com" className="input-field pr-12" required dir="ltr" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('phone')}</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                      placeholder="01XXXXXXXXX" className="input-field pr-12" dir="ltr" required minLength={11} maxLength={11} pattern="01[0-9]{9}" />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={handleChange} placeholder={t('createStrongPassword')}
                      className="input-field pr-12 pl-12" required dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <span className="text-xs mt-1 block" style={{ color: strength.color }}>{strength.text}</span>
                    </div>
                  )}
                </div>
                <div className="mb-5">
                  <label className="block mb-2 font-semibold text-[var(--text-secondary)] text-sm">{t('confirmPasswordLabel')}</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
                      placeholder={t('reEnterPassword')} className="input-field pr-12" required dir="ltr" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                  {loading ? <span className="spinner" /> : t('signUp')}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center text-xs text-[var(--text-dim)]">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{t('trustFree')}</span>
            </div>
          </div>

          <button onClick={() => onNavigate('landing')}
            className="mt-4 text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors text-sm flex items-center gap-1 mx-auto">
            <BackArrow className="w-4 h-4" />
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
