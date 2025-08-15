'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguageInit() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run on client side after hydration
    const savedLanguage = localStorage.getItem('i18nextLng');
    const browserLanguage = navigator.language.startsWith('de') ? 'de' : 'en';
    const targetLanguage = savedLanguage || browserLanguage;

    if (targetLanguage !== i18n.language) {
      i18n.changeLanguage(targetLanguage);
    }
  }, [i18n]);
}