import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
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
    const shoppingListId = parseInt(resolvedParams.id);

    // Verify the shopping list belongs to the user
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingListId,
        userId: user.id,
      },
    });

    if (!shoppingList) {
      return NextResponse.json(
        { error: "Shopping list not found" },
        { status: 404 }
      );
    }

    // Delete the shopping list (items will be deleted automatically due to cascade)
    await prisma.shoppingList.delete({
      where: { id: shoppingListId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return NextResponse.json(
      { error: "Failed to delete shopping list" },
      { status: 500 }
    );
  }
}