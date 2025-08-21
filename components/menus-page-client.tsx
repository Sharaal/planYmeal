'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { MenuList } from "@/components/menu-list";
import { ImportMenuDialog } from "./import-menu-dialog";
import { EditMenuDialog } from "./edit-menu-dialog";

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

interface RecipeData {
  name: string;
  description: string;
  image: string | null;
  rating: number | null;
  ingredients: { name: string; amount: number; unit: string }[];
}

interface SubscriptionStatus {
  subscription: {
    status: string | null;
    isActive: boolean;
  };
  menuCount: number;
  menuLimit: number;
  canCreateMenu: boolean;
}

interface MenusPageClientProps {
  menuItems: MenuItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export function MenusPageClient({ 
  menuItems, 
  totalCount, 
  currentPage, 
  totalPages, 
  limit 
}: MenusPageClientProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [importedRecipeData, setImportedRecipeData] = useState<RecipeData | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleImportSuccess = (recipeData: RecipeData) => {
    setImportedRecipeData(recipeData);
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setImportedRecipeData(null);
  };

  const handleAddMenuClick = () => {
    if (!subscriptionStatus?.canCreateMenu) {
      router.push('/pricing');
    } else {
      router.push('/menus/new');
    }
  };

  const handleImportMenuClick = () => {
    if (!subscriptionStatus?.canCreateMenu) {
      router.push('/pricing');
    } else {
      setShowImportDialog(true);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('menus.title')}</h1>
          <p className="text-gray-600">
            {t('menus.totalCount', { count: totalCount })} {t('menus.totalLabel')}
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleImportMenuClick}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {t('menus.importMenu')}
            </button>
            <button
              onClick={handleAddMenuClick}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('menus.addMenu')}
            </button>
          </div>
        )}
      </div>
      
      {menuItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('menus.noMenusTitle')}</h2>
            <p className="text-gray-600 mb-8">
              {t('menus.noMenusSubtitle')}
            </p>
            <button
              onClick={handleAddMenuClick}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('menus.createFirst')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <MenuList menuItems={menuItems} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Link
                href={`/menus?page=${Math.max(1, currentPage - 1)}&limit=${limit}`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage <= 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-disabled={currentPage <= 1}
              >
                {t('common.previous')}
              </Link>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/menus?page=${pageNum}&limit=${limit}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                        pageNum === currentPage
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/menus?page=${Math.min(totalPages, currentPage + 1)}&limit=${limit}`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage >= totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-disabled={currentPage >= totalPages}
              >
                {t('common.next')}
              </Link>
            </div>
          )}
        </>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportMenuDialog 
          onClose={() => setShowImportDialog(false)} 
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Edit Dialog */}
      {showEditDialog && importedRecipeData && (
        <EditMenuDialog 
          initialData={importedRecipeData}
          onClose={handleEditDialogClose}
        />
      )}
    </>
  );
}