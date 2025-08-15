import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ShoppingListsPageClient } from "@/components/shopping-lists-page-client";

export default async function ShoppingListsPage() {
  noStore();

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/");
  }

  const shoppingLists = await prisma.shoppingList.findMany({
    where: { userId: user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ShoppingListsPageClient shoppingLists={shoppingLists} />
      </main>
    </div>
  );
}