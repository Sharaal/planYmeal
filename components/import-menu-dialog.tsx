'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './toast-provider';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface RecipeData {
  name: string;
  description: string;
  image: string | null;
  rating: number | null;
  ingredients: Ingredient[];
}

interface ImportMenuDialogProps {
  onClose: () => void;
  onImportSuccess: (recipeData: RecipeData) => void;
}

export function ImportMenuDialog({ onClose, onImportSuccess }: ImportMenuDialogProps) {
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      showToast(t('menus.invalidUrl'), 'error');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      showToast(t('menus.invalidUrl'), 'error');
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/menus/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.recipeData) {
          // Close this dialog and pass data to parent
          onClose();
          onImportSuccess(result.recipeData);
        } else {
          showToast(t('menus.importError'), 'error');
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('menus.importError'), 'error');
      }
    } catch (error) {
      console.error('Failed to import menu:', error);
      showToast(t('menus.importError'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('menus.importFromUrl')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isImporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-900 mb-2">
              {t('menus.enterUrl')}
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('menus.urlPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              required
              disabled={isImporting}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isImporting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {t('menus.import')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}