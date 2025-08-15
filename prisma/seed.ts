import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@prisma.io",
      menuItems: {
        create: [
          {
            name: "Spaghetti Carbonara",
            description: "Classic Italian pasta dish with eggs, cheese, and pancetta",
            rating: 4.5,
            ingredients: {
              create: [
                { name: "Spaghetti", amount: 400, unit: "g" },
                { name: "Pancetta", amount: 150, unit: "g" },
                { name: "Eggs", amount: 4, unit: "Stück" },
                { name: "Parmesan", amount: 100, unit: "g" },
              ],
            },
          },
          {
            name: "Caesar Salad",
            description: "Fresh romaine lettuce with caesar dressing and croutons",
            rating: 4.0,
            ingredients: {
              create: [
                { name: "Romaine Lettuce", amount: 200, unit: "g" },
                { name: "Caesar Dressing", amount: 50, unit: "ml" },
                { name: "Croutons", amount: 30, unit: "g" },
                { name: "Parmesan", amount: 50, unit: "g" },
              ],
            },
          },
        ],
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@prisma.io",
      menuItems: {
        create: [
          {
            name: "Chicken Stir Fry",
            description: "Quick and healthy chicken with vegetables",
            rating: 4.2,
            ingredients: {
              create: [
                { name: "Chicken Breast", amount: 300, unit: "g" },
                { name: "Bell Peppers", amount: 150, unit: "g" },
                { name: "Broccoli", amount: 200, unit: "g" },
                { name: "Soy Sauce", amount: 30, unit: "ml" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log({ alice, bob });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });