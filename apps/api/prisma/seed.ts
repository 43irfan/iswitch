import { PrismaClient, AccountType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.syncAudit.deleteMany();
  await prisma.routePrefix.deleteMany();
  await prisma.customerTrunk.deleteMany();
  await prisma.carrierTrunk.deleteMany();
  await prisma.queueMember.deleteMany();
  await prisma.ringGroupMember.deleteMany();
  await prisma.did.deleteMany();
  await prisma.voicemailBox.deleteMany();
  await prisma.extension.deleteMany();
  await prisma.callQueue.deleteMany();
  await prisma.ringGroup.deleteMany();
  await prisma.ivrMenu.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();

  const platform = await prisma.account.create({
    data: { name: 'iSwitch Platform', type: AccountType.PLATFORM },
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
      billingMode: 'PREPAID',
      balanceMicros: 50_000_000n, // $50.00
      creditLimitMicros: 0n,
      maxChannels: 50,
      maxCps: 10,
      techPrefix: '001',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@iswitch.local',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      accountId: platform.id,
      passwordHash,
    },
  });
  void admin;

  await prisma.user.create({
    data: {
      email: 'reseller@iswitch.local',
      name: 'Reseller User',
      role: UserRole.RESELLER,
      accountId: reseller.id,
      passwordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'retail@iswitch.local',
      name: 'Retail Admin',
      role: UserRole.RETAIL_CUSTOMER_ADMIN,
      accountId: retail.id,
      passwordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'wholesale@iswitch.local',
      name: 'Wholesale User',
      role: UserRole.WHOLESALE_CUSTOMER,
      accountId: wholesale.id,
      passwordHash,
    },
  });

  const endUser = await prisma.user.create({
    data: {
      email: 'user@iswitch.local',
      name: 'End User',
      role: UserRole.END_USER,
      accountId: retail.id,
      passwordHash,
    },
  });

  const ext100 = await prisma.extension.create({
    data: {
      accountId: retail.id,
      number: '100',
      displayName: 'Front Desk',
      sipUsername: '100',
      sipPassword: 'sip100pass',
      callerId: '+15551000100',
      userId: endUser.id,
      voicemailBox: {
        create: {
          accountId: retail.id,
          mailbox: '100',
          email: 'user@iswitch.local',
          pin: '1000',
        },
      },
    },
  });

  const ext101 = await prisma.extension.create({
    data: {
      accountId: retail.id,
      number: '101',
      displayName: 'Sales',
      sipUsername: '101',
      sipPassword: 'sip101pass',
      callerId: '+15551000101',
      voicemailBox: {
        create: {
          accountId: retail.id,
          mailbox: '101',
          email: 'retail@iswitch.local',
          pin: '1010',
        },
      },
    },
  });

  const salesGroup = await prisma.ringGroup.create({
    data: {
      accountId: retail.id,
      name: 'Sales Team',
      strategy: 'RINGALL',
      ringTimeout: 25,
      members: {
        create: [
          { extensionId: ext100.id, priority: 1 },
          { extensionId: ext101.id, priority: 2 },
        ],
      },
    },
  });

  const supportQueue = await prisma.callQueue.create({
    data: {
      accountId: retail.id,
      name: 'Support',
      extension: '800',
      strategy: 'LEASTRECENT',
      timeout: 45,
      musicOnHold: 'default',
      members: {
        create: [{ extensionId: ext101.id }],
      },
    },
  });

  const ivr = await prisma.ivrMenu.create({
    data: {
      accountId: retail.id,
      name: 'Main Menu',
      greetingPrompt: 'welcome',
      timeoutSeconds: 5,
      options: {
        '1': { type: 'EXTENSION', ref: ext100.id },
        '2': { type: 'RING_GROUP', ref: salesGroup.id },
        '3': { type: 'QUEUE', ref: supportQueue.id },
      },
    },
  });

  await prisma.did.create({
    data: {
      accountId: retail.id,
      number: '+15551234567',
      description: 'Main company DID',
      destinationType: 'IVR',
      destinationRef: ivr.id,
      callerIdName: 'Acme Retail',
    },
  });

  await prisma.did.create({
    data: {
      accountId: retail.id,
      number: '+15557654321',
      description: 'Direct to front desk',
      destinationType: 'EXTENSION',
      destinationRef: ext100.id,
      callerIdName: 'Acme Front Desk',
    },
  });

  await prisma.customerTrunk.create({
    data: {
      accountId: wholesale.id,
      name: 'Primary SIP Trunk',
      authType: 'BOTH',
      sipUsername: 'bulkvoice',
      sipPassword: 'trunkSecret1',
      ipAcl: '203.0.113.10,203.0.113.11',
      techPrefix: '001',
      maxChannels: 30,
      maxCps: 8,
    },
  });

  const carrier = await prisma.carrierTrunk.create({
    data: {
      accountId: platform.id,
      name: 'Demo Carrier US',
      host: 'sip.demo-carrier.example',
      port: 5060,
      codecs: 'ulaw,alaw,g729',
      maxChannels: 500,
      maxCps: 100,
      priority: 10,
    },
  });

  await prisma.routePrefix.create({
    data: {
      accountId: platform.id,
      prefix: '1',
      description: 'NANP / US-CA',
      carrierTrunkId: carrier.id,
      rateMicros: 12_000n, // $0.012 / min sell
      costMicros: 8_000n, // $0.008 / min cost
      priority: 10,
    },
  });

  await prisma.routePrefix.create({
    data: {
      accountId: platform.id,
      prefix: '44',
      description: 'United Kingdom',
      carrierTrunkId: carrier.id,
      rateMicros: 25_000n,
      costMicros: 18_000n,
      priority: 20,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded Phase 4 wholesale + retail demo. Password: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
