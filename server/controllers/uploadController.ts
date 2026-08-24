import { Request, Response } from "express";
import cloudinary from "../config/cloudinary.ts";

export const uploadProductImage = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No image provided" });

  const collection = (req.body.collection || req.body.category || "misc").toLowerCase();

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `poster-theory/products/${collection}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: cloudinary.url(result.public_id, {
        width: 400,
        height: 400,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      }),
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
};

export const uploadDesignImage = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No image provided" });

  const userId = (req as any).user.id;

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `poster-theory/custom/${userId}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ error: "Image upload failed" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const { public_id } = req.body;
  if (!public_id || typeof public_id !== 'string') return res.status(400).json({ error: "public_id must be a string" });

  // Validate public_id format to prevent path traversal
  if (public_id.includes('..') || !/^[a-zA-Z0-9/_-]+$/.test(public_id)) {
    return res.status(400).json({ error: "Invalid public_id format" });
  }

  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.is_admin;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Non-admin users can only delete their own uploads
  if (!isAdmin && !public_id.includes(`/custom/${userId}/`)) {
    return res.status(403).json({ error: "You can only delete your own uploads" });
  }

  try {
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
