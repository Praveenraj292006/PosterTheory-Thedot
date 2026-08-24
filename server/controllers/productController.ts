import { Request, Response } from "express";
import pool from "../config/db.ts";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { filter, limit } = req.query;
    let where = "WHERE p.status = 'active'";
    if (filter === 'trending') where += " AND p.is_trending = true";
    else if (filter === 'new_arrival') where += " AND p.is_new_arrival = true";
    else if (filter === 'featured') where += " AND p.is_featured = true";
    else if (filter === 'bestseller') where += " AND p.is_bestseller = true";

    const limitNum = limit ? Math.min(parseInt(limit as string, 10) || 100, 100) : 100;

    const { rows } = await pool.query(`
      SELECT p.*, c.name as collection_name, c.slug as collection_slug
      FROM products p
      LEFT JOIN collections c ON p.collection_id = c.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $1
    `, [limitNum]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductPricing = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.price, s.name as size_name, s.id as size_id, l.name as layout_name, l.id as layout_id
      FROM pricing p
      JOIN sizes s ON p.size_id = s.id
      JOIN layouts l ON p.layout_id = l.id
      ORDER BY s.width_mm DESC, l.panel_count
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pricing" });
  }
};

// Public endpoint: returns all sizes, layouts, and pricing for the customize page
export const getCustomizeConfig = async (req: Request, res: Response) => {
  try {
    const [sizesRes, layoutsRes, pricingRes, frameRes, materialRes] = await Promise.all([
      pool.query("SELECT * FROM sizes WHERE is_active = true ORDER BY width_mm DESC"),
      pool.query("SELECT * FROM layouts WHERE is_active = true ORDER BY panel_count"),
      pool.query(`
        SELECT p.price, s.name as size_name, l.name as layout_name
        FROM pricing p
        JOIN sizes s ON p.size_id = s.id
        JOIN layouts l ON p.layout_id = l.id
      `),
      pool.query("SELECT * FROM frame_pricing ORDER BY size_name").catch(() => ({ rows: [] })),
      pool.query("SELECT * FROM material_pricing ORDER BY material").catch(() => ({ rows: [] })),
    ]);
    res.json({
      sizes: sizesRes.rows,
      layouts: layoutsRes.rows,
      pricing: pricingRes.rows,
      framePricing: frameRes.rows,
      materialPricing: materialRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch config" });
  }
};

export const getPublicCollections = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT id, name, slug FROM collections WHERE is_active = true ORDER BY name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

export const getPublicLayouts = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT id, name, panel_count FROM layouts WHERE is_active = true ORDER BY panel_count");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch layouts" });
  }
};

export const getHomepageData = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT section, data FROM homepage_config");
    const result: Record<string, any> = {};
    for (const row of rows) result[row.section] = row.data;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch homepage data" });
  }
};
