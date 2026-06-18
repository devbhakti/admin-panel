import { prisma } from '../lib/prisma';
import { generateCustomId } from '../utils/idGenerator';

async function backfill() {
  console.log('Starting ID backfill...');

  // 1. Users
  const users = await prisma.user.findMany({ where: { displayId: null } });
  console.log(`Backfilling ${users.length} users...`);
  for (const user of users) {
    const prefix = user.role === 'INSTITUTION' ? 'TAID' : 'UID';
    const displayId = await generateCustomId(prefix);
    await prisma.user.update({ where: { id: user.id }, data: { displayId } });
  }

  // 2. Temples
  const temples = await prisma.temple.findMany({ where: { displayId: null } });
  console.log(`Backfilling ${temples.length} temples...`);
  for (const temple of temples) {
    const displayId = await generateCustomId('TID');
    await prisma.temple.update({ where: { id: temple.id }, data: { displayId, templeId: displayId } });
  }

  // 3. Seller Profiles
  const sellers = await prisma.sellerProfile.findMany({ where: { displayId: null } });
  console.log(`Backfilling ${sellers.length} sellers...`);
  for (const seller of sellers) {
    const displayId = await generateCustomId('SLID');
    await prisma.sellerProfile.update({ where: { id: seller.id }, data: { displayId } });
  }

  // 4. Bookings
  const bookings = await prisma.poojaBooking.findMany({ where: { displayId: null } as any });
  console.log(`Backfilling ${bookings.length} bookings...`);
  for (const booking of bookings) {
    const displayId = await generateCustomId('BKID');
    await prisma.poojaBooking.update({ where: { id: booking.id }, data: { displayId } });
  }

  // 5. Orders
  const orders = await prisma.order.findMany({ where: { displayId: null } });
  console.log(`Backfilling ${orders.length} orders...`);
  for (const order of orders) {
    const displayId = await generateCustomId('OID');
    await prisma.order.update({ where: { id: order.id }, data: { displayId } });
  }

  // 6. Staff Members
  const staff = await prisma.staffMember.findMany({ where: { displayId: null } });
  console.log(`Backfilling ${staff.length} staff members...`);
  for (const s of staff) {
    const prefix = s.ownerType === 'ADMIN' ? 'DBSID' : (s.ownerType === 'TEMPLE' ? 'TSID' : 'UID');
    const displayId = await generateCustomId(prefix);
    await prisma.staffMember.update({ where: { id: s.id }, data: { displayId } });
  }

  console.log('Backfill completed successfully.');
}

backfill()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
