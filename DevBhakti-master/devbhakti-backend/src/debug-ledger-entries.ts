import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Debugging All TempleLedger Entries ===");
  const ledger = await prisma.templeLedger.findMany();
  console.log("Ledger Entries:", JSON.stringify(ledger, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
