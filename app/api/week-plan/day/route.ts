import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { date, menuItemId } = body;

    if (!date || !menuItemId) {
      return NextResponse.json(
        { error: 'Date and menuItemId are required' },
        { status: 400 }
      );
    }

    // Verify the menu item belongs to the user
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        userId: user.id,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found or unauthorized' },
        { status: 404 }
      );
    }

    const planDate = parseISO(date);


    // Create day plan (allow multiple menus per day)
    const dayPlan = await prisma.dayPlan.create({
      data: {
        userId: user.id,
        date: planDate,
        menuItemId: menuItemId,
        mealType: 'main', // Default meal type, could be made dynamic later
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
    console.error('Error creating/updating day plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}