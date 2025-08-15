import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar-client";
import { SignInButton } from "@/components/auth";

export default async function Home() {
  noStore();

  const session = await auth();

  if (!session?.user?.email) {
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/");
  }

  // Get user's menu items for the sidebar
  const menuItems = await prisma.menuItem.findMany({
    where: { userId: user.id },
    include: {
      ingredients: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20, // Limit for performance
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CalendarClient menuItems={menuItems} />
      </main>
    </div>
  );
}
