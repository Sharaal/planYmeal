'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MenuItem } from '@prisma/client';
import { useConfirmationDialog } from './confirmation-dialog';
import { useToast } from './toast-provider';

interface DayCardProps {
  date: Date;
  dayPlans?: Array<{
    id: number;
    menuItem?: MenuItem;
    mealType?: string;
  }>;
  isToday?: boolean;
  onMenuAssign: (menuItemId: number) => void;
  onMenuRemove: (dayPlanId: number) => void;
}

export function DayCard({
  date,
  dayPlans = [],
  isToday = false,
  onMenuAssign,
  onMenuRemove,
}: DayCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const menuItemId = e.dataTransfer.getData('menuItemId');
    if (menuItemId) {
      onMenuAssign(parseInt(menuItemId, 10));
    }
  };

  const handleRemoveMenu = (dayPlanId: number, menuName?: string) => {
    showConfirmation({
      title: 'Remove Menu',
      message: `Are you sure you want to remove ${menuName ? `"${menuName}"` : 'this menu'} from ${format(date, 'EEEE, MMM d')}?`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: () => {
        onMenuRemove(dayPlanId);
        showToast(`Menu removed from ${format(date, 'EEEE, MMM d')}`, 'success');
      }
    });
  };

  return (
    <>
      {ConfirmationDialog}
      <div
      className={`
        border-2 border-dashed rounded-lg p-4 min-h-[120px] transition-all duration-200 w-full
        ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${isToday ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white'}
        hover:shadow-md
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Horizontal layout: Day info on left, menus on right */}
      <div className="flex items-start gap-6 h-full">
        {/* Day Header */}
        <div className="flex-shrink-0 w-32">
          <div className="font-semibold text-gray-900">
            {format(date, 'EEEE')}
          </div>
          <div className="text-sm text-gray-600">
            {format(date, 'MMM d')}
          </div>
          {isToday && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              Today
            </span>
          )}
        </div>

        {/* Menu Items Display */}
        <div className="flex-1">
          {dayPlans.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dayPlans.map((dayPlan) => (
                <div key={dayPlan.id} className="bg-white rounded-lg p-3 shadow-sm border flex-shrink-0 w-48">
                  <div className="flex items-start gap-2">
                    {dayPlan.menuItem?.image && (
                      <img
                        src={dayPlan.menuItem.image}
                        alt={dayPlan.menuItem.name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {dayPlan.menuItem?.name}
                      </h4>
                      {dayPlan.mealType && dayPlan.mealType !== 'main' && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                          {dayPlan.mealType}
                        </span>
                      )}
                      {dayPlan.menuItem?.rating && (
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400 text-sm">
                            {'★'.repeat(Math.floor(dayPlan.menuItem.rating))}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMenu(dayPlan.id, dayPlan.menuItem?.name)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-1 flex-shrink-0"
                      title="Remove this menu"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 text-sm h-20">
              <div>Drop menus here or nothing planned</div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}