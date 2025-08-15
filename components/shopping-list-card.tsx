'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useConfirmationDialog } from './confirmation-dialog';
import { useToast } from './toast-provider';
import { useRouter } from 'next/navigation';

interface ShoppingListItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

interface ShoppingList {
  id: number;
  startDate: Date;
  endDate: Date;
  name?: string | null;
  items: ShoppingListItem[];
  createdAt: Date;
}

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  getDateLocale: () => Locale;
}

export function ShoppingListCard({ shoppingList, getDateLocale }: ShoppingListCardProps) {
  const [items, setItems] = useState(shoppingList.items);
  const { t, i18n } = useTranslation();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { showToast } = useToast();
  const router = useRouter();

  const handleItemCheck = async (itemId: number, checked: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      });

      if (response.ok) {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, checked } : item
          )
        );
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = () => {
    showConfirmation({
      title: t('common.delete'),
      message: t('shoppingLists.deleteConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/shopping-lists/${shoppingList.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showToast(t('shoppingLists.deleteSuccess'), 'success');
            router.refresh();
          } else {
            showToast(t('shoppingLists.deleteError'), 'error');
          }
        } catch (error) {
          console.error('Failed to delete shopping list:', error);
          showToast(t('shoppingLists.deleteError'), 'error');
        }
      }
    });
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const allChecked = checkedCount === totalCount && totalCount > 0;

  return (
    <>
      {ConfirmationDialog}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {t('shoppingLists.dateRange', {
                  startDate: format(new Date(shoppingList.startDate), i18n.language === 'de' ? 'd. MMM' : 'MMM d', { locale: getDateLocale() }),
                  endDate: format(new Date(shoppingList.endDate), i18n.language === 'de' ? 'd. MMM yyyy' : 'MMM d, yyyy', { locale: getDateLocale() })
                })}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {t('shoppingLists.itemsCount', { count: totalCount })}
                </span>
                {allChecked && (
                  <span className="text-green-600 font-medium">
                    • {t('shoppingLists.allChecked')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-1 flex-shrink-0"
              title={t('common.delete')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.checked 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}
                >
                  {item.amount}{item.unit} {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="px-4 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {checkedCount} / {totalCount} {t('common.complete').toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}