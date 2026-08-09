import prisma from "../../../config/dbConfig.js";

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ key: "asc" }],
    });

    return res.status(200).json(permissions);
  } catch (error) {
    console.log("Error in getAllPermissions", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: Number(role) },
      include: {
        permission: {
          select: { id: true, key: true, label: true },
        },
      },
    });

    const result = [];
    for (const rp of rolePermissions) {
      result.push({
        id: rp.permission.id,
        key: rp.permission.key,
        label: rp.permission.label,
        module: rp.permission.module,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in getRolePermissions", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const setRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;

    const data = [];
    for (const permissionId of permissionIds) {
      data.push({ roleId: Number(role), permissionId });
    }

    if (data.length > 0) {
      await prisma.rolePermission.createMany({ data });
    }

    return res.status(200).json({ message: "Permissions updated for role" });
  } catch (error) {
    console.log("Error in setRolePermissions", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteRolePermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const existing = await prisma.rolePermission.findFirst({
      where: { roleId: Number(roleId), permissionId: Number(permissionId) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Role permission not found" });
    }

    await prisma.rolePermission.delete({ where: { id: existing.id } });

    return res.status(200).json({ message: "Permission removed from role" });
  } catch (error) {
    console.log("Error in deleteRolePermission", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
