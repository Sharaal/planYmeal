import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, menuItemId } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify menu item belongs to user if provided
    if (menuItemId) {
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: parseInt(menuItemId),
          userId: user.id,
        },
      });

      if (!menuItem) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
    }

    const planDate = new Date(date);
    planDate.setHours(0, 0, 0, 0);

    // Upsert day plan
    const dayPlan = await prisma.dayPlan.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: planDate,
        },
      },
      update: {
        menuItemId: menuItemId ? parseInt(menuItemId) : null,
      },
      create: {
        userId: user.id,
        date: planDate,
        menuItemId: menuItemId ? parseInt(menuItemId) : null,
      },
      include: {
        menuItem: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    return NextResponse.json(dayPlan);
  } catch (error) {
    console.error("Error updating day plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}