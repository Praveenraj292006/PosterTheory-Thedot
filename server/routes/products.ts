import express from "express";
import { getProducts, getProductPricing, getCustomizeConfig, getPublicCollections, getPublicLayouts, getHomepageData } from "../controllers/productController.ts";

const router = express.Router();

router.get("/", getProducts);
router.get("/pricing", getProductPricing);
router.get("/customize-config", getCustomizeConfig);
router.get("/collections", getPublicCollections);
router.get("/layouts", getPublicLayouts);
router.get("/homepage", getHomepageData);

export default router;
