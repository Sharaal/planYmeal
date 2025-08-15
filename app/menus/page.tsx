import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { MenuList } from "@/components/menu-list";

interface MenusPageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function MenusPage({ searchParams }: MenusPageProps) {
  noStore();

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "12");
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/");
  }

  const [menuItems, totalCount] = await Promise.all([
    prisma.menuItem.findMany({
      where: { userId: user.id },
      include: {
        ingredients: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.menuItem.count({
      where: { userId: user.id },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Menus</h1>
            <p className="text-gray-600">
              {totalCount} menu{totalCount !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link
            href="/menus/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create New Menu
          </Link>
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No menus yet</h2>
              <p className="text-gray-600 mb-8">
                Start building your meal planning collection by creating your first menu.
              </p>
              <Link
                href="/menus/new"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Menu
              </Link>
            </div>
          </div>
        ) : (
          <>
            <MenuList menuItems={menuItems} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Link
                  href={`/menus?page=${Math.max(1, page - 1)}&limit=${limit}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page <= 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-disabled={page <= 1}
                >
                  Previous
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Link
                        key={pageNum}
                        href={`/menus?page=${pageNum}&limit=${limit}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                          pageNum === page
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
                  href={`/menus?page=${Math.min(totalPages, page + 1)}&limit=${limit}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page >= totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-disabled={page >= totalPages}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}