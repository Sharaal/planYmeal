import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar-client";

export default async function CalendarPage() {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Meal Planner</h1>
          <p className="text-gray-600">
            Drag menus from the sidebar to plan your week, or double-click to assign to the next available day.
          </p>
        </div>
        
        <CalendarClient menuItems={menuItems} />
      </main>
    </div>
  );
}