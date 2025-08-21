import prisma from '@/lib/prisma';

export async function getUserSubscription(userId: number) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    return subscription;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

export async function isUserSubscriptionActive(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.status === 'active' || subscription?.status === 'trial';
}

export async function getUserMenuCount(userId: number): Promise<number> {
  try {
    const count = await prisma.menuItem.count({
      where: { userId },
    });
    return count;
  } catch (error) {
    console.error('Error counting user menus:', error);
    return 0;
  }
}

export async function canUserCreateMenu(userId: number): Promise<boolean> {
  const isActive = await isUserSubscriptionActive(userId);
  
  // If user has active subscription, they can create unlimited menus
  if (isActive) {
    return true;
  }
  
  // If no active subscription, check if they're under the limit of 10
  const menuCount = await getUserMenuCount(userId);
  return menuCount < MENU_LIMIT_FREE;
}

export const MENU_LIMIT_FREE = 10;