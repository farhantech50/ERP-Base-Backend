import argon2 from "argon2";
import prisma from "../../../config/dbConfig.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      contact,
      address,
      roleId,
      nidNumber,
      dateOfBirth,
      joiningDate,
    } = req.body;

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const hashedPassword = await argon2.hash(password);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName,
          username,
          email,
          password: hashedPassword,
          contact,
          address,
          roleId,
          nidNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: newUser.id },
        data: { employeeId: `EMP${String(newUser.id).padStart(4, "0")}` },
      });

      return updatedUser;
    });

    return res.status(201).json({
      id: result.id,
      employeeId: result.employeeId,
      fullName: result.fullName,
      username: result.username,
      email: result.email,
      roleId: result.roleId,
    });
  } catch (error) {
    console.log("Error in createEmployee", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { id, roleId, page, limit, search } = req.query;

    if (id) {
      const employee = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          username: true,
          email: true,
          role: { select: { id: true, value: true } },
          contact: true,
          address: true,
          nidNumber: true,
          dateOfBirth: true,
          joiningDate: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.status(200).json(employee);
    }

    // 1. Force exclude the super admin (ID 1) from the list queries
    const where = {
      id: { not: 1 },
    };

    if (roleId) {
      const roleIdArr = roleId.split(",").map((id) => Number(id.trim()));
      where.roleId = { in: roleIdArr };
    }

    if (search) {
      where.AND = [
        { id: { not: 1 } },
        {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { employeeId: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const usePagination = page !== undefined && limit !== undefined;
    const take = usePagination ? Number(limit) : undefined;
    const skip = usePagination ? (Number(page) - 1) * Number(limit) : undefined;

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        ...(usePagination && { skip, take }),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          username: true,
          role: { select: { id: true, value: true } },
          isActive: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    if (!usePagination) {
      return res.status(200).json(employees);
    }

    return res.status(200).json({
      data: employees,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.log("Error in getEmployees", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      fullName,
      email,
      contact,
      address,
      roleId,
      nidNumber,
      dateOfBirth,
      joiningDate,
      isActive,
    } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const employee = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(contact !== undefined && { contact }),
        ...(address !== undefined && { address }),
        ...(roleId !== undefined && { roleId }),
        ...(nidNumber !== undefined && { nidNumber }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: new Date(dateOfBirth),
        }),
        ...(joiningDate !== undefined && {
          joiningDate: new Date(joiningDate),
        }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        username: true,
        email: true,
        roleId: true,
        contact: true,
        address: true,
        nidNumber: true,
        dateOfBirth: true,
        joiningDate: true,
        isActive: true,
      },
    });

    return res.status(200).json(employee);
  } catch (error) {
    console.log("Error in updateEmployee", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
