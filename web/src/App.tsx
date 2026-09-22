import React, { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeExperience } from './components/WelcomeExperience';
import { AuthModal } from './components/AuthModal';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { CustomerStore } from './components/CustomerStore';
import { DashboardPlaceholder } from './components/DashboardPlaceholder';
import { Store, UserCheck } from 'lucide-react';
import './index.css';

const MainContent: React.FC = () => {
  const { loading, user } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');
  
  // App onboarding flow states: 'WELCOME' | 'AUTH' | 'APP'
  const [flowState, setFlowState] = useState<'WELCOME' | 'AUTH' | 'APP'>(
    viewParam === 'onboarding' ? 'WELCOME' : 'APP'
  );
  
  const port = window.location.port;

  const envDefaultView = (import.meta as any).env?.VITE_DEFAULT_VIEW;

  const [currentView, setCurrentView] = useState<'customer' | 'artisan'>(
    envDefaultView === 'artisan' || port === '3001' || viewParam === 'artisan' || (user && user.role === 'ARTISAN' && port !== '3000')
      ? 'artisan'
      : 'customer'
  );

  React.useEffect(() => {
    if (envDefaultView === 'artisan') {
      setCurrentView('artisan');
    } else if (envDefaultView === 'customer') {
      setCurrentView('customer');
    } else if (port === '3001') {
      setCurrentView('artisan');
    } else if (viewParam === 'artisan') {
      setCurrentView('artisan');
    } else if (viewParam === 'customer') {
      setCurrentView('customer');
    } else if (user && user.role === 'ARTISAN') {
      // Direct authenticated Artisan users immediately to the Artisan Studio Dashboard
      setCurrentView('artisan');
    } else if (port === '3000' && !viewParam) {
      setCurrentView('customer');
    }
  }, [user, viewParam, port, envDefaultView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-cream flex items-center justify-center text-terracotta-700 font-serif text-xl font-bold">
        Loading KALORA...
      </div>
    );
  }

  // Initial Onboarding Flow Step 1: Welcome Language & Tagline Experience
  if (flowState === 'WELCOME') {
    return <WelcomeExperience onComplete={() => setFlowState('AUTH')} />;
  }

  // Initial Onboarding Flow Step 2: Artisan Login / OTP Registration Modal
  if (flowState === 'AUTH') {
    return (
      <AuthModal
        onSuccess={() => {
          setCurrentView('artisan');
          setFlowState('APP');
        }}
      />
    );
  }

  return (
    <div>
      <div className="bg-stone-900 text-amber-100 py-2 px-4 flex items-center justify-between border-b border-amber-900/40 text-xs font-sans z-50 relative">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold tracking-wider text-amber-200 uppercase">KALORA Platform Switcher:</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('customer')}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              currentView === 'customer'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
            }`}
          >
            🛍️ Customer Store
          </button>
          <button
            onClick={() => setCurrentView('artisan')}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              currentView === 'artisan'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
            }`}
          >
            🎨 Artisan Studio
          </button>
        </div>
      </div>
      {currentView === 'artisan' ? <ArtisanDashboard /> : <CustomerStore />}
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
