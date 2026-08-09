import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPasswordWithToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  /* #swagger.tags = ['Auth']
     #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password"],
              properties: {
                username: { type: "string", example: "superadmin" },
                password: { type: "string", example: "admin123" }
              }
            }
          }
        }
     }
  */
  loginUser(req, res, next);
});

router.post("/logout", (req, res, next) => {
  /* #swagger.tags = ['Auth'] */
  logoutUser(req, res, next);
});

router.post("/refresh", (req, res, next) => {
  /* #swagger.tags = ['Auth'] */
  refreshAccessToken(req, res, next);
});

router.post("/forgot-password", (req, res, next) => {
  /* #swagger.tags = ['Auth'] */
  forgotPassword(req, res, next);
});

router.post("/reset-password", (req, res, next) => {
  /* #swagger.tags = ['Auth'] */
  resetPasswordWithToken(req, res, next);
});

router.patch("/change-password", protect, (req, res, next) => {
  /* #swagger.tags = ['Auth'] */
  changePassword(req, res, next);
});

export default router;
