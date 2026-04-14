import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const perms = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { key: 'asc' }]
  });
  
  console.log('--- Current Permissions ---');
  perms.forEach(p => {
    console.log(`[${p.module}] ${p.key} - ${p.label} (Applicable to: ${p.applicableTo.join(', ')})`);
  });
  console.log('---------------------------');
  console.log(`Total: ${perms.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
