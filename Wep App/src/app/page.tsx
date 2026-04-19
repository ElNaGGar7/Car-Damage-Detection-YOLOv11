'use client';

import { useState, useCallback, useEffect } from 'react';
import LandingPage from '@/components/pages/LandingPage';
import AuthPage from '@/components/pages/AuthPage';
import DashboardPage from '@/components/pages/DashboardPage';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// ─── Safe default: server and client both start with 'landing' ───
function getServerSafeSession() {
  return { user: null as User | null, token: null as string | null, page: 'landing' as const };
}

export default function Home() {
  // Both server and client start with the SAME value → no hydration mismatch
  const defaultSession = getServerSafeSession();
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>(defaultSession.page);
  const [user, setUser] = useState<User | null>(defaultSession.user);
  const [token, setToken] = useState<string | null>(defaultSession.token);
  const [mounted, setMounted] = useState(false);

  // After mount (client only), check localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setCurrentPage('dashboard');
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setMounted(true);
  }, []);

  const handleLogin = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as 'landing' | 'auth' | 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}
      {currentPage === 'auth' && (
        <AuthPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {currentPage === 'dashboard' && user && token && (
        <DashboardPage user={user} token={token} onNavigate={handleNavigate} onLogout={handleLogout} />
      )}
    </>
  );
}
