'use client';

import { useState } from 'react';
import { WeekCalendar } from './week-calendar';
import { MenuItemCard } from './menu-item';
import Link from 'next/link';

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
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Menus</h2>
              <p className="text-sm text-gray-600 mt-1">
                Drag to calendar or double-click to auto-assign
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {menuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="text-sm">No menus yet</p>
                  <Link
                    href="/menus/new"
                    className="text-blue-500 hover:text-blue-600 text-sm underline"
                  >
                    Create your first menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {menuItems.map((menuItem) => (
                    <div key={menuItem.id} className="scale-90 origin-top-left">
                      <MenuItemCard
                        menuItem={{
                          ...menuItem,
                          description: menuItem.description || undefined,
                          image: menuItem.image || undefined,
                          rating: menuItem.rating || undefined,
                        }}
                        isDraggable={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="block w-full px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                🛒 Generate Shopping List
              </button>
              <Link
                href="/menus"
                className="block w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                Manage All Menus
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
              <h2 className="text-xl font-semibold">Shopping List</h2>
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
              <p className="text-gray-600">Shopping list functionality will be implemented here.</p>
              <button
                onClick={() => setShowShoppingList(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}