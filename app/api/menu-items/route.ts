import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { canUserCreateMenu } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({
      menuItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, image, rating, ingredients } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can create more menus
    const canCreate = await canUserCreateMenu(user.id);
    if (!canCreate) {
      return NextResponse.json({ 
        error: "Menu limit reached", 
        code: "MENU_LIMIT_REACHED" 
      }, { status: 403 });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image || null,
        rating: rating ? parseFloat(rating) : null,
        userId: user.id,
        ingredients: {
          create: ingredients?.map((ingredient: { name: string; amount: string | number; unit: string }) => ({
            name: ingredient.name.trim(),
            amount: typeof ingredient.amount === 'string' ? parseFloat(ingredient.amount) : ingredient.amount,
            unit: ingredient.unit,
          })) || [],
        },
      },
      include: {
        ingredients: true,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}