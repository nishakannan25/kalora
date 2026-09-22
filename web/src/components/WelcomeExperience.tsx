import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '../i18n/LanguageContext';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';

interface WelcomeExperienceProps {
  onComplete: () => void;
}

const slides = [
  { lang: 'en', code: 'EN', title: 'English', text: 'Your Craft. Your Story. Your Market.' },
  { lang: 'ta', code: 'TA', title: 'தமிழ்', text: 'உங்கள் கைவினை. உங்கள் கதை. உங்கள் சந்தை.' },
  { lang: 'hi', code: 'HI', title: 'हिंदी', text: 'आपकी कला। आपकी कहानी। आपका बाज़ार।' },
];

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ onComplete }) => {
  const { language, setLanguage, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-heritage-cream text-heritage-dark flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Subtle Heritage Motif Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#c2410c_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Top Bar / Language Selector */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-terracotta-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            K
          </div>
          <span className="font-serif text-2xl font-bold text-terracotta-700 tracking-wide">KALORA</span>
        </div>

        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-terracotta-100 shadow-sm">
          <Globe className="w-4 h-4 text-terracotta-600" />
          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{t('choose_language')}:</span>
          <div className="flex space-x-1">
            {slides.map((s) => (
              <button
                key={s.lang}
                onClick={() => handleLanguageSelect(s.lang as Language)}
                className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                  language === s.lang
                    ? 'bg-terracotta-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Welcome Slide */}
      <div className="my-auto text-center max-w-2xl mx-auto z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-4 py-1.5 rounded-full text-sm font-medium shadow-xs">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <span>{t('welcome_title')}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-900 leading-tight">
          {t('app_name')}
        </h1>

        {/* Carousel Slide Tagline */}
        <div className="h-24 flex items-center justify-center">
          <p key={currentSlide} className="text-xl sm:text-2xl font-serif text-terracotta-700 italic animate-fade-in px-4">
            "{slides[currentSlide].text}"
          </p>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-terracotta-600' : 'w-2 bg-stone-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center z-10 max-w-2xl mx-auto w-full pt-6">
        <button
          onClick={onComplete}
          className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors px-4 py-2"
        >
          {t('skip')}
        </button>
        <button
          onClick={onComplete}
          className="inline-flex items-center space-x-2 bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <span>{t('continue')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
