import express from "express";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

// POST /api/contact — public
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "Name, email and message are required." });
    if (mongoose.connection.readyState !== 1) return res.status(201).json({ ok: true });
    await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/contact — admin, supports ?status=&dateFrom=&dateTo=
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const { status, dateFrom, dateTo, search } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); query.createdAt.$lte = end; }
    }
    const msgs = await ContactMessage.find(query).sort({ createdAt: -1 }).lean();
    res.json(msgs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/contact/bulk — must be before /:id
router.delete("/bulk", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ ok: true });
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "ids required" });
    await ContactMessage.deleteMany({ _id: { $in: ids } });
    res.json({ ok: true, deleted: ids.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/contact/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ ok: true });
    await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/contact/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ ok: true });
    const { status } = req.body;
    await ContactMessage.findByIdAndUpdate(req.params.id, { status });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/contact/:id
router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ ok: true });
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
