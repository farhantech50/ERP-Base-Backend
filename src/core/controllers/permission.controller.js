import prisma from "../../../config/dbConfig.js";
import { getPermissionsForRole } from "../utils/permission.js";

export const getMyPermissions = async (req, res) => {
  try {
    const roleId = req.user.roleId;
    if (!roleId) {
      return res.status(400).json({ error: "No role ID found for user" });
    }

    const permissions = await getPermissionsForRole(roleId);
    return res.status(200).json(permissions);
  } catch (error) {
    console.log("Error in getMyPermissions", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { key: { contains: search, mode: "insensitive" } },
            { label: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ key: "asc" }],
      }),
      prisma.permission.count({ where }),
    ]);

    return res.status(200).json({
      data: permissions,
      total,
      page,
      limit,
    });
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

export const createPermission = async (req, res) => {
  try {
    const { key, label } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: "Permission key is required" });
    }

    const existing = await prisma.permission.findUnique({
      where: { key }
    });

    if (existing) {
      return res.status(400).json({ error: "Permission with this key already exists" });
    }

    const permission = await prisma.permission.create({
      data: { key, label }
    });

    return res.status(201).json(permission);
  } catch (error) {
    console.log("Error in createPermission", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, label } = req.body;

    const existing = await prisma.permission.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: "Permission not found" });
    }

    if (key && key !== existing.key) {
      const keyExists = await prisma.permission.findUnique({ where: { key } });
      if (keyExists) {
        return res.status(400).json({ error: "Permission with this key already exists" });
      }
    }

    const permission = await prisma.permission.update({
      where: { id: Number(id) },
      data: { key, label }
    });

    return res.status(200).json(permission);
  } catch (error) {
    console.log("Error in updatePermission", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.permission.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: "Permission not found" });
    }

    await prisma.permission.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.log("Error in deletePermission", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
