import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yardops.com' },
    update: {},
    create: {
      email: 'admin@yardops.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create reader user
  const readerPassword = await bcrypt.hash('reader123', 10);
  const reader = await prisma.user.upsert({
    where: { email: 'reader@yardops.com' },
    update: {},
    create: {
      email: 'reader@yardops.com',
      password: readerPassword,
      firstName: 'Reader',
      lastName: 'User',
      role: 'READER',
    },
  });

  // Create locations
  const location1 = await prisma.location.upsert({
    where: { id: 'loc-1' },
    update: {},
    create: {
      id: 'loc-1',
      name: 'Dock A',
      description: 'Main dock area',
    },
  });

  const location2 = await prisma.location.upsert({
    where: { id: 'loc-2' },
    update: {},
    create: {
      id: 'loc-2',
      name: 'Dock B',
      description: 'Secondary dock area',
    },
  });

  // Create meters
  const meter1 = await prisma.meter.upsert({
    where: { meterNumber: 'WTR-001' },
    update: {},
    create: {
      meterNumber: 'WTR-001',
      meterType: 'WATER',
      locationId: location1.id,
      frequency: 'DAILY',
    },
  });

  const meter2 = await prisma.meter.upsert({
    where: { meterNumber: 'ELC-001' },
    update: {},
    create: {
      meterNumber: 'ELC-001',
      meterType: 'ELECTRIC',
      locationId: location1.id,
      frequency: 'WEEKLY',
    },
  });

  // Assign meters to reader
  await prisma.meterAssignment.upsert({
    where: {
      meterId_userId: {
        meterId: meter1.id,
        userId: reader.id,
      },
    },
    update: {},
    create: {
      meterId: meter1.id,
      userId: reader.id,
      assignedBy: admin.id,
    },
  });

  await prisma.meterAssignment.upsert({
    where: {
      meterId_userId: {
        meterId: meter2.id,
        userId: reader.id,
      },
    },
    update: {},
    create: {
      meterId: meter2.id,
      userId: reader.id,
      assignedBy: admin.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Default credentials:');
  console.log('Admin: admin@yardops.com / admin123');
  console.log('Reader: reader@yardops.com / reader123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

