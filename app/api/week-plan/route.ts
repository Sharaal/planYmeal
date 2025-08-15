import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate start and end dates for the week
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const dayPlans = await prisma.dayPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        menuItem: {
          include: {
            ingredients: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Create array for all 7 days
    const weekPlan = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dayPlan = dayPlans.find(dp => 
        dp.date.toDateString() === currentDate.toDateString()
      );

      weekPlan.push({
        date: currentDate.toISOString().split('T')[0],
        dayPlan: dayPlan || null,
      });
    }

    return NextResponse.json({ weekPlan });
  } catch (error) {
    console.error("Error fetching week plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}