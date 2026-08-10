import argon2 from "argon2";
import crypto from "crypto";
import prisma from "../../../config/dbConfig.js";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  setRefreshTokenCookie,
} from "../utils/token.js";
import { sendPasswordResetEmail } from "../../../config/mailer.js";

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const clientType = req.headers["x-client-type"];

    if (!["web", "android", "ios"].includes(clientType)) {
      return res.status(400).json({
        error: "Invalid client type",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await argon2.verify(user.password, password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is disabled" });
    }

    const refreshToken = generateRefreshToken();

    await saveRefreshToken(user.id, refreshToken);

    const accessToken = generateAccessToken(user);

    const responseData = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      username: user.username,
      roleId: user.roleId,
      role: user.role.value,
      accessToken,
    };

    if (clientType === "web") {
      setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json(responseData);
    } else if (clientType === "android" || clientType === "ios") {
      return res.status(200).json({
        ...responseData,
        refreshToken,
      });
    }
  } catch (error) {
    console.log("Error in loginUser", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const refreshAccessToken = async (req, res) => {
  try {
    const clientType = req.headers["x-client-type"];

    let token;

    if (clientType === "web") {
      token = req.cookies[process.env.REFRESH_TOKEN_KEY];
    } else if (clientType === "android" || clientType === "ios") {
      token = req.headers["x-refresh-token"];
    }

    if (!token) {
      return res.status(401).json({
        error: "No refresh token provided",
      });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({
        error: "Invalid or expired refresh token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: stored.userId,
      },
      include: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Invalid user",
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.log("Error in refreshAccessToken", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const clientType = req.headers["x-client-type"];

    let token;

    if (clientType === "web") {
      token = req.cookies[process.env.REFRESH_TOKEN_KEY];
    } else if (clientType === "android" || clientType === "ios") {
      token = req.headers["x-refresh-token"];
    }

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: {
          token,
        },
      });
    }

    if (clientType === "web") {
      res.clearCookie(process.env.REFRESH_TOKEN_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logoutUser", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    console.log("changePassword called with:", {
      userId,
      currentPassword,
      newPassword,
    });
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCorrect = await argon2.verify(user.password, currentPassword);
    if (!isCorrect) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return res
      .status(200)
      .json({ message: "Password changed successfully. Please login again." });
  } catch (error) {
    console.log("Error in changePassword", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPasswordWithToken", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
