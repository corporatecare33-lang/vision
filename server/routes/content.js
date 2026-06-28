import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Blog from "../models/Blog.js";
import Review from "../models/Review.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = (file, folder = "vision-content") =>
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

// ============ BLOGS ============

// GET /api/content/blogs
router.get("/blogs", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const { all } = req.query;
    const query = all ? {} : { isActive: true };
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/content/blogs/:slug
router.get("/blogs/:slug", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();
    if (!blog) return res.status(404).json({ message: "ব্লগ পাওয়া যায়নি" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/content/blogs
router.post("/blogs", upload.single("image"), async (req, res) => {
  try {
    let imageData = {};
    if (req.file) imageData = await uploadToCloudinary(req.file);
    
    const data = {
      title: req.body.title,
      slug: req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      content: req.body.content || "",
      excerpt: req.body.excerpt || "",
      image: imageData.secure_url || req.body.image || "",
      imagePublicId: imageData.public_id || "",
      author: req.body.author || "Admin",
      tags: req.body.tags ? (typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags) : [],
      isActive: true,
    };
    
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const blog = await Blog.create(data);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/content/blogs/:id
router.put("/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const imageData = await uploadToCloudinary(req.file);
      updateData.image = imageData.secure_url;
      updateData.imagePublicId = imageData.public_id;
    }
    if (updateData.tags && typeof updateData.tags === "string") {
      try { updateData.tags = JSON.parse(updateData.tags); } catch (e) {}
    }
    
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: "ব্লগ পাওয়া যায়নি" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/content/blogs/:id
router.delete("/blogs/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ message: "মুছে ফেলা হয়েছে" });
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "ব্লগ পাওয়া যায়নি" });
    if (blog.imagePublicId) await cloudinary.uploader.destroy(blog.imagePublicId).catch(() => null);
    res.json({ message: "ব্লগ মুছে ফেলা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ REVIEWS ============

// GET /api/content/reviews
router.get("/reviews", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const { all, productId } = req.query;
    const query = {};
    if (!all) query.isApproved = true;
    if (productId) query.productId = productId;
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/content/reviews
router.post("/reviews", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/content/reviews/:id
router.put("/reviews/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: "রিভিউ পাওয়া যায়নি" });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/content/reviews/:id
router.delete("/reviews/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ message: "মুছে ফেলা হয়েছে" });
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "রিভিউ পাওয়া যায়নি" });
    res.json({ message: "রিভিউ মুছে ফেলা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;