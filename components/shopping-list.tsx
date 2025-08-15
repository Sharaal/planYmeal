'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ShoppingListItem } from './shopping-list-item';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface ShoppingListProps {
  weekStart?: Date;
  onClose?: () => void;
}

export function ShoppingList({ weekStart = new Date(), onClose }: ShoppingListProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const week = startOfWeek(weekStart, { weekStartsOn: 1 });
  const weekEnd = addDays(week, 6);

  useEffect(() => {
    generateShoppingList();
  }, [weekStart]);

  const generateShoppingList = async () => {
    try {
      setIsLoading(true);
      const weekStartStr = format(week, 'yyyy-MM-dd');
      const response = await fetch(`/api/shopping-list/generate?start=${weekStartStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      } else {
        console.error('Failed to generate shopping list');
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (ingredientKey: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(ingredientKey)) {
      newCheckedItems.delete(ingredientKey);
    } else {
      newCheckedItems.add(ingredientKey);
    }
    setCheckedItems(newCheckedItems);
  };

  const saveShoppingList = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.map(ingredient => ({
            ...ingredient,
            checked: checkedItems.has(`${ingredient.name}-${ingredient.unit}`),
          })),
          weekStart: format(week, 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        console.log('Shopping list saved successfully');
      } else {
        console.error('Failed to save shopping list');
      }
    } catch (error) {
      console.error('Error saving shopping list:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredIngredients = hideCompleted
    ? ingredients.filter(ingredient => !checkedItems.has(`${ingredient.name}-${ingredient.unit}`))
    : ingredients;

  const completedCount = ingredients.filter(ingredient => 
    checkedItems.has(`${ingredient.name}-${ingredient.unit}`)
  ).length;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Generating shopping list...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shopping List</h2>
            <p className="text-sm text-gray-600">
              Week of {format(week, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats and Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {completedCount} of {ingredients.length} items checked
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Hide completed
            </label>
            <button
              onClick={saveShoppingList}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm"
            >
              {isSaving ? 'Saving...' : 'Save List'}
            </button>
          </div>
        </div>
      </div>

      {/* Shopping List Items */}
      <div className="p-6">
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {ingredients.length === 0 ? (
              <div>
                <div className="text-4xl mb-2">🛒</div>
                <p>No ingredients found for this week.</p>
                <p className="text-sm mt-1">Plan some menus to generate a shopping list!</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p>All items completed!</p>
                <p className="text-sm mt-1">Uncheck "Hide completed" to see all items.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIngredients.map((ingredient, index) => {
              const ingredientKey = `${ingredient.name}-${ingredient.unit}`;
              return (
                <ShoppingListItem
                  key={`${ingredientKey}-${index}`}
                  ingredient={ingredient}
                  checked={checkedItems.has(ingredientKey)}
                  onToggle={() => toggleIngredient(ingredientKey)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {ingredients.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Progress: {Math.round((completedCount / ingredients.length) * 100)}%
            </span>
            <span>
              {ingredients.length} total items
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / ingredients.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}