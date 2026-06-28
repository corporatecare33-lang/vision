import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Coupon from "../models/Coupon.js";

const router = express.Router();

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

// GET /api/coupons/validate/:code - Public coupon validation
router.get("/validate/:code", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const coupon = await Coupon.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true,
    }).lean();

    if (!coupon) return res.status(404).json({ message: "কুপন কোড সঠিক নয়" });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "কুপন মেয়াদ শেষ হয়েছে" });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "কুপন ব্যবহারের সীমা শেষ হয়েছে" });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/coupons - Get all coupons
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/coupons - Create coupon
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ ...req.body, _id: Date.now().toString() });
    }
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/coupons/:id - Update coupon
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ _id: req.params.id, ...req.body });
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/coupons/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "Deleted" });
    }
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;