import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Banner from "../models/Banner.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Fallback in-memory storage for demo mode (when MongoDB is not connected)
let memoryBanners = [];

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Upload to Cloudinary
const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve({});
      return;
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vision-banners",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

// GET /api/banners - Get all active banners for the hero slider (public)
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
      return res.json(banners);
    }
    // Demo mode: return from memory
    const sorted = [...memoryBanners].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    console.error("GET banners error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/banners/all - Get all banners including inactive (admin only)
router.get("/all", authMiddleware, async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
      return res.json(banners);
    }
    // Demo mode: return from memory
    const sorted = [...memoryBanners].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    console.error("GET all banners error:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/banners - Create/Upload banner
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "কোনো ছবি সিলেক্ট করা হয়নি" });
    }

    console.log("Uploading to Cloudinary...");
    const imageData = await uploadToCloudinary(req.file);
    console.log("Cloudinary upload success:", imageData.secure_url);

    if (!imageData.secure_url) {
      return res.status(400).json({ message: "ছবি আপলোড করা যায়নি" });
    }

    const bannerData = {
      title: req.body.title || "হিরো ব্যানার",
      image: imageData.secure_url,
      imagePublicId: imageData.public_id || "",
      alt: req.body.alt || "Vision banner",
      link: req.body.link || "",
      isActive: true,
      sortOrder: Number(req.body.sortOrder) || 0,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const banner = await Banner.create(bannerData);
      return res.status(201).json(banner);
    }

    // Demo mode: store in memory
    memoryBanners.push({ ...bannerData, _id: Date.now().toString() });
    console.log("Banner saved in memory (demo mode)");
    res.status(201).json(bannerData);
  } catch (error) {
    console.error("POST banner error:", error);
    res.status(500).json({ message: error.message || "ব্যানার আপলোড করতে সমস্যা হয়েছে" });
  }
});

// PUT /api/banners/:id - Update banner (position, toggle, edit)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "ব্যানার পাওয়া যায়নি" });
    }

    let updateData = {};

    // Handle image update
    if (req.file) {
      const imageData = await uploadToCloudinary(req.file);
      updateData.image = imageData.secure_url;
      updateData.imagePublicId = imageData.public_id || "";
      
      // Delete old image
      if (banner.imagePublicId) {
        try { await cloudinary.uploader.destroy(banner.imagePublicId); } catch (e) {}
      }
    }

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.alt !== undefined) updateData.alt = req.body.alt;
    if (req.body.link !== undefined) updateData.link = req.body.link;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === "true" || req.body.isActive === true;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = Number(req.body.sortOrder);

    const updated = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("PUT banner error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/banners/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: "ব্যানার পাওয়া যায়নি" });
      }
      if (banner.imagePublicId) {
        await cloudinary.uploader.destroy(banner.imagePublicId);
      }
      await Banner.findByIdAndDelete(req.params.id);
      return res.json({ message: "ব্যানার মুছে ফেলা হয়েছে" });
    }

    // Demo mode
    memoryBanners = memoryBanners.filter(b => b._id !== req.params.id);
    res.json({ message: "ব্যানার মুছে ফেলা হয়েছে" });
  } catch (error) {
    console.error("DELETE banner error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;