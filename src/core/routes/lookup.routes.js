import express from "express";
import {
  getLookupByName,
  createLookup,
  updateLookup,
  deleteLookup,
  getLookups,
} from "../controllers/lookup.controller.js";

import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/list", protect, (req, res, next) => {
  /* #swagger.tags = ['Lookup'] */
  getLookups(req, res, next);
});

router.get("/values/:name", protect, (req, res, next) => {
  /* #swagger.tags = ['Lookup']
     #swagger.parameters['name'] = {
        in: 'path',
        required: true,
        type: 'string',
        example: 'tuitionPostStatus'
     }
  */
  getLookupByName(req, res, next);
});

router.post("/", protect, authorizeRoles(1), (req, res, next) => {
  /* #swagger.tags = ['Lookup']
     #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "value"],
                properties: {
                  name: { type: "string", example: "tuitionPostStatus" },
                  value: { type: "string", example: "pending" }
                }
              }
            }
          }
        }
     }
  */
  createLookup(req, res, next);
});

router.put("/:id", protect, authorizeRoles(1), (req, res, next) => {
  /* #swagger.tags = ['Lookup']
     #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'integer',
        example: 1
     }
     #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                value: { type: "string", example: "approved" },
                isActive: { type: "boolean", example: true }
              }
            }
          }
        }
     }
  */
  updateLookup(req, res, next);
});

router.delete("/:id", protect, authorizeRoles(1), (req, res, next) => {
  /* #swagger.tags = ['Lookup']
     #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'integer',
        example: 1
     }
  */
  deleteLookup(req, res, next);
});

export default router;
