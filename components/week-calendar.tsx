'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { DayCard } from './day-card';
import { useToast } from './toast-provider';
import { useTranslation } from 'react-i18next';

interface WeekCalendarProps {
  onMenuAssign?: (date: Date, menuItemId: number) => void;
  onMenuRemove?: (date: Date) => void;
}

export function WeekCalendar({ onMenuAssign, onMenuRemove }: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekPlans, setWeekPlans] = useState<Record<string, Array<{ id: number; menuItem?: any; mealType?: string }>>>({});
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Get the appropriate date-fns locale based on current language
  const getDateLocale = () => {
    return i18n.language === 'de' ? de : enUS;
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchWeekPlan();
  }, [currentWeek]);

  const fetchWeekPlan = async () => {
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const response = await fetch(`/api/week-plan?start=${weekStartStr}`);
      if (response.ok) {
        const data = await response.json();
        const plans: Record<string, Array<{ id: number; menuItem?: any; mealType?: string }>> = {};
        data.forEach((plan: { id: number; date: string; menuItem?: any; mealType?: string }) => {
          const dateKey = format(new Date(plan.date), 'yyyy-MM-dd');
          if (!plans[dateKey]) {
            plans[dateKey] = [];
          }
          plans[dateKey].push(plan);
        });
        setWeekPlans(plans);
      }
    } catch (error) {
      console.error('Failed to fetch week plan:', error);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const handleMenuAssign = async (date: Date, menuItemId: number) => {
    try {
      const response = await fetch('/api/week-plan/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          menuItemId,
        }),
      });

      if (response.ok) {
        fetchWeekPlan(); // Refresh
        onMenuAssign?.(date, menuItemId);
        showToast(t('calendar.menuAdded', { date: format(date, i18n.language === 'de' ? 'EEEE, d. MMM' : 'EEEE, MMM d', { locale: getDateLocale() }) }), 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('calendar.failedToAssign'), 'error');
      }
    } catch (error) {
      console.error('Failed to assign menu:', error);
      showToast(t('calendar.failedToAssign'), 'error');
    }
  };

  const handleMenuRemove = async (dayPlanId: number) => {
    try {
      const response = await fetch(`/api/week-plan/day-plan/${dayPlanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWeekPlan(); // Refresh
      } else {
        showToast(t('calendar.failedToRemove'), 'error');
      }
    } catch (error) {
      console.error('Failed to remove menu:', error);
      showToast(t('calendar.failedToRemove'), 'error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {t('calendar.previousWeek')}
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {t('calendar.weekOf', { date: format(weekStart, i18n.language === 'de' ? 'd. MMMM yyyy' : 'MMMM d, yyyy', { locale: getDateLocale() }) })}
        </h2>
        
        <button
          onClick={() => navigateWeek('next')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {t('calendar.nextWeek')}
        </button>
      </div>

      {/* Calendar Grid - Days in rows */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayPlans = weekPlans[dayKey] || [];
          const isToday = isSameDay(day, new Date());

          return (
            <DayCard
              key={dayKey}
              date={day}
              dayPlans={dayPlans}
              isToday={isToday}
              onMenuAssign={(menuItemId) => handleMenuAssign(day, menuItemId)}
              onMenuRemove={handleMenuRemove}
            />
          );
        })}
      </div>
    </div>
  );
}