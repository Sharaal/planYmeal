"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IngredientForm from "./ingredient-form";
import RatingStars from "./rating-stars";

interface Ingredient {
  id?: number;
  name: string;
  amount: number;
  unit: string;
}

interface MenuItem {
  id?: number;
  name: string;
  description?: string;
  image?: string;
  rating?: number;
  ingredients: Ingredient[];
}

interface MenuFormProps {
  menuItem?: MenuItem;
  onSubmit?: (menuItem: MenuItem) => void;
  isLoading?: boolean;
}

export function MenuForm({ menuItem, onSubmit, isLoading = false }: MenuFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<MenuItem>({
    name: "",
    description: "",
    image: "",
    rating: 0,
    ingredients: [],
    ...menuItem,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menuItem) {
      setFormData({ ...menuItem });
    }
  }, [menuItem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Menu name is required";
    }

    if (formData.ingredients.some(ing => !ing.name.trim())) {
      newErrors.ingredients = "All ingredients must have a name";
    }

    if (formData.ingredients.some(ing => ing.amount <= 0)) {
      newErrors.ingredients = "All ingredients must have a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (onSubmit) {
      await onSubmit(formData);
    } else {
      // Default API call
      try {
        const url = menuItem?.id 
          ? `/api/menu-items/${menuItem.id}` 
          : "/api/menu-items";
        
        const method = menuItem?.id ? "PUT" : "POST";
        
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to save menu item");
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Error saving menu item:", error);
        setErrors({ submit: "Failed to save menu item. Please try again." });
      }
    }
  };

  const handleInputChange = (field: keyof MenuItem, value: string | number | Ingredient[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {menuItem?.id ? "Edit Menu" : "Create New Menu"}
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Menu Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Spaghetti Carbonara"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
                required
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={formData.image || ""}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your menu item..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none text-gray-900"
              disabled={isLoading}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating
            </label>
            <RatingStars
              rating={formData.rating || 0}
              onRatingChange={(rating) => handleInputChange("rating", rating)}
              readonly={isLoading}
            />
          </div>

          {/* Ingredients */}
          <div>
            <IngredientForm
              ingredients={formData.ingredients}
              onIngredientsChange={(ingredients) => handleInputChange("ingredients", ingredients)}
            />
            {errors.ingredients && (
              <p className="text-red-500 text-sm mt-2">{errors.ingredients}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Saving..." : menuItem?.id ? "Update Menu" : "Create Menu"}
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default MenuForm;