'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

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
              Calendar
            </Link>
            <Link href="/menus" className={`transition-colors ${isActive("/menus")}`}>
              Menus
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/menus/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Add Menu
          </Link>
          
          <div className="flex items-center gap-3">
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
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}