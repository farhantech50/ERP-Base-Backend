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

  // 3. Create permissions and assign to Super Admin role
  const permissionsToSeed = [
    { key: "SUPER", label: "Super Admin Access" },
    { key: "CREATE_USER", label: "Create User" },
    { key: "UPDATE_USER", label: "Update User" },
    { key: "VIEW_USER", label: "View User" },
    { key: "DELETE_USER", label: "Delete User" },
  ];

  for (const perm of permissionsToSeed) {
    let existingPerm = await prisma.permission.findUnique({
      where: { key: perm.key },
    });

    if (!existingPerm) {
      existingPerm = await prisma.permission.create({
        data: perm,
      });
      console.log(`Created ${perm.key} permission.`);
    } else {
      console.log(`${perm.key} permission already exists.`);
    }
  }

  // 4. Assign SUPER to Super Admin role
  const superPerm = await prisma.permission.findUnique({ where: { key: "SUPER" } });
  if (superPerm) {
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: superPerm.id,
        },
      },
    });

    if (!existingRolePermission) {
      await prisma.rolePermission.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: superPerm.id,
        },
      });
      console.log(`Assigned SUPER to Super Admin role.`);
    } else {
      console.log(`Super Admin role already has SUPER permission.`);
    }
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
