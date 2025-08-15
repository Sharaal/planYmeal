import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { MenusPageClient } from "@/components/menus-page-client";

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
        <MenusPageClient 
          menuItems={menuItems}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
        />
      </main>
    </div>
  );
}