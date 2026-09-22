import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import ta from './ta.json';
import hi from './hi.json';

export type Language = 'en' | 'ta' | 'hi';

const translations: Record<Language, Record<string, string>> = { en, ta, hi };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kalora_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    // Dynamic Google Translate engine for complete DOM translation
    const setGoogleTranslateCookie = (lang: string) => {
      const domain = window.location.hostname;
      if (lang === 'ta') {
        document.cookie = `googtrans=/en/ta; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/ta; path=/;`;
      } else if (lang === 'hi') {
        document.cookie = `googtrans=/en/hi; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/hi; path=/;`;
      } else {
        document.cookie = `googtrans=/en/en; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/en; path=/;`;
      }
    };

    setGoogleTranslateCookie(language);

    // Inject Google Translate script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'ta,hi,en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kalora_lang', lang);
    if (lang === 'ta') {
      document.cookie = "googtrans=/en/ta; path=/;";
    } else if (lang === 'hi') {
      document.cookie = "googtrans=/en/hi; path=/;";
    } else {
      document.cookie = "googtrans=/en/en; path=/;";
    }
    window.location.reload();
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

