import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Settings from "../models/Settings.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

const uploadToCloudinary = (file, folder = "vision-settings") =>
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

// GET /api/settings - Get all settings
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({});
    }
    const settings = await Settings.find().lean();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/settings/:key - Get a specific setting
router.get("/:key", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ value: null });
    }
    const setting = await Settings.findOne({ key: req.params.key }).lean();
    res.json({ value: setting?.value || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/settings - Update/create settings (batch or single)
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "Settings saved (demo mode)" });
    }
    
    const { key, value } = req.body;
    if (key && value !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: "Settings saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/settings/batch - Update multiple settings at once
router.post("/batch", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "Settings saved (demo mode)" });
    }
    
    const { settings } = req.body;
    if (settings && typeof settings === "object") {
      const ops = Object.entries(settings).map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: { key, value },
          upsert: true,
        },
      }));
      await Settings.bulkWrite(ops);
    }
    
    res.json({ message: "All settings saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/settings/:key - Update a specific setting (used by manager components)
router.put("/:key", authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ message: "value required" });
    if (mongoose.connection.readyState !== 1) {
      return res.json({ key, value, message: "Saved (demo mode)" });
    }
    await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/settings/upload - Upload image to Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const imageData = await uploadToCloudinary(file, "vision-settings");
    res.json({ url: imageData.secure_url, publicId: imageData.public_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/settings/smtp/test - Send test email
router.post("/smtp/test", authMiddleware, async (req, res) => {
  try {
    const { host, port, encryption, username, password, fromEmail, fromName, testEmail } = req.body;
    if (!host || !username || !password || !testEmail) {
      return res.status(400).json({ message: "host, username, password, testEmail প্রয়োজন" });
    }
    // Dynamic nodemailer import (optional dependency)
    let nodemailer;
    try { nodemailer = (await import("nodemailer")).default; } catch {
      return res.status(501).json({ message: "nodemailer ইনস্টল নেই। চালান: npm install nodemailer" });
    }
    const transporter = nodemailer.createTransport({
      host, port: Number(port) || 465,
      secure: encryption === "SSL",
      auth: { user: username, pass: password },
    });
    await transporter.sendMail({
      from: `"${fromName || "Vision Store"}" <${fromEmail || username}>`,
      to: testEmail,
      subject: "Vision Store - SMTP Test Email",
      html: "<h2>SMTP কনফিগারেশন সফল!</h2><p>এই ইমেইলটি Vision Store অ্যাডমিন প্যানেল থেকে পাঠানো হয়েছে।</p>",
    });
    res.json({ message: "টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;