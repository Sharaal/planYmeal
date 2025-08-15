import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { RatingStars } from "@/components/rating-stars";

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/");
  }

  const menuItemId = parseInt(id);
  if (isNaN(menuItemId)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/");
  }

  const menuItem = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      userId: user.id,
    },
    include: {
      ingredients: true,
    },
  });

  if (!menuItem) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PlanYMeal
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/menus"
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              All Menus
            </Link>
            <Link
              href={`/menus/${menuItem.id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Menu
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {menuItem.name}
              </h1>
              {menuItem.rating && (
                <RatingStars rating={menuItem.rating} readonly />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/menus/${menuItem.id}/edit`}
                className="text-blue-500 hover:text-blue-600 transition-colors p-2"
                title="Edit menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </div>
          </div>

          {menuItem.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{menuItem.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ingredients ({menuItem.ingredients.length})
            </h2>
            
            {menuItem.ingredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No ingredients added yet</p>
                <Link
                  href={`/menus/${menuItem.id}/edit`}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Add ingredients
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {menuItem.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {ingredient.name}
                    </span>
                    <span className="text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-8 border-t mt-8">
            <Link
              href="/menus"
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to Menus
            </Link>
            <Link
              href={`/menus/${menuItem.id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Menu
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}