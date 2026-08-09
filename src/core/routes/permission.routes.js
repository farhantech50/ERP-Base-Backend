import express from "express";
import {
  getAllPermissions,
  getRolePermissions,
  setRolePermissions,
  deleteRolePermission,
} from "../controllers/permission.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  getAllPermissions,
);

router.get(
  "/role/:role",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  getRolePermissions,
);

router.put(
  "/role/:role",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  setRolePermissions,
);
router.delete(
  "/role",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  deleteRolePermission,
);

export default router;
