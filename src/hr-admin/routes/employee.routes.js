import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employee.controller.js";
import {
  protect,
  authorizeRoles,
} from "../../core/middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  /* #swagger.tags = ['Employee'] */
  protect,
  authorizeRoles(1, 2, 13, 14),
  createEmployee,
);

router.get(
  "/",
  /* #swagger.tags = ['Employee','Android'] */
  protect,
  getEmployees,
);

router.put(
  "/:id",
  /* #swagger.tags = ['Employee'] */
  protect,
  updateEmployee,
);
export default router;
