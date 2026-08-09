import prisma from "../config/dbConfig.js";
import argon2 from "argon2";

async function main() {
  console.log("Seeding database...");

  // 1. Create the Super Admin role in Lookup table if it doesn't exist
  let superAdminRole = await prisma.lookup.findFirst({
    where: { name: "role", value: "Super Admin" },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.lookup.create({
      data: {
        name: "role",
        value: "Super Admin",
      },
    });
    console.log("Created Super Admin role in Lookup table.");
  } else {
    console.log("Super Admin role already exists.");
  }

  // 2. Hash password and create the user
  const hashedPassword = await argon2.hash("admin123");

  const existingUser = await prisma.user.findUnique({
    where: { username: "superadmin" },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        username: "superadmin",
        password: hashedPassword,
        fullName: "Super Admin",
        roleId: superAdminRole.id,
        employeeId: 'EMP0001',
      },
    });
    console.log("Created superadmin user.");
  } else {
    await prisma.user.update({
      where: { username: 'superadmin' },
      data: { employeeId: 'EMP0001' },
    });
    console.log('User superadmin already exists. Updated employeeId to EMP0001.');
  }

  // 3. Create SUPER permission and assign to Super Admin role
  let superPermission = await prisma.permission.findUnique({
    where: { key: "SUPER" },
  });

  if (!superPermission) {
    superPermission = await prisma.permission.create({
      data: {
        key: "SUPER",
        label: "Super Admin Access",
      },
    });
    console.log("Created SUPER permission.");
  } else {
    console.log("SUPER permission already exists.");
  }

  const existingRolePermission = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: superPermission.id,
      },
    },
  });

  if (!existingRolePermission) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: superPermission.id,
      },
    });
    console.log("Assigned SUPER permission to Super Admin role.");
  } else {
    console.log("Super Admin role already has SUPER permission.");
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
