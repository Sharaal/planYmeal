"use client";

import { useState, useEffect } from "react";

interface Ingredient {
  id?: number;
  name: string;
  amount: number;
  unit: string;
}

interface IngredientFormProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
}

const UNITS = ["g", "ml", "Stück"];

export function IngredientForm({ ingredients, onIngredientsChange }: IngredientFormProps) {
  const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(ingredients);

  useEffect(() => {
    setLocalIngredients(ingredients);
  }, [ingredients]);

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      name: "",
      amount: 0,
      unit: "g"
    };
    const updated = [...localIngredients, newIngredient];
    setLocalIngredients(updated);
    onIngredientsChange(updated);
  };

  const removeIngredient = (index: number) => {
    const updated = localIngredients.filter((_, i) => i !== index);
    setLocalIngredients(updated);
    onIngredientsChange(updated);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = localIngredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    setLocalIngredients(updated);
    onIngredientsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ingredients
        </label>
        <button
          type="button"
          onClick={addIngredient}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
        >
          + Add Ingredient
        </button>
      </div>

      {localIngredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No ingredients added yet</p>
          <button
            type="button"
            onClick={addIngredient}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add First Ingredient
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {localIngredients.map((ingredient, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg"
            >
              {/* Ingredient Name */}
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="e.g., Chicken breast"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-gray-900"
                  required
                />
              </div>

              {/* Amount */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={ingredient.amount || ""}
                  onChange={(e) => updateIngredient(index, "amount", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-gray-900"
                  required
                />
              </div>

              {/* Unit */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Unit
                </label>
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-gray-900"
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Button */}
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                  title="Remove ingredient"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IngredientForm;