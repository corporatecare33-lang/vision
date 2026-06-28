import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { createReadStream, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import Product from "./models/Product.js";
import Admin from "./models/Admin.js";
import Order from "./models/Order.js";
import Page from "./models/Page.js";
import Category from "./models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
import dashboardRoutes, { inMemoryOrders, inMemoryProducts, inMemoryAdmins } from "./routes/dashboard.js";
import stockRoutes from "./routes/stock.js";
import categoryRoutes from "./routes/categories.js";
import bannerRoutes from "./routes/banner.js";
import settingsRoutes from "./routes/settings.js";
import couponRoutes from "./routes/coupons.js";
import flashsaleRoutes from "./routes/flashsales.js";
import contentRoutes from "./routes/content.js";
import courierRoutes from "./routes/courier.js";
import contactRoutes from "./routes/contact.js";
import { connectDatabase } from "./config/database.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: "*" }));
app.use(express.json());

// In-memory categories (from data.js)
let inMemoryCategories = [];
let inMemorySettings = {};

// Initialize in-memory categories with demo data
const initInMemoryCategories = async () => {
  const { categories: demoCategories } = await import("../src/data/data.js");
  inMemoryCategories = demoCategories;
};
initInMemoryCategories();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseSpecs = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parsePriceOptions = (value) => {
  if (Array.isArray(value)) return value.map(o => ({ label: String(o.label || ""), price: Number(o.price || 0) })).filter(o => o.label);
  if (!value) return [];
  try { return JSON.parse(value).map(o => ({ label: String(o.label || ""), price: Number(o.price || 0) })).filter(o => o.label); }
  catch { return []; }
};

const normalizeProduct = (body, imageData = {}) => {
  const baseId = body.id || `${body.name || "product"}-${body.model || Date.now()}`;
  
  // Parse existing images from JSON if provided
  let existingImages = [];
  if (body.existingImages) {
    try {
      existingImages = JSON.parse(body.existingImages);
    } catch (e) {
      existingImages = [];
    }
  }
  
  const mergedImages = [
    ...(Array.isArray(existingImages) ? existingImages : []),
    ...(imageData.images || []),
  ].filter(Boolean);
  
  // For public IDs, we need to keep the ones that correspond to existing images (but we don't track that here, so just keep existing imagePublicIds and add new ones)
  const mergedImagePublicIds = [
    ...(Array.isArray(body.imagePublicIds) ? body.imagePublicIds : []),
    ...(imageData.imagePublicIds || []),
  ].filter(Boolean);

  return {
    id: slugify(baseId),
    name: body.name,
    model: body.model,
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : 0,
    category: body.category,
    subcategory: body.subcategory || "",
    visual: body.visual || "fridge",
    color: body.color || "#0b3474",
    image: imageData.secure_url || body.image || "",
    imagePublicId: imageData.public_id || body.imagePublicId || "",
    images: mergedImages,
    imagePublicIds: mergedImagePublicIds,
    description: body.description || "",
    specs: parseSpecs(body.specs),
    stock: body.stock !== undefined ? Number(body.stock) : 10,
    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : 5,
    isActive: parseBoolean(body.isActive, true),
    featured: parseBoolean(body.featured, false),
    isNewArrival: parseBoolean(body.isNewArrival, false),
    isBestSeller: parseBoolean(body.isBestSeller, false),
    priceOptions: parsePriceOptions(body.priceOptions),
  };
};

const uploadToCloudinary = (file, folder = "vision-products") =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve({});
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });

