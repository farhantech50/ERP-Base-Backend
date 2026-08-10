import express from "express";
import {
  getMyPermissions,
  getAllPermissions,
  getRolePermissions,
  setRolePermissions,
  deleteRolePermission,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/my-permissions",
  /* #swagger.tags = ['Permission'] */
  protect,
  getMyPermissions,
);

router.get(
  "/",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  getAllPermissions,
);

router.post(
  "/",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  createPermission,
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

router.put(
  "/:id",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  updatePermission,
);

router.delete(
  "/:id",
  /* #swagger.tags = ['Permission'] */
  protect,
  authorizeRoles(1, 2),
  deletePermission,
);



export default router;
