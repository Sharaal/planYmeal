"use client";

import Link from "next/link";
import { useState } from "react";
import { useConfirmationDialog } from "./confirmation-dialog";
import { useToast } from "./toast-provider";

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
  rating?: number;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
}

interface MenuItemCardProps {
  menuItem: MenuItem;
  onDelete?: (id: number) => void;
  isDraggable?: boolean;
}

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating})</span>
    </div>
  );
}

export function MenuItemCard({ menuItem, onDelete, isDraggable = false }: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { showToast } = useToast();

  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable) {
      e.dataTransfer.setData('menuItemId', menuItem.id.toString());
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    showConfirmation({
      title: 'Delete Menu',
      message: `Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await onDelete(menuItem.id);
          showToast(`"${menuItem.name}" has been deleted successfully.`, 'success');
        } catch (error) {
          console.error("Error deleting menu item:", error);
          showToast(`Failed to delete "${menuItem.name}". Please try again.`, 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const cardClass = `
    block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200
    ${isDraggable ? "cursor-move hover:scale-[1.02]" : "hover:scale-[1.01]"}
    ${isDeleting ? "opacity-50 pointer-events-none" : ""}
  `;

  return (
    <>
      {ConfirmationDialog}
      <div 
        className={cardClass} 
        draggable={isDraggable}
        onDragStart={handleDragStart}
      >
      {/* Menu Image */}
      {menuItem.image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {menuItem.name}
            </h3>
            <StarRating rating={menuItem.rating} />
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <Link
              href={`/menus/${menuItem.id}/edit`}
              className="text-blue-500 hover:text-blue-600 transition-colors p-1"
              title="Edit menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
                title="Delete menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {menuItem.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {menuItem.description}
          </p>
        )}

        {menuItem.ingredients.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Ingredients ({menuItem.ingredients.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {menuItem.ingredients.slice(0, 3).map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {ingredient.amount}{ingredient.unit} {ingredient.name}
                </span>
              ))}
              {menuItem.ingredients.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{menuItem.ingredients.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default MenuItemCard;