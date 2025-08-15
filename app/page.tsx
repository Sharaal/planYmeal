import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "@/components/auth";

import type { Session } from "next-auth";

function UserMenu({ user }: { user: NonNullable<Session["user"]> }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700">
        Welcome, {user.name?.split(' ')[0] || 'User'}
      </span>
      <SignOutButton />
    </div>
  );
}


export default async function Home() {
  noStore();

  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            PlanYMeal
          </h1>
          <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto">
            Plan your meals, organize your week, and generate shopping lists effortlessly
          </p>
          <SignInButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PlanYMeal
          </Link>
          <UserMenu user={session.user} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Your Weekly Meal Planner
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Organize your meals, plan your week, and never worry about what to cook again
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Weekly Calendar
            </h2>
            <div className="text-gray-500 text-center py-8">
              Calendar component will be implemented here
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Menus</h2>
              <Link
                href="/menus/new"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Menu
              </Link>
            </div>
            <div className="text-gray-500 text-center py-8">
              Menu list will be implemented here
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
