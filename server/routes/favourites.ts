import express from "express";
import {
  getFavourites,
  toggleFavourite,
  syncFavourites,
  removeFavourite,
} from "../controllers/favouritesController.ts";

import { authenticateToken } from "../middleware/authMiddleware.ts";

const router = express.Router();

router.get("/", authenticateToken, getFavourites);
router.post("/", authenticateToken, toggleFavourite);
router.post("/sync", authenticateToken, syncFavourites);
router.delete("/:productId", authenticateToken, removeFavourite);

export default router;