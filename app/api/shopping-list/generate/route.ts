import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { addDays, parseISO } from 'date-fns';

interface AggregatedIngredient {
  name: string;
  amount: number;
  unit: string;
}

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

    const start = parseISO(startDate);
    const end = addDays(start, 6); // 7 days total

    // Get all day plans for the week with their menu items and ingredients
    const dayPlans = await prisma.dayPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
        menuItemId: {
          not: null,
        },
      },
      include: {
        menuItem: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    // Aggregate ingredients by name and unit
    const ingredientMap = new Map<string, AggregatedIngredient>();

    dayPlans.forEach(dayPlan => {
      if (dayPlan.menuItem?.ingredients) {
        dayPlan.menuItem.ingredients.forEach(ingredient => {
          const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.amount += ingredient.amount;
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
            });
          }
        });
      }
    });

    // Convert map to array and sort alphabetically
    const aggregatedIngredients = Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      ingredients: aggregatedIngredients,
      weekStart: startDate,
      totalMenus: dayPlans.length,
    });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}