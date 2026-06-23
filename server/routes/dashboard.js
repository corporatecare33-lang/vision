import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Admin from "../models/Admin.js";
import Page from "../models/Page.js";
import Product from "../models/Product.js";
import { categories as fallbackCategories } from "../../src/data/data.js";

const router = express.Router();

// In-memory storage
let inMemoryOrders = [];
let inMemoryAdmins = [
  {
    _id: "admin1",
    username: "superadmin",
    password: "admin123",
    role: "superadmin",
    isActive: true
  },
];
let inMemoryPages = [];
let inMemoryProducts = [];

// Import products from data.js
const initInMemoryProducts = async () => {
  const { products: demoProducts } = await import("../../src/data/data.js");
  inMemoryProducts = demoProducts.map(p => ({ ...p, _id: `prod-${p.id}`, stock: 50, lowStockThreshold: 10 }));
};
initInMemoryProducts();

// Export in-memory data for use in other routes
export { inMemoryOrders, inMemoryAdmins, inMemoryPages, inMemoryProducts };

// ============================================================
// DASHBOARD STATS
// ============================================================
router.get("/stats", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        totalOrders: 0,
        totalSales: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        inCourier: 0,
        cancelledOrders: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0,
        salesGrowth: 0,
        productsGrowth: 0,
        recentOrders: [],
        recentProducts: [],
        inventoryAlerts: [],
        topSellingProducts: [],
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Order.distinct("customer.phone").then((r) => r.length);
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const completedOrders = await Order.countDocuments({ orderStatus: "delivered" });
    const inCourier = await Order.countDocuments({ orderStatus: "shipped" });
    const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });

    // Monthly revenue
    const monthlyAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const monthlyRevenue = monthlyAgg[0]?.total || 0;

    // Last month revenue for growth
    const lastMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const lastMonthRevenue = lastMonthAgg[0]?.total || 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Monthly sales data for chart
    const monthlySalesData = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const inventoryAlerts = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .sort({ stock: 1, updatedAt: -1 })
      .limit(8)
      .lean();

    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          price: { $last: "$items.price" },
        },
      },
      { $sort: { sales: -1, revenue: -1 } },
      { $limit: 5 },
    ]);

    // Fraud suspected orders
    const fraudOrders = await Order.countDocuments({ isFraudSuspected: true });

    res.json({
      totalOrders,
      totalSales,
      totalCustomers,
      totalProducts,
      pendingOrders,
      completedOrders,
      inCourier,
      cancelledOrders,
      monthlyRevenue,
      revenueGrowth,
      ordersGrowth: 0,
      customersGrowth: 0,
      salesGrowth: 0,
      productsGrowth: 0,
      monthlySalesData,
      recentOrders: recentOrders.map((o) => ({
        _id: o._id,
        orderId: o.orderId,
        customer: o.customer,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
      })),
      fraudOrders,
      recentProducts: await Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      inventoryAlerts: inventoryAlerts.map((p) => ({
        _id: p._id,
        id: p.id,
        name: p.name,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        status: p.stock <= 0 ? "out" : "low",
      })),
      topSellingProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// SALES REPORT (for chart)
// ============================================================
router.get("/sales-report", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        monthly: [
          { month: "জানু", sales: 45000, orders: 28 },
          { month: "ফেব্রু", sales: 52000, orders: 35 },
          { month: "মার্চ", sales: 48000, orders: 30 },
          { month: "এপ্রি", sales: 61000, orders: 42 },
          { month: "মে", sales: 78000, orders: 55 },
          { month: "জুন", sales: 85420, orders: 61 },
        ],
        totalSales: 369420,
        totalOrders: 251,
        averageOrderValue: 1472,
      });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
    const monthly = monthlyData.map((d) => ({
      month: monthNames[d._id.month - 1] || `${d._id.month}`,
      sales: d.sales,
      orders: d.orders,
    }));

    const totalSalesAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;
    const totalOrdersCount = await Order.countDocuments({ orderStatus: { $ne: "cancelled" } });
    const averageOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

    // Fill missing months with zero data
    const filledMonthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const existing = monthly.find((m) => m.month === monthNames[monthIdx]);
      filledMonthly.push({
        month: monthNames[monthIdx],
        sales: existing?.sales || 0,
        orders: existing?.orders || 0,
      });
    }

    res.json({
      monthly: filledMonthly,
      totalSales,
      totalOrders: totalOrdersCount,
      averageOrderValue: Math.round(averageOrderValue),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ORDERS
// ============================================================
router.get("/orders", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const { search, status, page = 1, limit = 20 } = req.query;
      let filteredOrders = [...inMemoryOrders];
      
      if (status) {
        filteredOrders = filteredOrders.filter(o => o.orderStatus === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredOrders = filteredOrders.filter(o => 
          o.customer?.name?.toLowerCase().includes(searchLower) || 
          o.customer?.phone?.toLowerCase().includes(searchLower) || 
          o.orderId?.toLowerCase().includes(searchLower)
        );
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedOrders = filteredOrders.slice(skip, skip + parseInt(limit));
      return res.json({ 
        orders: paginatedOrders, 
        total: filteredOrders.length, 
        page: parseInt(page), 
        pages: Math.ceil(filteredOrders.length / parseInt(limit)) 
      });
    }

    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) {
      query.$or = [
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Order.countDocuments(query),
    ]);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "স্ট্যাটাস আপডেট করা হয়েছে" });
    }

    const { orderStatus, paymentStatus, trackingNumber, courierService } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (courierService !== undefined) update.courierService = courierService;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: "অর্ডার পাওয়া যায়নি" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// USERS (Admins)
