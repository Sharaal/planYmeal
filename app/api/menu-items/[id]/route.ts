import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const menuItemId = parseInt(id);

  if (isNaN(menuItemId)) {
    return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const menuItemId = parseInt(id);

  if (isNaN(menuItemId)) {
    return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
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

    // Check if menu item exists and belongs to user
    const existingMenuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        userId: user.id,
      },
    });

    if (!existingMenuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Update menu item with new ingredients
    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image || null,
        rating: rating ? parseFloat(rating) : null,
        ingredients: {
          deleteMany: {}, // Remove all existing ingredients
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

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const menuItemId = parseInt(id);

  if (isNaN(menuItemId)) {
    return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if menu item exists and belongs to user
    const existingMenuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        userId: user.id,
      },
    });

    if (!existingMenuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Delete menu item (ingredients will be deleted automatically due to cascade)
    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}