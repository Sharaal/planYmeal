import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { addDays, format } from 'date-fns';

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

    const { menuItemId } = await request.json();

    if (!menuItemId) {
      return NextResponse.json(
        { error: 'menuItemId is required' },
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

    // Get existing day plans for the next 30 days starting from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = addDays(today, 30);
    
    const existingPlans = await prisma.dayPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lte: endDate,
        },
      },
      select: {
        date: true,
      },
    });

    // Create a set of dates that already have plans
    const plannedDates = new Set(
      existingPlans.map(plan => format(plan.date, 'yyyy-MM-dd'))
    );

    // Find the first date without any plans
    let targetDate = today;
    let attempts = 0;
    while (attempts < 30) {
      const dateString = format(targetDate, 'yyyy-MM-dd');
      if (!plannedDates.has(dateString)) {
        break;
      }
      targetDate = addDays(targetDate, 1);
      attempts++;
    }

    if (attempts >= 30) {
      return NextResponse.json(
        { error: 'No free days found in the next 30 days' },
        { status: 400 }
      );
    }

    // Create the day plan for the target date
    const dayPlan = await prisma.dayPlan.create({
      data: {
        userId: user.id,
        date: new Date(format(targetDate, 'yyyy-MM-dd') + 'T00:00:00.000Z'),
        menuItemId: menuItemId,
        mealType: 'main',
      },
      include: {
        menuItem: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    console.log(`Auto-assigned menu "${menuItem.name}" to ${format(targetDate, 'yyyy-MM-dd')}`);

    return NextResponse.json({ 
      success: true, 
      dayPlan,
      assignedDate: format(targetDate, 'yyyy-MM-dd')
    });

  } catch (error) {
    console.error('Error auto-assigning menu:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}