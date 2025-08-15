import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planDate = new Date(date);
    planDate.setHours(0, 0, 0, 0);

    // Find existing day plan
    const existingPlan = await prisma.dayPlan.findFirst({
      where: {
        userId: user.id,
        date: planDate,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Day plan not found" }, { status: 404 });
    }

    // Delete the day plan
    await prisma.dayPlan.delete({
      where: { id: existingPlan.id },
    });

    return NextResponse.json({ message: "Day plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting day plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}