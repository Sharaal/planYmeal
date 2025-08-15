import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { MenuForm } from "@/components/menu-form";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/");
  }

  const menuItemId = parseInt(id);
  if (isNaN(menuItemId)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/");
  }

  const menuItem = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      userId: user.id,
    },
    include: {
      ingredients: true,
    },
  });

  if (!menuItem) {
    notFound();
  }

  return <MenuForm menuItem={{
    ...menuItem,
    description: menuItem.description || undefined,
    image: menuItem.image || undefined,
    rating: menuItem.rating || undefined,
  }} />;
}