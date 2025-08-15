import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const shoppingListId = parseInt(id, 10);

    if (isNaN(shoppingListId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingListId,
        userId: user.id,
      },
    });

    if (!shoppingList) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const shoppingListId = parseInt(id, 10);

    if (isNaN(shoppingListId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { ingredients, isCompleted } = body;

    const shoppingList = await prisma.shoppingList.updateMany({
      where: {
        id: shoppingListId,
        userId: user.id,
      },
      data: {
        ...(ingredients !== undefined && { ingredients }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    if (shoppingList.count === 0) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    const updatedList = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingListId,
        userId: user.id,
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const shoppingListId = parseInt(id, 10);

    if (isNaN(shoppingListId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleteResult = await prisma.shoppingList.deleteMany({
      where: {
        id: shoppingListId,
        userId: user.id,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}