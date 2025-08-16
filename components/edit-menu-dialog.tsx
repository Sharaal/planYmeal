'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './toast-provider';
import { useRouter } from 'next/navigation';

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

interface EditMenuDialogProps {
  initialData: RecipeData;
  onClose: () => void;
}

export function EditMenuDialog({ initialData, onClose }: EditMenuDialogProps) {
  const [recipeData, setRecipeData] = useState<RecipeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    if (!recipeData.name.trim()) {
      showToast(t('menus.nameRequired'), 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipeData.name,
          description: recipeData.description,
          image: recipeData.image,
          rating: recipeData.rating,
          ingredients: recipeData.ingredients,
        }),
      });

      if (response.ok) {
        showToast(t('menus.importSuccess'), 'success');
        onClose();
        router.refresh();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('menus.importError'), 'error');
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
      showToast(t('menus.importError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateRecipeData = (field: keyof RecipeData, value: any) => {
    setRecipeData({ ...recipeData, [field]: value });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const newIngredients = [...recipeData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipeData({ ...recipeData, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = recipeData.ingredients.filter((_, i) => i !== index);
    setRecipeData({ ...recipeData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    const newIngredients = [...recipeData.ingredients, { name: '', amount: 1, unit: 'piece' }];
    setRecipeData({ ...recipeData, ingredients: newIngredients });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{t('menus.editImportedMenu')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSaving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('menus.name')} *
            </label>
            <input
              type="text"
              value={recipeData.name}
              onChange={(e) => updateRecipeData('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isSaving}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('menus.description')}
            </label>
            <textarea
              value={recipeData.description}
              onChange={(e) => updateRecipeData('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isSaving}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('menus.imageUrl')}
            </label>
            <input
              type="url"
              value={recipeData.image || ''}
              onChange={(e) => updateRecipeData('image', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isSaving}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('menus.rating')}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={recipeData.rating || ''}
              onChange={(e) => updateRecipeData('rating', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isSaving}
            />
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                {t('menus.ingredients')}
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                disabled={isSaving}
              >
                + {t('menus.addIngredient')}
              </button>
            </div>
            <div className="space-y-2">
              {recipeData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    disabled={isSaving}
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    disabled={isSaving}
                  />
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-600 p-1"
                    disabled={isSaving}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !recipeData.name.trim()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.loading')}
              </>
            ) : (
              t('common.save')
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}