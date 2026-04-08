import express from "express";
import {
  createVersion,
  getAllVersions,
  getVersionById,
  deleteVersion,
} from "../controllers/versionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAllVersions);
router.get("/:id", protect, getVersionById);
router.post("/", protect, createVersion);
router.delete("/:id", protect, deleteVersion);

export default router;
