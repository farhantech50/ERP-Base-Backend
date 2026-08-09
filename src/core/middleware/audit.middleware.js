import prisma from "../../../config/dbConfig.js";

export const auditLogger = (req, res, next) => {
  res.on("finish", () => {
    prisma.auditLog
      .create({
        data: {
          userId: req.user?.id ?? null,
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          ip: req.ip,
          userAgent: req.headers["user-agent"] ?? null,
        },
      })
      .catch((error) => {
        console.log("Error writing audit log", error);
      });
  });

  next();
};
