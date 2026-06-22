import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Category from "../models/Category.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const fallbackCategories = [
  {
    _id: "cat-tvs", id: "tvs", name: "TVs", shortName: "Televisions",
    path: "/category/tvs", tone: "from-cyan-50 via-white to-blue-100", accent: "#0b3474",
    image: "", tagline: "Brilliant screens for every room",
    description: "Smart entertainment, sharp color, and immersive sound for modern homes.",
    isActive: true, sortOrder: 1,
    subcategories: [
      { id: "smart-tv", name: "Smart TV", tagline: "Streaming-ready displays with easy controls." },
      { id: "android-tv", name: "Android TV", tagline: "Apps, voice search, and cinematic clarity." },
      { id: "led-tv", name: "LED TV", tagline: "Reliable everyday entertainment." },
      { id: "4k-uhd-tv", name: "4K UHD TV", tagline: "Ultra-sharp picture with richer contrast." },
    ],
  },
  {
    _id: "cat-kettles", id: "kettles", name: "Kettles", shortName: "Kettles",
    path: "/category/kettles", tone: "from-cyan-50 via-white to-emerald-50", accent: "#28c7cf",
    image: "", tagline: "Fast boiling, clean design",
    description: "Compact kitchen essentials for tea, coffee, and everyday cooking.",
    isActive: true, sortOrder: 2,
    subcategories: [
      { id: "electric-kettle", name: "Electric Kettle", tagline: "Quick boil performance with durable bodies." },
      { id: "smart-kettle", name: "Smart Kettle", tagline: "Temperature presets and keep-warm comfort." },
    ],
  },
  {
    _id: "cat-fridges", id: "refrigerators", name: "Refrigerators / Freezers", shortName: "Cooling",
    path: "/category/refrigerators", tone: "from-blue-50 via-white to-cyan-100", accent: "#0b3474",
    image: "", tagline: "Freshness made beautifully simple",
    description: "Energy-aware cooling systems for homes, stores, and busy kitchens.",
    isActive: true, sortOrder: 3,
    subcategories: [
      { id: "side-by-side", name: "Side by Side", tagline: "Wide storage, dispenser-ready convenience." },
      { id: "no-frost", name: "No Frost", tagline: "Even cooling without manual defrosting." },
      { id: "direct-cool", name: "Direct Cool", tagline: "Durable cooling for everyday family use." },
      { id: "beverage-cooler", name: "Beverage Cooler", tagline: "Commercial display cooling for drinks." },
      { id: "commercial-freezer", name: "Deep Freezer", tagline: "High-capacity frozen storage." },
      { id: "four-door", name: "Four Door", tagline: "Flexible premium storage zones." },
      { id: "single-door", name: "Single Door", tagline: "Compact in size, big on freshness." },
    ],
  },
  {
    _id: "cat-home", id: "home-appliances", name: "Home Appliances", shortName: "Home Appliances",
    path: "/category/home-appliances", tone: "from-cyan-50 via-white to-slate-50", accent: "#159ba5",
    image: "", tagline: "Daily comfort, quietly handled",
    description: "Practical home appliances for cleaning, comfort, and routine care.",
    isActive: true, sortOrder: 4,
    subcategories: [
      { id: "washing-machine", name: "Washing Machine", tagline: "Gentle wash programs with strong motors." },
      { id: "air-conditioner", name: "Air Conditioner", tagline: "Efficient cooling for hot days." },
      { id: "microwave-oven", name: "Microwave Oven", tagline: "Fast heating, cooking, and reheating." },
      { id: "fan", name: "Fan", tagline: "Reliable air flow for every room." },
    ],
  },
  {
    _id: "cat-kitchen", id: "kitchen-appliances", name: "Kitchen Appliances", shortName: "Kitchen",
    path: "/category/kitchen-appliances", tone: "from-emerald-50 via-white to-cyan-50", accent: "#159ba5",
    image: "", tagline: "Helpful tools for everyday cooking",
    description: "Smart kitchen appliances for faster prep, cooking, and serving.",
    isActive: true, sortOrder: 5,
    subcategories: [
      { id: "rice-cooker", name: "Rice Cooker", tagline: "Simple cooking with steady heat control." },
      { id: "blender", name: "Blender", tagline: "Smooth blending for drinks and recipes." },
      { id: "induction-cooker", name: "Induction Cooker", tagline: "Fast electric cooking with precise control." },
    ],
  },
  {
    _id: "cat-small", id: "small-appliances", name: "Small Appliances", shortName: "Small Appliances",
    path: "/category/small-appliances", tone: "from-slate-50 via-white to-cyan-50", accent: "#0b3474",
    image: "", tagline: "Everyday helpers for a smoother home",
    description: "Compact appliances for cleaning, garment care, water heating, and daily comfort.",
    isActive: true, sortOrder: 6,
    subcategories: [
      { id: "vacuum-cleaner", name: "Vacuum Cleaner", tagline: "Easy cleaning power." },
      { id: "electric-iron", name: "Electric Iron", tagline: "Quick heat and smooth pressing." },
      { id: "water-heater", name: "Water Heater", tagline: "Reliable warm water comfort." },
      { id: "room-heater", name: "Room Heater", tagline: "Compact warmth for winter evenings." },
      { id: "hair-dryer", name: "Hair Dryer", tagline: "Fast drying with simple control." },
    ],
  },
  {
    _id: "cat-audio", id: "audio", name: "Audio", shortName: "Audio",
    path: "/category/audio", tone: "from-blue-50 via-white to-slate-100", accent: "#159ba5",
    image: "", tagline: "Sound for movies, music, and daily entertainment",
    description: "Home audio products that pair naturally with televisions.",
    isActive: true, sortOrder: 7,
    subcategories: [
      { id: "soundbar", name: "Soundbar", tagline: "Slim TV sound upgrades." },
      { id: "bluetooth-speaker", name: "Bluetooth Speaker", tagline: "Portable wireless sound." },
      { id: "home-theater", name: "Home Theater", tagline: "Bigger surround sound." },
    ],
  },
  {
    _id: "cat-commercial", id: "commercial", name: "Commercial Appliances", shortName: "Commercial",
    path: "/category/commercial", tone: "from-cyan-50 via-white to-blue-50", accent: "#0b3474",
    image: "", tagline: "Appliances built for business use",
    description: "Commercial-ready cooling and utility appliances.",
    isActive: true, sortOrder: 8,
    subcategories: [
      { id: "water-dispenser", name: "Water Dispenser", tagline: "Hot and cold drinking water." },
      { id: "display-freezer", name: "Display Freezer", tagline: "Visible frozen storage." },
      { id: "display-cooler", name: "Display Cooler", tagline: "Glass-door beverage display." },
    ],
  },
];

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
      return res.status(503).json({ message: "Database not connected" });
    }
    const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/all - Admin only, includes inactive
router.get("/all", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const cats = await Category.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(cats);
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
      return res.status(503).json({ message: "Database not connected" });
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
      try { updateData.subcategories = JSON.parse(updateData.subcategories); } catch (e) {}
    }

    // Convert string booleans
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
    }
    if (updateData.sortOrder !== undefined) updateData.sortOrder = Number(updateData.sortOrder);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const cat = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "ক্যাটাগরি ডিলিট করা হয়েছে" });
    }
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    
    // Delete category image from Cloudinary
    if (cat.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(cat.imagePublicId);
      } catch (e) { /* ignore */ }
    }
    
    res.json({ message: "ক্যাটাগরি ডিলিট করা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id/subcategories - Add/update subcategories
router.put("/:id/subcategories", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "সাবক্যাটাগরি আপডেট করা হয়েছে" });
    }
    const { subcategories } = req.body;
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { subcategories },
      { new: true }
    );
    if (!cat) return res.status(404).json({ message: "ক্যাটাগরি পাওয়া যায়নি" });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
