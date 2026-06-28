import express from "express";
import mongoose from "mongoose";
import FlashSale from "../models/FlashSale.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/flashsales - Get all active flash sales
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const { all } = req.query;
    const query = all ? {} : { isActive: true };
    const sales = await FlashSale.find(query).sort({ createdAt: -1 }).lean();
    
    // Fetch product images for each flash sale
    const enriched = await Promise.all(sales.map(async (sale) => {
      const product = await Product.findOne({ id: sale.productId }).select("image name price originalPrice").lean();
      return { ...sale, productImage: product?.image || "", productPrice: product?.price || 0, productOriginalPrice: product?.originalPrice || 0 };
    }));
    
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/flashsales
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const sale = await FlashSale.create(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/flashsales/:id
router.put("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: "ফ্ল্যাশ সেল পাওয়া যায়নি" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/flashsales/:id
router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "মুছে ফেলা হয়েছে" });
    }
    const sale = await FlashSale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: "ফ্ল্যাশ সেল পাওয়া যায়নি" });
    res.json({ message: "ফ্ল্যাশ সেল মুছে ফেলা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;