// ============================================================
router.get("/users", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const users = await Admin.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/status", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "স্ট্যাটাস আপডেট করা হয়েছে" });
    }

    const { isActive } = req.body;
    const user = await Admin.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "ইউজার পাওয়া যায়নি" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "ইউজার আপডেট করা হয়েছে" });
    }

    const { name, email, phone, role } = req.body;
    const user = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "ইউজার পাওয়া যায়নি" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// FRAUD CHECKER
// ============================================================
router.get("/fraud-check", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ flaggedOrders: [], totalFlagged: 0, fraudRate: 0, highRiskAmount: 0, commonPatterns: [] });
    }

    // Fraud detection logic
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    // Find orders with same phone that are high value or multiple
    const duplicatePhoneOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: "$customer.phone",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          orders: { $push: { _id: "$_id", orderId: "$orderId", customer: "$customer", totalAmount: "$totalAmount", orderStatus: "$orderStatus", createdAt: "$createdAt", ipAddress: "$ipAddress" } },
        },
      },
      { $match: { $or: [{ count: { $gte: 3 } }, { totalAmount: { $gte: 10000 } }] } },
    ]);

    // Cancelled orders
    const cancelledOrders = await Order.find({
      orderStatus: "cancelled",
      createdAt: { $gte: oneWeekAgo },
    }).lean();

    // Flagged orders
    const flaggedOrders = duplicatePhoneOrders.flatMap((d) =>
      d.orders.map((o) => ({
        ...o,
        isFraudSuspected: true,
        fraudReason: d.count >= 3
          ? `একই ফোন নম্বরে ${d.count}টি অর্ডার`
          : `উচ্চ মূল্যের অর্ডার (৳${d.totalAmount})`,
      }))
    ).slice(0, 20);

    // Add cancelled orders that are suspicious
    cancelledOrders.forEach((o) => {
      if (!flaggedOrders.find((f) => f._id.toString() === o._id.toString())) {
        flaggedOrders.push({
          ...o,
          isFraudSuspected: true,
          fraudReason: "অর্ডার ক্যান্সেল করা হয়েছে",
        });
      }
    });

    res.json({
      flaggedOrders: flaggedOrders.slice(0, 20),
      totalFlagged: flaggedOrders.length,
      fraudRate: flaggedOrders.length > 0
        ? ((flaggedOrders.length / (await Order.countDocuments({ createdAt: { $gte: oneWeekAgo } }))) * 100).toFixed(1)
        : 0,
      highRiskAmount: flaggedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      commonPatterns: [
        { pattern: "একই ফোনে একাধিক অর্ডার", count: duplicatePhoneOrders.filter((d) => d.count >= 3).length },
        { pattern: "উচ্চ মূল্যের COD অর্ডার", count: duplicatePhoneOrders.filter((d) => d.totalAmount >= 10000).length },
        { pattern: "একাধিকবার ক্যান্সেল", count: cancelledOrders.length },
        { pattern: "পেমেন্ট ফেইল পরে অর্ডার", count: 0 },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/fraud-check/:id/resolve", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "ফ্রড রিপোর্ট রিজল্ভ করা হয়েছে" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isFraudSuspected: false, fraudReason: "" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "অর্ডার পাওয়া যায়নি" });

    res.json({ message: "ফ্রড রিপোর্ট রিজল্ভ করা হয়েছে", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// PAGES (Page Management)
// ============================================================
router.get("/pages", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const pages = await Page.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/pages", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ _id: Date.now().toString(), ...req.body, slug: req.body.name?.toLowerCase().replace(/\s+/g, "-"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/pages/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ _id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
    }

    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ message: "পেজ পাওয়া যায়নি" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/pages/:id/status", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "স্ট্যাটাস আপডেট করা হয়েছে" });
    }

    const { isActive } = req.body;
    const page = await Page.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!page) return res.status(404).json({ message: "পেজ পাওয়া যায়নি" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/pages/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "পেজ ডিলিট করা হয়েছে" });
    }

    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: "পেজ পাওয়া যায়নি" });
    res.json({ message: "পেজ ডিলিট করা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
