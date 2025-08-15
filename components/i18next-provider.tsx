'use client';

import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';
import { useLanguageInit } from '@/hooks/use-language-init';

function LanguageInitializer() {
  useLanguageInit();
  return null;
}

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactI18nextProvider i18n={i18n}>
      <LanguageInitializer />
      {children}
    </ReactI18nextProvider>
  );
}