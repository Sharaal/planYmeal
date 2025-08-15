import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar-client";
import { SignInButton } from "@/components/auth";
import { SignInContent, CalendarContent } from "@/components/home-content";

export default async function Home() {
  noStore();

  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <SignInContent />
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
