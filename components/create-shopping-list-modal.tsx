'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useToast } from './toast-provider';
import { useRouter } from 'next/navigation';

interface CreateShoppingListModalProps {
  onClose: () => void;
  getDateLocale: () => Locale;
}

export function CreateShoppingListModal({ onClose, getDateLocale }: CreateShoppingListModalProps) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast(t('shoppingLists.createSuccess'), 'success');
          router.refresh();
          onClose();
        } else {
          showToast(result.error || t('shoppingLists.createError'), 'error');
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('shoppingLists.createError'), 'error');
      }
    } catch (error) {
      console.error('Failed to create shopping list:', error);
      showToast(t('shoppingLists.createError'), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('shoppingLists.createTitle')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isCreating}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-2">
                {t('shoppingLists.startDate')}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
                disabled={isCreating}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-2">
                {t('shoppingLists.endDate')}
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
                disabled={isCreating}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isCreating ? t('common.loading') : t('shoppingLists.create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t('shoppingLists.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}