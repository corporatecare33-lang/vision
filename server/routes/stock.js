import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";

const router = express.Router();

// GET /api/stock/products - Get all products with stock info
router.get("/products", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const { search, category, stockStatus } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (stockStatus === "low") {
      query.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    } else if (stockStatus === "out") {
      query.stock = 0;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/stock/products/:id/update - Update stock
router.put("/products/:id/update", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "স্টক আপডেট করা হয়েছে" });
    }

    const { type, quantity, reason, performedBy } = req.body;
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "পণ্য পাওয়া যায়নি" });
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    if (type === "add") {
      newStock = previousStock + quantity;
    } else if (type === "subtract") {
      newStock = Math.max(0, previousStock - quantity);
    } else if (type === "set") {
      newStock = Math.max(0, quantity);
    }

    product.stock = newStock;
    await product.save();

    // Log transaction
    await StockTransaction.create({
      productId: product.id,
      productName: product.name,
      type,
      quantity: type === "set" ? newStock : quantity,
      previousStock,
      newStock,
      reason: reason || "",
      reference: req.body.reference || "",
      performedBy: performedBy || "admin",
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stock/transactions - Get stock transaction history
router.get("/transactions", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const { page = 1, limit = 50, productId } = req.query;
    const query = {};
    if (productId) query.productId = productId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      StockTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StockTransaction.countDocuments(query),
    ]);

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stock/alerts - Get low stock alerts
router.get("/alerts", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ lowStock: [], outOfStock: [], total: 0 });
    }

    const allProducts = await Product.find().lean();
    const lowStock = allProducts.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
    );
    const outOfStock = allProducts.filter((p) => p.stock === 0);

    res.json({
      lowStock,
      outOfStock,
      total: lowStock.length + outOfStock.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;