import { PrismaClient, AccountType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();

  const platform = await prisma.account.create({
    data: {
      name: 'iSwitch Platform',
      type: AccountType.PLATFORM,
    },
  });

  const reseller = await prisma.account.create({
    data: {
      name: 'Demo Reseller',
      type: AccountType.RESELLER,
      parentId: platform.id,
    },
  });

  const retail = await prisma.account.create({
    data: {
      name: 'Acme Retail PBX',
      type: AccountType.RETAIL,
      parentId: reseller.id,
    },
  });

  const wholesale = await prisma.account.create({
    data: {
      name: 'BulkVoice Wholesale',
      type: AccountType.WHOLESALE,
      parentId: reseller.id,
    },
  });

  const users = [
    {
      email: 'admin@iswitch.local',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      accountId: platform.id,
    },
    {
      email: 'reseller@iswitch.local',
      name: 'Reseller User',
      role: UserRole.RESELLER,
      accountId: reseller.id,
    },
    {
      email: 'retail@iswitch.local',
      name: 'Retail Admin',
      role: UserRole.RETAIL_CUSTOMER_ADMIN,
      accountId: retail.id,
    },
    {
      email: 'wholesale@iswitch.local',
      name: 'Wholesale User',
      role: UserRole.WHOLESALE_CUSTOMER,
      accountId: wholesale.id,
    },
    {
      email: 'user@iswitch.local',
      name: 'End User',
      role: UserRole.END_USER,
      accountId: retail.id,
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        passwordHash,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seeded accounts + users. Password for all: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
