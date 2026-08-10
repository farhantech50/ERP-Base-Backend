import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../../config/dbConfig.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      roleId: user.roleId,
      roleName: user.role.value,
      fullName: user.fullName,
      username: user.username,
    },
    process.env.JWT_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};
export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

export const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + process.env.REFRESH_TOKEN_EXPIRY_DAYS,
  );

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(process.env.REFRESH_TOKEN_KEY, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: process.env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
};
