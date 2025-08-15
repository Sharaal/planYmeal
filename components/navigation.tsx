'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./language-switcher";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (!session) {
    return null; // Don't show navigation if not logged in
  }

  const isActive = (path: string) => {
    return pathname === path ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900";
  };

  return (
    <header className="sticky top-0 bg-white backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PlanYMeal
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`transition-colors ${isActive("/")}`}>
              {t('navigation.calendar')}
            </Link>
            <Link href="/menus" className={`transition-colors ${isActive("/menus")}`}>
              {t('navigation.menus')}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700 hidden sm:inline">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('navigation.signOut')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}