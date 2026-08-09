import prisma from "../../../config/dbConfig.js";

export const getPermissionsForRole = async (roleId) => {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    select: { permission: { select: { key: true } } },
  });

  const permissions = [];
  for (const rp of rolePermissions) {
    permissions.push(rp.permission.key);
  }

  return permissions;
};