const uploadManyToCloudinary = async (files = [], folder = "vision-products") => {
  const uploaded = await Promise.all(files.map((file) => uploadToCloudinary(file, folder)));
  return {
    images: uploaded.map((item) => item.secure_url).filter(Boolean),
    imagePublicIds: uploaded.map((item) => item.public_id).filter(Boolean),
  };
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "vision-dashboard-api",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Root route
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head><title>Vision Dashboard API</title></head>
      <body>
        <h1>🚀 Vision Dashboard API is Running!</h1>
        <p>Health Check: <a href="/api/health">/api/health</a></p>
        <p>Frontend: Go to <a href="http://localhost:5173">http://localhost:5173</a></p>
      </body>
    </html>
  `);
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin Routes
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "ইউজারনেম আবশ্যক" });
    }
    
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: username?.toLowerCase() },
      ],
    });
    
    if (existingAdmin) {
      const field = existingAdmin.email === email?.toLowerCase() ? "ইমেইল" : "ইউজারনেম";
      return res.status(400).json({ message: `এই ${field} ইতিমধ্যে ব্যবহার হচ্ছে` });
    }
    
    const admin = await Admin.create({
      name,
      username,
      email,
      password, // pre-save hook auto-hash করবে
      role: role || "admin",
    });
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );
    
    res.status(201).json({
      token,
      admin: admin.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginId = username || req.body.email;
    
    let admin = null;
    if (mongoose.connection.readyState === 1) {
      // Real DB mode - schema.statics.findByCredentials ব্যবহার করে
      admin = await Admin.findByCredentials(loginId);
      if (admin) {
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: "ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড!" });
        }
        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });
      }
    } else {
      // In-memory mode
      admin = inMemoryAdmins.find(a => 
        (a.username === loginId || a.email === loginId) && 
        a.password === password
      );
    }

    if (!admin) {
      return res.status(400).json({ message: "ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড!" });
    }
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );
    
    res.json({
      token,
      admin: admin.toJSON ? admin.toJSON() : { ...admin, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix existing admins - add username field
app.post("/api/admin/fix-usernames", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const result = await Admin.updateMany(
      { username: { $exists: false } },
      { $set: { username: "superadmin" } }
    );

    res.json({ message: `Fixed ${result.modifiedCount} admin(s)`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed Categories
const seedCategoriesData = [
  {
    id: "tvs", name: "TVs", shortName: "Televisions", path: "/category/tvs",
    tone: "from-cyan-50 via-white to-blue-100", accent: "#0b3474", image: "",
    tagline: "Brilliant screens for every room",
    description: "Smart entertainment, sharp color, and immersive sound for modern homes.",
    isActive: true, sortOrder: 1,
    subcategories: [
      { id: "smart-tv", name: "Smart TV", tagline: "Streaming-ready displays with easy controls.", path: "/category/tvs/smart-tv", banner: "/banners/smart-tv.jpg" },
      { id: "android-tv", name: "Android TV", tagline: "Apps, voice search, and cinematic clarity.", path: "/category/tvs/android-tv", banner: "/banners/android-tv.jpg" },
      { id: "led-tv", name: "LED TV", tagline: "Reliable everyday entertainment.", path: "/category/tvs/led-tv", banner: "/banners/led-tv.jpg" },
      { id: "4k-uhd-tv", name: "4K UHD TV", tagline: "Ultra-sharp picture with richer contrast.", path: "/category/tvs/4k-uhd-tv", banner: "/banners/4k-uhd-tv.jpg" },
    ],
  },
  {
    id: "kettles", name: "Kettles", shortName: "Kettles", path: "/category/kettles",
    tone: "from-cyan-50 via-white to-emerald-50", accent: "#28c7cf", image: "",
    tagline: "Fast boiling, clean design",
    description: "Compact kitchen essentials for tea, coffee, and everyday cooking.",
    isActive: true, sortOrder: 2,
    subcategories: [
      { id: "electric-kettle", name: "Electric Kettle", tagline: "Quick boil performance with durable bodies.", path: "/category/kettles/electric-kettle", banner: "/banners/electric-kettle.jpg" },
      { id: "smart-kettle", name: "Smart Kettle", tagline: "Temperature presets and keep-warm comfort.", path: "/category/kettles/smart-kettle", banner: "/banners/smart-kettle.jpg" },
    ],
  },
  {
    id: "refrigerators", name: "Refrigerators / Freezers", shortName: "Cooling", path: "/category/refrigerators",
    tone: "from-blue-50 via-white to-cyan-100", accent: "#0b3474", image: "",
    tagline: "Freshness made beautifully simple",
    description: "Energy-aware cooling systems for homes, stores, and busy kitchens.",
    isActive: true, sortOrder: 3,
    subcategories: [
      { id: "side-by-side", name: "Side by Side", tagline: "Wide storage, dispenser-ready convenience.", path: "/category/refrigerators/side-by-side", banner: "/banners/side-by-side.jpg" },
      { id: "no-frost", name: "No Frost", tagline: "Even cooling without manual defrosting.", path: "/category/refrigerators/no-frost", banner: "/banners/no-frost.jpg" },
      { id: "direct-cool", name: "Direct Cool", tagline: "Durable cooling for everyday family use.", path: "/category/refrigerators/direct-cool", banner: "/banners/direct-cool.jpg" },
      { id: "beverage-cooler", name: "Beverage Cooler", tagline: "Commercial display cooling for drinks.", path: "/category/refrigerators/beverage-cooler", banner: "/banners/beverage-cooler.jpg" },
      { id: "commercial-freezer", name: "Deep Freezer", tagline: "High-capacity frozen storage.", path: "/category/refrigerators/commercial-freezer", banner: "/banners/commercial-freezer.jpg" },
      { id: "four-door", name: "Four Door", tagline: "Flexible premium storage zones.", path: "/category/refrigerators/four-door", banner: "/banners/four-door.jpg" },
      { id: "single-door", name: "Single Door", tagline: "Compact in size, big on freshness.", path: "/category/refrigerators/single-door", banner: "/banners/single-door.jpg" },
    ],
  },
  {
    id: "home-appliances", name: "Home Appliances", shortName: "Home Appliances", path: "/category/home-appliances",
    tone: "from-cyan-50 via-white to-slate-50", accent: "#159ba5", image: "",
    tagline: "Daily comfort, quietly handled",
    description: "Practical home appliances for cleaning, comfort, and routine care.",
    isActive: true, sortOrder: 4,
    subcategories: [
      { id: "washing-machine", name: "Washing Machine", tagline: "Gentle wash programs with strong motors.", path: "/category/home-appliances/washing-machine", banner: "/banners/washing-machine.jpg" },
      { id: "air-conditioner", name: "Air Conditioner", tagline: "Efficient cooling for hot days.", path: "/category/home-appliances/air-conditioner", banner: "/banners/air-conditioner.jpg" },
      { id: "microwave-oven", name: "Microwave Oven", tagline: "Fast heating, cooking, and reheating.", path: "/category/home-appliances/microwave-oven", banner: "/banners/microwave-oven.jpg" },
      { id: "fan", name: "Fan", tagline: "Reliable air flow for every room.", path: "/category/home-appliances/fan", banner: "/banners/fan.jpg" },
    ],
  },
  {
    id: "kitchen-appliances", name: "Kitchen Appliances", shortName: "Kitchen", path: "/category/kitchen-appliances",
    tone: "from-emerald-50 via-white to-cyan-50", accent: "#159ba5", image: "",
    tagline: "Helpful tools for everyday cooking",
    description: "Smart kitchen appliances for faster prep, cooking, and serving.",
    isActive: true, sortOrder: 5,
    subcategories: [
      { id: "rice-cooker", name: "Rice Cooker", tagline: "Simple cooking with steady heat control.", path: "/category/kitchen-appliances/rice-cooker", banner: "/banners/rice-cooker.jpg" },
      { id: "blender", name: "Blender", tagline: "Smooth blending for drinks and recipes.", path: "/category/kitchen-appliances/blender", banner: "/banners/blender.jpg" },
      { id: "induction-cooker", name: "Induction Cooker", tagline: "Fast electric cooking with precise control.", path: "/category/kitchen-appliances/induction-cooker", banner: "/banners/induction-cooker.jpg" },
    ],
  },
  {
    id: "small-appliances", name: "Small Appliances", shortName: "Small Appliances", path: "/category/small-appliances",
    tone: "from-slate-50 via-white to-cyan-50", accent: "#0b3474", image: "",
    tagline: "Everyday helpers for a smoother home",
    description: "Compact appliances for cleaning, garment care, water heating, and daily comfort.",
    isActive: true, sortOrder: 6,
    subcategories: [
      { id: "vacuum-cleaner", name: "Vacuum Cleaner", tagline: "Easy cleaning power.", path: "/category/small-appliances/vacuum-cleaner", banner: "/banners/vacuum-cleaner.jpg" },
      { id: "electric-iron", name: "Electric Iron", tagline: "Quick heat and smooth pressing.", path: "/category/small-appliances/electric-iron", banner: "/banners/electric-iron.jpg" },
      { id: "water-heater", name: "Water Heater", tagline: "Reliable warm water comfort.", path: "/category/small-appliances/water-heater", banner: "/banners/water-heater.jpg" },
      { id: "room-heater", name: "Room Heater", tagline: "Compact warmth for winter evenings.", path: "/category/small-appliances/room-heater", banner: "/banners/room-heater.jpg" },
      { id: "hair-dryer", name: "Hair Dryer", tagline: "Fast drying with simple control.", path: "/category/small-appliances/hair-dryer", banner: "/banners/hair-dryer.jpg" },
    ],
  },
  {
    id: "audio", name: "Audio", shortName: "Audio", path: "/category/audio",
    tone: "from-blue-50 via-white to-slate-100", accent: "#159ba5", image: "",
    tagline: "Sound for movies, music, and daily entertainment",
    description: "Home audio products that pair naturally with televisions.",
    isActive: true, sortOrder: 7,
    subcategories: [
      { id: "soundbar", name: "Soundbar", tagline: "Slim TV sound upgrades.", path: "/category/audio/soundbar", banner: "/banners/soundbar.jpg" },
      { id: "bluetooth-speaker", name: "Bluetooth Speaker", tagline: "Portable wireless sound.", path: "/category/audio/bluetooth-speaker", banner: "/banners/bluetooth-speaker.jpg" },
      { id: "home-theater", name: "Home Theater", tagline: "Bigger surround sound.", path: "/category/audio/home-theater", banner: "/banners/home-theater.jpg" },
    ],
  },
  {
    id: "commercial", name: "Commercial Appliances", shortName: "Commercial", path: "/category/commercial",
    tone: "from-cyan-50 via-white to-blue-50", accent: "#0b3474", image: "",
    tagline: "Appliances built for business use",
    description: "Commercial-ready cooling and utility appliances.",
    isActive: true, sortOrder: 8,
    subcategories: [
      { id: "water-dispenser", name: "Water Dispenser", tagline: "Hot and cold drinking water.", path: "/category/commercial/water-dispenser", banner: "/banners/water-dispenser.jpg" },
      { id: "display-freezer", name: "Display Freezer", tagline: "Visible frozen storage.", path: "/category/commercial/display-freezer", banner: "/banners/display-freezer.jpg" },
      { id: "display-cooler", name: "Display Cooler", tagline: "Glass-door beverage display.", path: "/category/commercial/display-cooler", banner: "/banners/display-cooler.jpg" },
    ],
  },
];

app.post("/api/categories/seed", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    await Category.deleteMany({});
    const created = await Category.insertMany(seedCategoriesData);
    res.status(201).json({ message: `${created.length} categories seeded successfully!`, categories: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed Admin
app.post("/api/admin/seed", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email: "superadmin@gmail.com" }, { username: "superadmin" }],
    });
    if (existingAdmin) {
      let changed = false;
      if (!existingAdmin.username) { existingAdmin.username = "superadmin"; changed = true; }
      if (existingAdmin.role !== "superadmin") { existingAdmin.role = "superadmin"; changed = true; }
      if (!existingAdmin.isActive) { existingAdmin.isActive = true; changed = true; }
      if (changed) await existingAdmin.save({ validateBeforeSave: false });
      return res.json({ message: "Seed admin already exists", admin: existingAdmin.toJSON() });
    }
    
    const admin = await Admin.create({
      name: "কামাল হোসেন",
      username: "superadmin",
      email: "superadmin@gmail.com",
      password: "admin123", // pre-save hook auto-hash করবে
      role: "superadmin",
    });
    
    res.status(201).json({ message: "Admin seeded successfully!", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    let products;
    if (mongoose.connection.readyState !== 1) {
      products = inMemoryProducts;
    } else {
      products = await Product.find().sort({ createdAt: -1 }).lean();
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    let product;
    if (mongoose.connection.readyState === 1) {
      product = await Product.findOne({ id: req.params.id }).lean();
    } else {
      product = inMemoryProducts.find(p => p.id === req.params.id || p._id === req.params.id);
    }

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/products", authMiddleware, upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), async (req, res) => {
  try {
    let imageData = {};
    const mainImage = req.files?.image?.[0];
    const galleryImages = req.files?.images || [];
    if (mainImage) {
      imageData = await uploadToCloudinary(mainImage);
    }
    const galleryData = await uploadManyToCloudinary(galleryImages);
    
    const payload = normalizeProduct(req.body, { ...imageData, ...galleryData });
    const product = mongoose.connection.readyState === 1
      ? await Product.create(payload)
      : payload;
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/products/:id", authMiddleware, upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }
    
    const existing = await Product.findOne({ id: req.params.id });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let imageData = {};
    const mainImage = req.files?.image?.[0];
    const galleryImages = req.files?.images || [];
    if (mainImage) {
      imageData = await uploadToCloudinary(mainImage);
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId);
      }
    }
    const galleryData = await uploadManyToCloudinary(galleryImages);

    const payload = normalizeProduct(
      {
        ...existing.toObject(),
        ...req.body,
        id: req.params.id,
      },
      {
        ...(imageData.secure_url ? imageData : { secure_url: existing.image, public_id: existing.imagePublicId }),
        ...galleryData,
      }
    );

    const product = await Product.findOneAndUpdate({ id: req.params.id }, payload, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }
    
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    if (Array.isArray(product.imagePublicIds)) {
      await Promise.all(product.imagePublicIds.map((publicId) => cloudinary.uploader.destroy(publicId).catch(() => null)));
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public Order Creation
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod, deliveryCharge, discount, notes, couponCode, deliveryArea } = req.body;
    if (!customer?.name || !customer?.phone || !items?.length) {
      return res.status(400).json({ message: "নাম, ফোন এবং পণ্য আবশ্যক" });
    }

    let couponDiscount = Number(discount) || 0;
    if (couponCode && mongoose.connection.readyState === 1) {
      const Coupon = (await import("./models/Coupon.js")).default;
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    let phoneCount = 0;
    if (mongoose.connection.readyState === 1) {
      phoneCount = await Order.countDocuments({ "customer.phone": customer.phone, orderStatus: { $nin: ["delivered", "cancelled"] } });
    } else {
      phoneCount = inMemoryOrders.filter(o =>
        o.customer.phone === customer.phone &&
        !["delivered", "cancelled"].includes(o.orderStatus)
      ).length;
    }
    const isFraudSuspected = phoneCount > 3;

    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-`;
    let count = 0;
    if (mongoose.connection.readyState === 1) {
      count = await Order.countDocuments();
    } else {
      count = inMemoryOrders.length;
    }
    const newOrderId = `${prefix}${String(count + 1).padStart(4, "0")}`;

    const orderData = {
      orderId: newOrderId,
      customer: { name: customer.name, phone: customer.phone, email: customer.email || "", address: customer.address || "" },
      items: items.map(i => ({ productId: i.id || i.productId, name: i.name, price: i.price, quantity: i.quantity })),
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
      deliveryCharge: Number(deliveryCharge) || 0,
      discount: couponDiscount,
      notes: notes || `Delivery Area: ${deliveryArea || ""}`,
      ipAddress,
      userAgent,
      isFraudSuspected,
      fraudReason: isFraudSuspected ? "Same phone has multiple pending orders" : "",
      createdAt: new Date(),
    };

    let createdOrder;
    if (mongoose.connection.readyState === 1) {
      createdOrder = await Order.create(orderData);
    } else {
      createdOrder = { ...orderData, _id: `order-${Date.now()}` };
      inMemoryOrders.push(createdOrder);
    }

    res.status(201).json({ orderId: orderData.orderId, _id: createdOrder._id });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/pages/slug/:slug - Public endpoint for static pages
app.get("/api/pages/slug/:slug", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const page = await Page.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/steadfast - Send order to Steadfast courier
app.post("/api/orders/:id/steadfast", authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const sfSetting = await Settings.findOne({ key: "steadfast" }).lean();
    const sfCfg = sfSetting?.value || {};
    if (!sfCfg.apiKey || !sfCfg.secretKey) {
      return res.status(400).json({ message: "Steadfast API কনফিগার করা নেই। Settings → Courier API তে যান।" });
    }
    if (!sfCfg.isActive) return res.status(400).json({ message: "Steadfast API নিষ্ক্রিয়" });

    const baseUrl = sfCfg.baseUrl || "https://portal.steadfast.com.bd/api/v1";
    const payload = {
      invoice: order.orderId,
      recipient_name: req.body.recipient_name || order.customer?.name,
      recipient_phone: req.body.recipient_phone || order.customer?.phone,
      recipient_address: req.body.recipient_address || order.customer?.address,
      cod_amount: req.body.cod_amount ?? order.totalAmount,
      note: req.body.note || `Order: ${order.orderId}`,
    };

    const sfRes = await fetch(`${baseUrl}/create_order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": sfCfg.apiKey, "Secret-Key": sfCfg.secretKey },
      body: JSON.stringify(payload),
    });
    const sfData = await sfRes.json();

    if (sfRes.ok && sfData.status === 200) {
      const trackingCode = sfData.consignment?.tracking_code || sfData.tracking_code;
      await Order.findByIdAndUpdate(req.params.id, { orderStatus: "shipped", courierTrackingId: trackingCode });
      res.json({ trackingCode, consignment: sfData.consignment });
    } else {
      res.status(400).json({ message: sfData.message || "Steadfast API ত্রুটি" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pass in-memory data to dashboard routes
const createDashboardRoutes = (inMemoryData) => {
  const router = express.Router();

  // DASHBOARD STATS
  router.get("/stats", async (req, res) => {
    try {
      const { inMemoryProducts, inMemoryOrders } = inMemoryData;
      if (mongoose.connection.readyState !== 1) {
        const totalOrders = inMemoryOrders.length;
        const totalProducts = inMemoryProducts.length;
        const totalCustomers = [...new Set(inMemoryOrders.map(o => o.customer.phone))].length;
        const totalSales = inMemoryOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = inMemoryOrders.filter(o => o.orderStatus === "pending").length;
        const completedOrders = inMemoryOrders.filter(o => o.orderStatus === "delivered").length;
        const inCourier = inMemoryOrders.filter(o => o.orderStatus === "shipped").length;
        const cancelledOrders = inMemoryOrders.filter(o => o.orderStatus === "cancelled").length;

        return res.json({
          totalOrders,
          totalSales,
          totalCustomers,
          totalProducts,
          pendingOrders,
          completedOrders,
          inCourier,
          cancelledOrders,
          monthlyRevenue: 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          customersGrowth: 0,
          salesGrowth: 0,
          productsGrowth: 0,
          monthlySalesData: [],
          recentOrders: inMemoryOrders.slice(-5).reverse().map((o) => ({
            _id: o._id,
            orderId: o.orderId,
            customer: o.customer,
            totalAmount: o.totalAmount,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            createdAt: o.createdAt,
          })),
          fraudOrders: inMemoryOrders.filter(o => o.isFraudSuspected).length,
          recentProducts: inMemoryProducts.slice(-5).reverse(),
          inventoryAlerts: inMemoryProducts.filter(p => p.stock <= p.lowStockThreshold).map((p) => ({
            _id: p._id,
            id: p.id,
            name: p.name,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            status: p.stock <= 0 ? "out" : "low",
          })).slice(0, 8),
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

  // SALES REPORT
  router.get("/sales-report", async (req, res) => {
    try {
      const { inMemoryOrders } = inMemoryData;
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
          totalSales: inMemoryOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          totalOrders: inMemoryOrders.length,
          averageOrderValue: inMemoryOrders.length > 0 ? Math.round(inMemoryOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / inMemoryOrders.length) : 0,
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
      const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

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
        averageOrderValue,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // ORDERS
  router.get("/orders", async (req, res) => {
    try {
      const { inMemoryOrders } = inMemoryData;
      if (mongoose.connection.readyState !== 1) {
        const { status, page = 1, limit = 20, search } = req.query;
        let filteredOrders = inMemoryOrders.slice().reverse();
        if (status) filteredOrders = filteredOrders.filter(o => o.orderStatus === status);
        if (search) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(o => 
            o.customer.name.toLowerCase().includes(searchLower) ||
            o.customer.phone.toLowerCase().includes(searchLower) ||
            o.orderId.toLowerCase().includes(searchLower)
          );
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedOrders = filteredOrders.slice(skip, skip + parseInt(limit));
        return res.json({ orders: paginatedOrders, total: filteredOrders.length, page: parseInt(page), pages: Math.ceil(filteredOrders.length / parseInt(limit)) });
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
      const { inMemoryOrders } = inMemoryData;
      if (mongoose.connection.readyState !== 1) {
        const orderIdx = inMemoryOrders.findIndex(o => o._id === req.params.id || o.orderId === req.params.id);
        if (orderIdx === -1) return res.status(404).json({ message: "অর্ডার পাওয়া যায়নি" });
        const { orderStatus, paymentStatus, trackingNumber, courierService } = req.body;
        if (orderStatus) inMemoryOrders[orderIdx].orderStatus = orderStatus;
        if (paymentStatus) inMemoryOrders[orderIdx].paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) inMemoryOrders[orderIdx].trackingNumber = trackingNumber;
        if (courierService !== undefined) inMemoryOrders[orderIdx].courierService = courierService;
        return res.json(inMemoryOrders[orderIdx]);
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

  // USERS
  router.get("/users", async (req, res) => {
    try {
      const { inMemoryAdmins } = inMemoryData;
      if (mongoose.connection.readyState !== 1) return res.json(inMemoryAdmins.map(a => ({ ...a, password: undefined })));

      const users = await Admin.find().sort({ createdAt: -1 }).lean();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/users/:id/status", async (req, res) => {
    try {
      const { inMemoryAdmins } = inMemoryData;
      if (mongoose.connection.readyState !== 1) return res.json({ message: "স্ট্যাটাস আপডেট করা হয়েছে" });

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
      const { inMemoryAdmins } = inMemoryData;
      if (mongoose.connection.readyState !== 1) return res.json({ message: "ইউজার আপডেট করা হয়েছে" });

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

  return router;
};

// Dashboard Routes
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
// Stock Management Routes
app.use("/api/stock", authMiddleware, stockRoutes);
// Category Management Routes
app.use("/api/categories", categoryRoutes);
// Banner Routes
app.use("/api/banners", bannerRoutes);
// Settings Routes
app.use("/api/settings", settingsRoutes);
// Coupon Routes
app.use("/api/coupons", couponRoutes);
// Flash Sale Routes
app.use("/api/flashsales", flashsaleRoutes);
// Content Routes (Blogs, Reviews)
app.use("/api/content", contentRoutes);
// Courier Routes (DHL, FedEx)
app.use("/api/courier", authMiddleware, courierRoutes);
// Contact Form — POST is public, GET/DELETE/PATCH require auth
app.use("/api/contact", (req, res, next) => {
  if (req.method === "POST") return next();
  return authMiddleware(req, res, next);
}, contactRoutes);

// Update settings update endpoint to handle file uploads
import Settings from "./models/Settings.js";

// GET /api/settings/:key
app.get("/api/settings/:key", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ key: req.params.key, value: {} });
    const setting = await Settings.findOne({ key: req.params.key }).lean();
    res.json(setting || { key: req.params.key, value: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/settings/:key - with optional logo upload
app.put("/api/settings/:key", upload.single("logo"), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });
    
    let value = req.body.value;
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch (e) { /* keep as string */ }
    }
    
    // If logo file uploaded
    if (req.file) {
      const imageData = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vision-settings", resource_type: "image" },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(req.file.buffer);
      });
      if (imageData?.secure_url) {
        value = { ...(typeof value === "object" ? value : {}), logo: imageData.secure_url, logoPublicId: imageData.public_id };
      }
    }
    
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/seed-products — Demo products + images to Cloudinary → MongoDB
app.post("/api/admin/seed-products", authMiddleware, async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB not connected" });

    const { products: demoProducts, categories: demoCategories } = await import("../src/data/data.js");

    // Upload local image to Cloudinary
    const uploadLocalImage = (imgPath) =>
      new Promise((resolve, reject) => {
        const absPath = path.join(publicDir, imgPath.replace(/^\/+/, ""));
        if (!existsSync(absPath)) return resolve(null);
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vision-products", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        createReadStream(absPath).pipe(stream);
      });

    // Collect all unique image paths (main + gallery)
    const allImagePaths = new Set();
    demoProducts.forEach(p => {
      if (p.image && !p.image.startsWith("http")) allImagePaths.add(p.image);
      if (p.images && Array.isArray(p.images)) {
        p.images.forEach(img => {
          if (img && !img.startsWith("http")) allImagePaths.add(img);
        });
      }
    });

    // Upload all unique images to Cloudinary
    const imageMap = {};
    for (const imgPath of allImagePaths) {
      try {
        const result = await uploadLocalImage(imgPath);
        if (result?.secure_url) imageMap[imgPath] = { url: result.secure_url, publicId: result.public_id };
      } catch (e) {
        console.warn("Image upload failed:", imgPath, e.message);
      }
    }

    // Upsert categories
    let catCount = 0;
    for (const cat of demoCategories) {
      await Category.updateOne({ id: cat.id }, { $set: { ...cat, isActive: true } }, { upsert: true });
      catCount++;
    }

    // Upsert products with Cloudinary URLs
    let prodCount = 0;
    for (const product of demoProducts) {
      const cloudImg = imageMap[product.image];
      // Process gallery images
      let cloudImages = [];
      let cloudImagePublicIds = [];
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          const cloudGalleryImg = imageMap[img];
          if (cloudGalleryImg) {
            cloudImages.push(cloudGalleryImg.url);
            cloudImagePublicIds.push(cloudGalleryImg.publicId);
          }
        });
      }
      await Product.updateOne(
        { id: product.id },
        {
          $set: {
            ...product,
            price: Number(product.price),
            originalPrice: Math.round(Number(product.price) * 1.08),
            image: cloudImg?.url || product.image || "",
            imagePublicId: cloudImg?.publicId || "",
            images: cloudImages,
            imagePublicIds: cloudImagePublicIds,
            stock: 10,
            lowStockThreshold: 5,
            isActive: true,
          }
        },
        { upsert: true }
      );
      prodCount++;
    }

    res.json({
      ok: true,
      message: `✅ সম্পন্ন! ${prodCount}টি পণ্য ও ${catCount}টি ক্যাটাগরি MongoDB তে সেভ হয়েছে। ${Object.keys(imageMap).length}টি ছবি Cloudinary তে আপলোড হয়েছে।`,
      products: prodCount,
      categories: catCount,
      imagesUploaded: Object.keys(imageMap).length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.name === "ValidationError" || error.code === 11000 ? 400 : 500;
  res.status(status).json({
    message: error.code === 11000 ? "A product with this id already exists." : error.message || "Server error",
  });
});

// Auto-seed admin if not exists
const autoSeedAdmin = async () => {
  try {
    const existing = await Admin.findOne({
      $or: [{ email: "superadmin@gmail.com" }, { username: "superadmin" }],
    });
    if (!existing) {
      await Admin.create({
        name: "কামাল হোসেন",
        username: "superadmin",
        email: "superadmin@gmail.com",
        password: "admin123",
        role: "superadmin",
      });
      console.log("✅ Superadmin auto-seeded: superadmin / admin123");
    } else {
      let changed = false;
      if (!existing.username) { existing.username = "superadmin"; changed = true; }
      if (existing.role !== "superadmin") { existing.role = "superadmin"; changed = true; }
      if (changed) await existing.save({ validateBeforeSave: false });
      console.log("✅ Superadmin already exists");
    }
  } catch (error) {
    console.warn("⚠️ Auto-seed admin warning:", error.message);
  }
};

const start = async () => {
  if (process.env.MONGODB_URI || process.env.MONGODB_DIRECT_URI) {
    console.log("🔗 Connecting to MongoDB...");
    
    try {
      await connectDatabase();
      console.log("✅ MongoDB connected successfully!");
      console.log("📊 Database name:", mongoose.connection.name);
      
      // Auto-seed admin on startup
      await autoSeedAdmin();
    } catch (error) {
      console.warn("⚠️ MongoDB connection failed. Server running without DB.");
      console.warn("   Error:", error.name);
      console.warn("   Message:", error.message);
    }
  } else {
    console.warn("⚠️ No MongoDB URI provided. Server running without DB.");
  }
  
  app.listen(port, (error) => {
    if (error) {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Stop the other server or choose a different PORT.`);
      } else {
        console.error("Failed to start API server:", error.message);
      }
      process.exitCode = 1;
      return;
    }

    console.log("🚀 Vision dashboard API running on http://localhost:" + port);
    console.log("📍 Health check: http://localhost:" + port + "/api/health");
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
