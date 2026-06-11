import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

const DEFAULT_LEAVE_TYPES = [
  { name: "Cuti Tahunan", defaultBalance: 12, description: "Cuti tahunan yang diberikan setiap tahun" },
  { name: "Cuti Sakit", defaultBalance: 12, description: "Cuti untuk keperluan kesehatan/sakit" },
  { name: "Cuti Pribadi", defaultBalance: 3, description: "Cuti untuk keperluan pribadi" },
];

async function main() {
  // 1. Seed admin
  const adminUsername = "admin";
  const existingAdmin = await prisma.employee.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    await prisma.employee.create({
      data: {
        name: "System Admin",
        department: "Management",
        position: "Administrator",
        username: adminUsername,
        password: hashPassword("admin123"),
        role: "admin",
      },
    });
    console.log("Admin seeded successfully!");
  } else {
    console.log("Admin already exists.");
  }

  // 2. Seed leave types
  for (const lt of DEFAULT_LEAVE_TYPES) {
    const existing = await prisma.leaveType.findUnique({
      where: { name: lt.name },
    });
    if (!existing) {
      await prisma.leaveType.create({ data: lt });
      console.log(`Leave type "${lt.name}" created.`);
    } else {
      console.log(`Leave type "${lt.name}" already exists.`);
    }
  }

  // 3. Assign leave balances to all employees that don't have them yet
  const allEmployees = await prisma.employee.findMany();
  const allLeaveTypes = await prisma.leaveType.findMany();

  for (const emp of allEmployees) {
    for (const lt of allLeaveTypes) {
      const existing = await prisma.employeeLeaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
          },
        },
      });
      if (!existing) {
        await prisma.employeeLeaveBalance.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
            balance: lt.defaultBalance,
          },
        });
        console.log(`Assigned "${lt.name}" (${lt.defaultBalance} days) to ${emp.name}`);
      }
    }
  }

  // 4. Assign leaveTypeId to existing leave requests that don't have one
  const cutiTahunan = await prisma.leaveType.findUnique({ where: { name: "Cuti Tahunan" } });
  if (cutiTahunan) {
    const updated = await prisma.leaveRequest.updateMany({
      where: { leaveTypeId: null },
      data: { leaveTypeId: cutiTahunan.id },
    });
    if (updated.count > 0) {
      console.log(`Assigned "Cuti Tahunan" to ${updated.count} existing leave requests.`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
