import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Category from "../models/Category.js";
import { categories as fallbackCategories } from "../../src/data/data.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload helper
const uploadToCloudinary = (file, folder = "vision-categories") =>
  new Promise((resolve, reject) => {
    if (!file) return resolve({});
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

const parseSubcategories = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(fallbackCategories);
    }
    const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(cats.length > 0 ? cats : fallbackCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/all - Admin only, includes inactive
router.get("/all", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(fallbackCategories);
    }
    const cats = await Category.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(cats.length > 0 ? cats : fallbackCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/:id
router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const cat = fallbackCategories.find(c => c.id === req.params.id);
      return cat ? res.json(cat) : res.status(404).json({ message: "Category not found" });
    }
    const cat = await Category.findOne({ id: req.params.id }).lean();
    if (!cat) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories - with optional image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageData = {};
    if (req.file) {
      imageData = await uploadToCloudinary(req.file);
    }

    const categoryData = {
      id: req.body.id,
      name: req.body.name,
      shortName: req.body.shortName || "",
      path: req.body.path || `/category/${req.body.id}`,
      tone: req.body.tone || "from-cyan-50 via-white to-blue-100",
      accent: req.body.accent || "#0b3474",
      image: imageData.secure_url || req.body.image || "",
      imagePublicId: imageData.public_id || "",
      tagline: req.body.tagline || "",
      description: req.body.description || "",
      isActive: req.body.isActive !== "false",
      sortOrder: Number(req.body.sortOrder) || 0,
      subcategories: parseSubcategories(req.body.subcategories),
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({ ...categoryData, _id: `cat-${Date.now()}` });
    }
    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id - with optional image upload
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // If there's a file, upload to Cloudinary
    if (req.file) {
      const imageData = await uploadToCloudinary(req.file);
      updateData.image = imageData.secure_url;
      updateData.imagePublicId = imageData.public_id;
      
      // Delete old image from Cloudinary if exists
      if (req.body.oldImagePublicId) {
        try {
          await cloudinary.uploader.destroy(req.body.oldImagePublicId);
        } catch (e) { /* ignore */ }
      }
    }

    // Parse subcategories if sent as JSON string
    if (typeof updateData.subcategories === "string") {
      updateData.subcategories = parseSubcategories(updateData.subcategories);
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({ ...updateData, id: req.params.id, _id: `cat-${Date.now()}` });
    }

    const category = await Category.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!category) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ ok: true });
    }
    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    
    // Delete image from Cloudinary if exists
    if (category.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(category.imagePublicId);
      } catch (e) { /* ignore */ }
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id/subcategories - Add/update subcategories
router.put("/:id/subcategories", async (req, res) => {
  try {
    const subcategories = parseSubcategories(req.body.subcategories);
    if (mongoose.connection.readyState !== 1) {
      return res.json({ id: req.params.id, subcategories });
    }
    const category = await Category.findOneAndUpdate({ id: req.params.id }, { subcategories }, { new: true });
    if (!category) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
