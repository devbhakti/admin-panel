import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('--- All Users ---');
    const users = await prisma.user.findMany();
    users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

    console.log('\n--- All Staff ---');
    const staff = await prisma.staffMember.findMany();
    staff.forEach(s => console.log(`- ${s.name} (${s.email}) [Owner: ${s.ownerType}/${s.ownerId}]`));

    console.log('\n--- All Roles ---');
    const roles = await prisma.role.findMany();
    roles.forEach(r => console.log(`- ${r.name} [Owner: ${r.ownerType}/${r.ownerId}]`));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
