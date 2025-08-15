import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    const { checked } = await request.json();

    // Verify the shopping list item belongs to the user's shopping list
    const item = await prisma.shoppingListItem.findFirst({
      where: {
        id: itemId,
        shoppingList: {
          userId: user.id,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Shopping list item not found" },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { checked: Boolean(checked) },
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error) {
    console.error("Error updating shopping list item:", error);
    return NextResponse.json(
      { error: "Failed to update shopping list item" },
      { status: 500 }
    );
  }
}