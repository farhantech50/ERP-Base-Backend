import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};
const SUPER_ADMIN_ROLE_ID = 1;
export const authorizeRoles = (...roleIds) => {
  return (req, res, next) => {
    // Super Admin always has access
    if (req.user.roleId === SUPER_ADMIN_ROLE_ID) {
      return next();
    }

    if (roleIds.includes("All")) {
      return next();
    }

    if (!roleIds.includes(req.user.roleId)) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    next();
  };
};
