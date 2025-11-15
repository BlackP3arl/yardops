// Quick test script to verify meter service works
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMeterQuery() {
  try {
    console.log('Testing meter query...');
    
    const meters = await prisma.meter.findMany({
      take: 5,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        meterType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { meterNumber: 'asc' },
    });
    
    console.log('Success! Found', meters.length, 'meters');
    console.log('Sample meter:', JSON.stringify(meters[0] || 'No meters found', null, 2));
    
    const total = await prisma.meter.count();
    console.log('Total meters:', total);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testMeterQuery();

