'use client';

import { useState } from 'react';
import Link from "next/link";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from "react-i18next";
import { ShoppingListCard } from './shopping-list-card';
import { CreateShoppingListModal } from './create-shopping-list-modal';

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

interface ShoppingListsPageClientProps {
  shoppingLists: ShoppingList[];
}

export function ShoppingListsPageClient({ shoppingLists }: ShoppingListsPageClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    return i18n.language === 'de' ? de : enUS;
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('shoppingLists.title')}</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('shoppingLists.createNew')}
        </button>
      </div>
      
      {shoppingLists.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('shoppingLists.noShoppingLists')}</h2>
            <p className="text-gray-600 mb-8">
              {t('shoppingLists.createFirst')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('shoppingLists.createNew')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoppingLists.map((shoppingList) => (
            <ShoppingListCard
              key={shoppingList.id}
              shoppingList={shoppingList}
              getDateLocale={getDateLocale}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateShoppingListModal
          onClose={() => setShowCreateModal(false)}
          getDateLocale={getDateLocale}
        />
      )}
    </>
  );
}