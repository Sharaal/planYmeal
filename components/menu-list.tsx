'use client';

import { MenuItemCard } from "./menu-item";
import { useRouter } from "next/navigation";

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  rating?: number | null;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
}

interface MenuListProps {
  menuItems: MenuItem[];
}

export function MenuList({ menuItems }: MenuListProps) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/menu-items/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      router.refresh();
    } else {
      console.error('Failed to delete menu item');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((menuItem) => (
        <MenuItemCard
          key={menuItem.id}
          menuItem={{
            ...menuItem,
            description: menuItem.description || undefined,
            image: menuItem.image || undefined,
            rating: menuItem.rating || undefined,
          }}
          onDelete={handleDelete}
          isDraggable={false}
        />
      ))}
    </div>
  );
}