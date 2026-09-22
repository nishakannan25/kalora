import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LogOut, User as UserIcon, Shield, MapPin, Tag, Sparkles } from 'lucide-react';

export const DashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-heritage-cream text-heritage-dark">
      {/* Top Navigation */}
      <header className="bg-white border-b border-terracotta-100 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-terracotta-600 text-white flex items-center justify-center font-bold text-lg">
            K
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-terracotta-700">KALORA</h1>
            <p className="text-xs text-stone-500">{t('tagline')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-terracotta-50 px-3 py-1.5 rounded-full border border-terracotta-200 text-xs font-semibold text-terracotta-800">
            <Shield className="w-3.5 h-3.5 text-gold-600" />
            <span>ROLE: {user.role}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-6 sm:p-10 space-y-8">
        {/* Welcome Card */}
        <div className="bg-white border border-terracotta-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-500/10 rounded-bl-full pointer-events-none"></div>

          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-2xl shrink-0">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 text-xs font-semibold text-terracotta-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Onboarding Completed</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Namaste, {user.name}!
              </h2>
              <p className="text-stone-600 text-sm mt-1">
                Your authentication flow is verified. You are logged into KALORA as a registered <strong>{user.role}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Dossier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 text-sm uppercase tracking-wider text-terracotta-700">
              Account Credentials
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">User ID:</span>
                <span className="font-mono text-xs text-stone-800">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email / Phone:</span>
                <span className="font-medium text-stone-800">{user.email || user.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Language:</span>
                <span className="font-medium text-stone-800 uppercase">{user.preferredLanguage}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 text-sm uppercase tracking-wider text-terracotta-700">
              Artisan / Market Profile
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>Region:</span>
                </span>
                <span className="font-medium text-stone-800">{user.location || 'Pan-India'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span>Category:</span>
                </span>
                <span className="font-medium text-stone-800">{user.craftCategory || 'Craftsperson'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                  Active Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
