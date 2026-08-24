import { Router } from "express";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.ts";
import { csrfProtection } from "../middleware/csrf.ts";
import { exportHighRes } from "../controllers/exportController.ts";

const router = Router();

router.post("/highres", csrfProtection, authenticateToken, isAdmin, exportHighRes);

export default router;
