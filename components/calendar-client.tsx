'use client';

import Link from 'next/link';
import { WeekCalendar } from './week-calendar';
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

        </div>
      </div>

    </div>
  );
}