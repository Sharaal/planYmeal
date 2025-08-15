import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');

    if (!startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
    }

    // Calculate end date (6 days later for 7 days total)
    const startDateObj = new Date(startDate);
    const endDateObj = addDays(startDateObj, 6);
    const endDate = endDateObj.toISOString().split('T')[0]; // Convert back to YYYY-MM-DD format

    console.log('Week plan query:', { startDate, endDate });

    const dayPlans = await prisma.dayPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(startDate + 'T00:00:00.000Z'),
          lte: new Date(endDate + 'T23:59:59.999Z'),
        },
      },
      include: {
        menuItem: {
          include: {
            ingredients: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(dayPlans);
  } catch (error) {
    console.error('Error fetching week plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}