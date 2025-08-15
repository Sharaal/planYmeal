'use client';

import { useState, useEffect } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmationDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    setIsVisible(false);
  };

  const handleCancel = () => {
    onCancel();
    setIsVisible(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          iconBg: 'bg-red-100 text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          iconBg: 'bg-yellow-100 text-yellow-600'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
          iconBg: 'bg-blue-100 text-blue-600'
        };
    }
  };

  if (!isOpen) return null;

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancel}
        />
        
        {/* Dialog */}
        <div className={`relative transform overflow-hidden rounded-lg bg-white px-6 py-6 text-left shadow-xl transition-all sm:max-w-md sm:w-full ${
          isVisible ? 'animate-in fade-in-0 zoom-in-95 duration-200' : 'animate-out fade-out-0 zoom-out-95 duration-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variantStyles.iconBg}`}>
              <span className="text-lg">{variantStyles.icon}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onClick={handleCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantStyles.confirmButton}`}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const showConfirmation = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setDialog({
      isOpen: true,
      ...options,
    });
  };

  const hideConfirmation = () => {
    setDialog(null);
  };

  const ConfirmationDialogComponent = dialog ? (
    <ConfirmationDialog
      isOpen={dialog.isOpen}
      title={dialog.title}
      message={dialog.message}
      confirmLabel={dialog.confirmLabel}
      cancelLabel={dialog.cancelLabel}
      variant={dialog.variant}
      onConfirm={() => {
        dialog.onConfirm();
        hideConfirmation();
      }}
      onCancel={hideConfirmation}
    />
  ) : null;

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}