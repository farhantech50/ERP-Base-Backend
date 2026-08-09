import { Router } from "express";
import authRoutes from "./core/routes/auth.routes.js";
import permissionRoutes from "./core/routes/permission.routes.js";
import lookupRoutes from "./core/routes/lookup.routes.js";
import employeeRoutes from "./hr-admin/routes/employee.routes.js";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/permissions", permissionRoutes);
router.use("/api/lookup", lookupRoutes);
router.use("/api/employees", employeeRoutes);

export default router;
