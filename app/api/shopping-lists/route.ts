import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    const { startDate, endDate } = await request.json();

    console.log('Date range query:', {
      startDate,
      endDate,
      startDateType: typeof startDate,
      endDateType: typeof endDate,
      userId: user.id
    });

    // Validate and parse dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    console.log('Parsed dates:', {
      startDateObj,
      endDateObj,
      startValid: !isNaN(startDateObj.getTime()),
      endValid: !isNaN(endDateObj.getTime())
    });

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json({
        success: false,
        error: "Invalid date format. Expected YYYY-MM-DD format."
      }, { status: 400 });
    }

    // Set to start and end of day in UTC
    startDateObj.setUTCHours(0, 0, 0, 0);
    endDateObj.setUTCHours(23, 59, 59, 999);

    // Get all day plans in the date range using date-only comparisons
    const dayPlans = await prisma.dayPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDateObj,
          lte: endDateObj,
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

    if (dayPlans.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No menus found in the selected date range" 
      });
    }

    // Aggregate ingredients from all menus in the date range
    const ingredientMap = new Map<string, { name: string; amount: number; unit: string }>();
    
    dayPlans.forEach(dayPlan => {
      if (dayPlan.menuItem?.ingredients) {
        dayPlan.menuItem.ingredients.forEach(ingredient => {
          // Normalize the key for better matching
          const normalizedName = ingredient.name.toLowerCase().trim();
          const normalizedUnit = ingredient.unit.toLowerCase().trim();
          const key = `${normalizedName}::${normalizedUnit}`;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.amount += Number(ingredient.amount);
          } else {
            ingredientMap.set(key, {
              name: ingredient.name, // Keep original case for display
              amount: Number(ingredient.amount),
              unit: ingredient.unit, // Keep original case for display
            });
          }
        });
      }
    });

    // Create shopping list using the validated date objects
    const shoppingList = await prisma.shoppingList.create({
      data: {
        userId: user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        items: {
          create: Array.from(ingredientMap.values()).map(ingredient => ({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            checked: false,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      shoppingList 
    });

  } catch (error) {
    console.error("Error creating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to create shopping list" },
      { status: 500 }
    );
  }
}