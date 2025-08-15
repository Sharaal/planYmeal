'use client';

import { useTranslation } from "react-i18next";

export function SignInContent() {
  const { t } = useTranslation();
  
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
        PlanYMeal
      </h1>
      <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto">
        {t('auth.tagline')}
      </p>
    </div>
  );
}

interface CalendarContentProps {
  userName?: string;
}

export function CalendarContent({ userName }: CalendarContentProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t('calendar.title')}
      </h1>
      <p className="text-gray-600">
        {t('calendar.subtitle')}
      </p>
    </div>
  );
}