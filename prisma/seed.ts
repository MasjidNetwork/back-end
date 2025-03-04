import { PrismaClient, Role, DonationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Starting seeding process...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.donation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.masjidAdmin.deleteMany();
  await prisma.masjid.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users with different roles...');

  // Create super admin user
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@masjidnetwork.com',
      password: await hashPassword('Superadmin123!'),
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
      phone: '1234567890',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
  });
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@masjidnetwork.com',
      password: await hashPassword('Admin123!'),
      firstName: 'General',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
      phone: '2345678901',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
  });

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: await hashPassword('User123!'),
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      isActive: true,
      phone: '3456789012',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: await hashPassword('User123!'),
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.USER,
      isActive: true,
      phone: '4567890123',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
  });

  const futureMAUser = await prisma.user.create({
    data: {
      email: 'future_masjid_admin@example.com',
      password: await hashPassword('User123!'),
      firstName: 'Future',
      lastName: 'MasjidAdmin',
      role: Role.USER,
      isActive: true,
      phone: '5678901234',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  });

  console.log('Creating masjids...');

  // Create masjids
  const masjid1 = await prisma.masjid.create({
    data: {
      name: 'Al-Noor Islamic Center',
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
      email: 'contact@alnoor.org',
      phone: '7138675309',
      website: 'https://www.alnoor.org',
      description: 'A vibrant Islamic center serving the greater Houston area.',
      logoUrl: 'https://placehold.co/400x300?text=Al-Noor+Islamic+Center',
      coverImageUrl: 'https://placehold.co/1200x400?text=Al-Noor+Islamic+Center',
      isVerified: true,
    },
  });

  const masjid2 = await prisma.masjid.create({
    data: {
      name: 'Masjid Al-Rahman',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA',
      email: 'info@alrahman.org',
      phone: '2145551234',
      website: 'https://www.alrahman.org',
      description: 'A community mosque focused on education and outreach.',
      logoUrl: 'https://placehold.co/400x300?text=Masjid+Al-Rahman',
      coverImageUrl: 'https://placehold.co/1200x400?text=Masjid+Al-Rahman',
      isVerified: true,
    },
  });

  const masjid3 = await prisma.masjid.create({
    data: {
      name: 'Islamic Society of Chicago',
      address: '789 Lake St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
      email: 'contact@isoc.org',
      phone: '3125559876',
      website: 'https://www.isoc.org',
      description: 'Serving the Muslim community in downtown Chicago since 1985.',
      logoUrl: 'https://placehold.co/400x300?text=Islamic+Society+of+Chicago',
      coverImageUrl: 'https://placehold.co/1200x400?text=Islamic+Society+of+Chicago',
      isVerified: false,
    },
  });

  console.log('Setting up masjid administrators...');

  // Create masjid admins
  await prisma.masjidAdmin.create({
    data: {
      userId: futureMAUser.id,
      masjidId: masjid1.id,
      role: 'ADMIN',
    },
  });
  
  // Update the user to be a MASJID_ADMIN
  await prisma.user.update({
    where: { id: futureMAUser.id },
    data: { role: Role.MASJID_ADMIN },
  });

  const masjidAdminUser = await prisma.user.create({
    data: {
      email: 'masjid_admin@example.com',
      password: await hashPassword('Admin123!'),
      firstName: 'Masjid',
      lastName: 'Administrator',
      role: Role.MASJID_ADMIN,
      isActive: true,
      phone: '6789012345',
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    },
  });

  await prisma.masjidAdmin.create({
    data: {
      userId: masjidAdminUser.id,
      masjidId: masjid2.id,
      role: 'ADMIN',
    },
  });

  // Create a MASJID_ADMIN who administers multiple masjids
  const multiMasjidAdmin = await prisma.user.create({
    data: {
      email: 'multi_masjid_admin@example.com',
      password: await hashPassword('Admin123!'),
      firstName: 'Multi',
      lastName: 'Manager',
      role: Role.MASJID_ADMIN,
      isActive: true,
      phone: '7890123456',
      profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
  });

  await prisma.masjidAdmin.create({
    data: {
      userId: multiMasjidAdmin.id,
      masjidId: masjid1.id,
      role: 'EDITOR',
    },
  });

  await prisma.masjidAdmin.create({
    data: {
      userId: multiMasjidAdmin.id,
      masjidId: masjid3.id,
      role: 'ADMIN',
    },
  });

  console.log('Creating campaigns...');

  // Create campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      title: 'Mosque Expansion Project',
      description: 'Help us expand our mosque to accommodate our growing community.',
      goal: 250000.00,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
      coverImageUrl: 'https://placehold.co/800x400?text=Mosque+Expansion',
      masjidId: masjid1.id,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: 'Ramadan Food Distribution',
      description: 'Support our initiative to provide iftar meals to those in need during Ramadan.',
      goal: 50000.00,
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-03-31'),
      isActive: true,
      coverImageUrl: 'https://placehold.co/800x400?text=Ramadan+Food',
      masjidId: masjid2.id,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      title: 'Islamic School Scholarships',
      description: 'Provide scholarships for underprivileged children to attend our Islamic school.',
      goal: 100000.00,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-08-31'),
      isActive: true,
      coverImageUrl: 'https://placehold.co/800x400?text=School+Scholarships',
      masjidId: masjid3.id,
    },
  });

  console.log('Creating donations...');

  // Create donations
  await prisma.donation.createMany({
    data: [
      {
        amount: 100.00,
        campaignId: campaign1.id,
        userId: user1.id,
        paymentMethod: 'CREDIT_CARD',
        status: DonationStatus.COMPLETED,
        isAnonymous: false,
        message: 'May Allah accept this donation.',
      },
      {
        amount: 50.00,
        campaignId: campaign1.id,
        userId: user2.id,
        paymentMethod: 'CREDIT_CARD',
        status: DonationStatus.COMPLETED,
        isAnonymous: true,
      },
      {
        amount: 200.00,
        campaignId: campaign2.id,
        userId: user1.id,
        paymentMethod: 'PAYPAL',
        status: DonationStatus.COMPLETED,
        isAnonymous: false,
        message: 'For the sake of Allah.',
      },
      {
        amount: 75.00,
        campaignId: campaign2.id,
        userId: futureMAUser.id,
        paymentMethod: 'CREDIT_CARD',
        status: DonationStatus.COMPLETED,
        isAnonymous: false,
      },
      {
        amount: 1000.00,
        campaignId: campaign3.id,
        userId: user1.id,
        paymentMethod: 'BANK_TRANSFER',
        status: DonationStatus.PENDING,
        isAnonymous: false,
        message: 'Education is important for our future.',
      },
      {
        amount: 500.00,
        campaignId: campaign3.id,
        userId: masjidAdminUser.id,
        paymentMethod: 'CREDIT_CARD',
        status: DonationStatus.COMPLETED,
        isAnonymous: false,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 