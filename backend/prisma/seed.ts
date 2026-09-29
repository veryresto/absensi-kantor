import { PrismaClient, Role } from './generated/primary-client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create HR Admin
  const admin = await prisma.employee.upsert({
    where: { email: 'hr.admin@veryresto.com' },
    update: {},
    create: {
      name: 'Bambang HRD',
      email: 'hr.admin@veryresto.com',
      password: passwordHash,
      position: 'HR Manager',
      phone: '081234567890',
      role: Role.HR_ADMIN,
    },
  });
  console.log('Created Admin:', admin.email);

  // 2. Create Employees
  const emp1 = await prisma.employee.upsert({
    where: { email: 'budi.santoso@veryresto.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'budi.santoso@veryresto.com',
      password: passwordHash,
      position: 'Software Engineer',
      phone: '08111222333',
      role: Role.EMPLOYEE,
    },
  });

  const emp2 = await prisma.employee.upsert({
    where: { email: 'siti.aminah@veryresto.com' },
    update: {},
    create: {
      name: 'Siti Aminah',
      email: 'siti.aminah@veryresto.com',
      password: passwordHash,
      position: 'UI/UX Designer',
      phone: '08222333444',
      role: Role.EMPLOYEE,
    },
  });

  const emp3 = await prisma.employee.upsert({
    where: { email: 'dewi.lestari@veryresto.com' },
    update: {},
    create: {
      name: 'Dewi Lestari',
      email: 'dewi.lestari@veryresto.com',
      password: passwordHash,
      position: 'Product Owner',
      phone: '08333444555',
      role: Role.EMPLOYEE,
    },
  });

  console.log('Created Employees:', emp1.email, emp2.email, emp3.email);

  // 3. Create Sample Attendance records for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  // Seed sample attendances for past days in current month
  const sampleDays = ['01', '02', '03', '04', '05', '10', '15', '20', '22'];

  for (const day of sampleDays) {
    const dateStr = `${year}-${month}-${day}`;

    // Skip if day is in future
    if (new Date(dateStr) > today) continue;

    const clockIn = new Date(`${dateStr}T08:00:00.000Z`);
    const clockOut = new Date(`${dateStr}T17:00:00.000Z`);

    await prisma.attendance.createMany({
      data: [
        {
          employeeId: emp1.id,
          date: dateStr,
          clockIn,
          clockOut,
          status: 'PULANG',
        },
        {
          employeeId: emp2.id,
          date: dateStr,
          clockIn,
          clockOut,
          status: 'PULANG',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
