'use client';

import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactI18nextProvider i18n={i18n}>
      {children}
    </ReactI18nextProvider>
  );
}