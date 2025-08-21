import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getUserSubscription, getUserMenuCount, MENU_LIMIT_FREE } from '@/lib/subscription';

export async function GET() {
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

    const [subscription, menuCount] = await Promise.all([
      getUserSubscription(user.id),
      getUserMenuCount(user.id),
    ]);

    const isActive = subscription?.status === 'active' || subscription?.status === 'trial';
    const canCreateMenu = isActive || menuCount < MENU_LIMIT_FREE;

    return NextResponse.json({
      subscription: {
        status: subscription?.status || null,
        isActive,
      },
      menuCount,
      menuLimit: MENU_LIMIT_FREE,
      canCreateMenu,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}