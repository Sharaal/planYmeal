'use client';

import { useState } from 'react';
import { WeekCalendar } from './week-calendar';
import { MenuItemCard } from './menu-item';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  rating?: number | null;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarClientProps {
  menuItems: MenuItem[];
}

export function CalendarClient({ menuItems }: CalendarClientProps) {
  const [showShoppingList, setShowShoppingList] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Calendar Section */}
      <div className="flex-1">
        <WeekCalendar />
      </div>

      {/* Sidebar with Menus */}
      <div className="lg:w-80 xl:w-96">
        <div className="sticky top-24 space-y-6">
          {/* Menu Library */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 max-h-96 overflow-y-auto">
              {menuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="text-sm">{t('menus.noMenusTitle')}</p>
                  <Link
                    href="/menus/new"
                    className="text-blue-500 hover:text-blue-600 text-sm underline"
                  >
                    {t('menus.createFirst')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems.map((menuItem) => (
                    <div
                      key={menuItem.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-move hover:scale-[1.02]"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('menuItemId', menuItem.id.toString());
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      {/* Menu Image */}
                      {menuItem.image && (
                        <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={menuItem.image}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Menu Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {menuItem.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('quickActions.title')}</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="block w-full px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {t('shoppingList.generate')}
              </button>
              <Link
                href="/menus"
                className="block w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                {t('shoppingList.manageMenus')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('shoppingList.title')}</h2>
              <button
                onClick={() => setShowShoppingList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600">{t('shoppingList.functionality')}</p>
              <button
                onClick={() => setShowShoppingList(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}