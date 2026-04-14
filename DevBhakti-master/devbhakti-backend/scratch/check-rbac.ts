import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRBAC() {
  try {
    console.log('--- Permissions ---');
    const perms = await prisma.permission.findMany();
    console.log(`Total Permissions: ${perms.length}`);
    perms.forEach(p => console.log(`- ${p.key} (${p.applicableTo.join(',')})`));

    console.log('\n--- Staff Members ---');
    const staff = await prisma.staffMember.findMany({
      include: {
        staffRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });
    
    staff.forEach(s => {
      console.log(`Staff: ${s.name} (${s.email})`);
      console.log(`  Owner: ${s.ownerType} (${s.ownerId})`);
      console.log(`  IsActive: ${s.isActive}`);
      s.staffRoles.forEach(sr => {
        console.log(`  Role: ${sr.role.name}`);
        sr.role.rolePermissions.forEach(rp => {
          console.log(`    Perm: ${rp.permission.key}`);
        });
      });
    });

    console.log('\n--- Products with Orders ---');
    const productsWithOrders = await prisma.product.findMany({
      include: {
        _count: {
          select: { orderItems: true }
        }
      },
      where: {
        orderItems: { some: {} }
      }
    });
    console.log(`Products blocked from deletion (have orders): ${productsWithOrders.length}`);
    productsWithOrders.forEach(p => {
      console.log(`- ${p.id}: ${JSON.stringify(p.name)} (${p._count.orderItems} orders)`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRBAC();
