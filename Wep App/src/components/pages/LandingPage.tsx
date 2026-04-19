'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import {
  Car, Zap, Target, DollarSign, Shield, BarChart3, Star,
  Camera, Calculator, CheckCircle, ChevronLeft, ChevronRight,
  ArrowRight, Users, Award, Clock, Menu, X, Globe, Play, Volume2, VolumeX
} from 'lucide-react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { useLang } from '@/contexts/LanguageContext';

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, lang, isRTL, toggleLang } = useLang();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const featuresData = [
    { icon: Zap, titleKey: 'feature4Title', descKey: 'feature4Desc', color: '#14B8A6' },
    { icon: Target, titleKey: 'feature1Title', descKey: 'feature1Desc', color: '#0EA5E9' },
    { icon: DollarSign, titleKey: 'feature2Title', descKey: 'feature2Desc', color: '#F59E0B' },
    { icon: Shield, titleKey: 'feature5Title', descKey: 'feature5Desc', color: '#14B8A6' },
    { icon: BarChart3, titleKey: 'feature3Title', descKey: 'feature3Desc', color: '#0EA5E9' },
    { icon: Car, titleKey: 'feature6Title', descKey: 'feature6Desc', color: '#F59E0B' },
  ];

  const stepsData = [
    { num: '01', titleKey: 'step1Title', descKey: 'step1Desc', icon: Camera },
    { num: '02', titleKey: 'step2Title', descKey: 'step2Desc', icon: Calculator },
    { num: '03', titleKey: 'step3Title', descKey: 'step3Desc', icon: BarChart3 },
  ];

  const statsData = [
    { value: '10,000+', labelKey: 'statsCars', icon: Car, subKey: 'statsBrands' },
    { value: '98%', labelKey: 'statsAccuracy', icon: Target, subKey: 'statsReliable' },
    { value: '30%', labelKey: 'statsSavings', icon: DollarSign, subKey: 'statsThanNormal' },
    { value: '4.9', labelKey: 'statsRating', icon: Star, subKey: 'statsFromUsers' },
  ];

  const navLinksData = [
    { labelKey: 'features', href: '#features' },
    { labelKey: 'howItWorks', href: '#how-it-works' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-cairo), Cairo, sans-serif' }}>
      <AnimatedBackground />

      {/* ===== Navbar ===== */}
      <nav className="relative z-50 glass mx-4 md:mx-8 mt-4 rounded-xl px-5 md:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
            <Car className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gradient">AutoCost</h1>
        </div>

        <div className="hidden md:flex gap-8 text-sm">
          {navLinksData.map((link) => (
            <a key={link.labelKey} href={link.href}
              className="text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors duration-200 cursor-pointer">
              {t(link.labelKey)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button onClick={toggleLang}
            className="w-8 h-8 rounded-lg flex items-center justify-center glass-subtle transition-all hover:scale-105 cursor-pointer"
            title={t('language')}>
            <Globe className="w-4 h-4 text-[var(--primary-light)]" />
          </button>
          <button onClick={() => onNavigate('auth')}
            className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm hidden md:block">
            {t('login')}
          </button>
          <button onClick={() => onNavigate('auth')}
            className="btn-primary px-5 py-2.5 text-sm hidden md:flex items-center gap-2">
            {t('heroCta')}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center glass-subtle">
            {mobileMenuOpen ? <X className="w-5 h-5 text-[var(--text-secondary)]" /> : <Menu className="w-5 h-5 text-[var(--text-secondary)]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="relative z-40 mx-4 mt-2 rounded-xl glass p-4 md:hidden" style={{ animation: 'scaleIn 0.25s ease-out' }}>
          {navLinksData.map((link) => (
            <a key={link.labelKey} href={link.href} onClick={() => setMobileMenuOpen(false)}
              className="block py-3 px-4 text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors rounded-lg text-sm">
              {t(link.labelKey)}
            </a>
          ))}
          <button onClick={() => { setMobileMenuOpen(false); onNavigate('auth'); }}
            className="btn-primary w-full mt-2 py-3 text-sm">
            {t('heroCta')}
          </button>
        </div>
      )}

      {/* ===== Hero Section ===== */}
      <section className="relative z-10 px-6 md:px-10 lg:px-20 mt-16 lg:mt-24 min-h-[75vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          <div style={{ animation: isRTL ? 'slideInRight 0.7s ease-out' : 'slideInLeft 0.7s ease-out' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 glass-subtle text-[var(--primary-light)]">
              <Zap className="w-4 h-4" />
              <span>{t('appTagline')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black leading-[1.15] mb-6">
              {t('heroTitle').split(' ').slice(0, -1).join(' ')}<br />
              <span className="text-gradient">{t('heroTitle').split(' ').slice(-1).join(' ')}</span>
            </h1>

            <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <button onClick={() => onNavigate('auth')} className="btn-primary px-8 py-4 text-base items-center gap-2">
                {t('heroCta')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#how-it-works" className="btn-outline px-8 py-4 text-base items-center gap-2">
                {t('heroSecondaryCta')}
                <Arrow className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>{t('trustFree')}</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>{t('trustNoAccount')}</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>{t('trustInstant')}</span></div>
            </div>

            <div className="mt-10 flex items-center gap-4 pt-8 border-t border-[var(--border-subtle)]">
              <div className="flex -space-x-3 space-x-reverse">
                {[Users, Car, Award].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--bg-deep)] flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, rgba(20, 184, 166, ${0.2 + i * 0.12}), rgba(14, 165, 233, ${0.15 + i * 0.08}))` }}>
                    <Icon className="w-4 h-4 text-teal-300" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-white">+10,000 {t('trustUsers')}</div>
                <div className="text-xs text-[var(--text-dim)]">{t('trustDesc')}</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden lg:block" style={{ animation: isRTL ? 'slideInLeft 0.7s ease-out' : 'slideInRight 0.7s ease-out' }}>
            <div className="relative">
              <div className="w-full h-[480px] rounded-3xl overflow-hidden border border-[var(--border-light)] relative">
                <Image src="/images/hero-car.png" alt="AutoCost" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--bg-deep)] opacity-20" />
              </div>
              <div className="absolute -bottom-4 rtl:-left-4 ltr:-right-4 w-72 rounded-xl glass p-5" style={{ animation: 'floatSlow 5s ease-in-out infinite' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-[var(--primary-light)]" />
                  <span className="text-[var(--text-secondary)] text-sm">{t('estimatedCost')}</span>
                </div>
                <div className="text-3xl font-black text-gradient">4,500 {t('egp')}</div>
                <div className="text-[var(--text-secondary)] text-sm mt-1">Toyota Camry 2023 - {t('bumper')}</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge badge-success">{t('completed')}</span>
                  <span className="badge badge-info">2 {t('damages')}</span>
                </div>
              </div>
              <div className="absolute -top-4 rtl:-right-4 ltr:-left-4 w-56 rounded-xl glass p-4" style={{ animation: 'floatSlow 6s ease-in-out infinite 1.5s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-[var(--text-secondary)] text-xs">{t('analysisResult')}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">3 {t('damages')}</div>
                <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-teal-400 to-emerald-400" style={{ width: '100%' }} />
                </div>
                <div className="text-[10px] text-[var(--text-dim)] mt-1">{t('success')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Video Trailer Section ===== */}
      <section className="relative z-10 px-6 md:px-10 lg:px-20 mt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-5 glass-subtle text-[var(--primary-light)]">
            <Play className="w-4 h-4" />
            <span>{t('watchTrailer')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('videoTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">{t('videoDesc')}</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ border: '1px solid var(--border-subtle)' }}>
          {/* Video Element */}
          <video
            ref={videoRef}
            src="/videos/trailer.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            muted={videoMuted}
            loop
            controls={videoPlaying}
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            poster="/images/hero-car.png"
          />

          {/* Play Overlay (before playing) */}
          {!videoPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity"
              onClick={() => { videoRef.current?.play(); }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5E9)', boxShadow: '0 8px 40px rgba(20, 184, 166, 0.5)' }}>
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white" style={{ marginRight: isRTL ? '0' : '-4px', marginLeft: isRTL ? '-4px' : '0' }} />
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setVideoMuted(!videoMuted); }}
              className="w-9 h-9 rounded-full glass-subtle flex items-center justify-center transition-all hover:scale-105"
              title={videoMuted ? t('unmuteVideo') : t('muteVideo')}
            >
              {videoMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* AutoCost watermark */}
          <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none">
            <Car className="w-4 h-4 text-[var(--primary-light)]" />
            <span className="text-white text-xs font-bold">AutoCost AI</span>
          </div>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="relative z-10 px-6 md:px-10 lg:px-20 mt-20">
        <div className="rounded-xl glass-subtle p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsData.map((s) => (
              <div key={s.labelKey} className="text-center flex flex-col items-center">
                <s.icon className="w-7 h-7 text-[var(--primary-light)] mb-3" />
                <div className="text-2xl md:text-3xl font-black text-gradient">{s.value}</div>
                <div className="text-[var(--text-secondary)] text-sm mt-1 font-semibold">{t(s.labelKey)}</div>
                <div className="text-[var(--text-secondary)] text-xs mt-0.5">{t(s.subKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="relative z-10 px-6 md:px-10 lg:px-20 mt-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('whyAutoCost')} <span className="text-gradient">AutoCost</span>?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">{t('featuresDesc')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuresData.map((f) => (
            <div key={f.titleKey} className="feature-card group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-bold mb-2">{t(f.titleKey)}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-10 lg:px-20 mt-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('howItWorks')} <span className="text-gradient">{t('howItWorksEnd')}</span>?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">{t('howItWorksDesc')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {stepsData.map((s, i) => (
            <div key={s.num} className="text-center relative feature-card group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5E9)', boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)' }}>
                <s.icon className="w-9 h-9 text-white" />
              </div>
              <div className="text-gradient-gold text-2xl font-black mb-3">{s.num}</div>
              <h3 className="text-xl font-bold mb-3 text-white">{t(s.titleKey)}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs mx-auto">{t(s.descKey)}</p>
              {i < stepsData.length - 1 && (
                <div className={`hidden md:flex absolute top-10 ${isRTL ? '-right-4' : '-left-4'} w-8 items-center justify-center`}>
                  <ChevronLeft className={`w-6 h-6 text-[var(--accent-gold)] ${!isRTL ? 'rotate-180' : ''}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative z-10 px-6 md:px-10 lg:px-20 mt-24 mb-20">
        <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center">
          <Image src="/images/analysis-report.png" alt="AutoCost" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--bg-deep)] via-[var(--bg-deep)]/90 to-[var(--bg-deep)]" />
          <div className="relative z-10 p-8 md:p-14 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              {t('ctaTitle')} <span className="text-gradient">{t('ctaHighlight')}</span>?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8">{t('ctaDesc')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => onNavigate('auth')} className="btn-primary px-10 py-4 text-base items-center gap-2">
                {t('heroCta')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#how-it-works" className="btn-outline px-10 py-4 text-base text-[var(--text-secondary)] border-[var(--border-light)] hover:text-white items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('learnMore')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="relative z-10 mt-auto border-t border-[var(--border-subtle)]" style={{ background: 'rgba(11, 17, 32, 0.9)' }}>
        <div className="px-6 md:px-10 lg:px-20 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-gradient font-bold text-lg">AutoCost</span>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{t('footerDesc')}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[var(--text-primary)]">{t('quickLinks')}</h4>
              <div className="space-y-2.5">
                {navLinksData.map((item) => (
                  <a key={item.labelKey} href={item.href}
                    className="block text-[var(--text-muted)] text-sm hover:text-[var(--primary-light)] transition-colors cursor-pointer">
                    {t(item.labelKey)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[var(--text-dim)] text-xs">&copy; 2024 AutoCost. {t('footerRights')}</div>
            <div className="flex items-center gap-4 text-[var(--text-dim)] text-xs">
              <span className="hover:text-[var(--primary-light)] transition-colors cursor-pointer">{t('privacyPolicyPage')}</span>
              <span className="hover:text-[var(--primary-light)] transition-colors cursor-pointer">{t('termsOfService')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
