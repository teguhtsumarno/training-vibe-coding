import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
