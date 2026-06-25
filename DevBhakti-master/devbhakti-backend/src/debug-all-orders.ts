import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Debugging All Orders ===");
  const orders = await prisma.order.findMany();
  console.log("Orders:", JSON.stringify(orders, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
