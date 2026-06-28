import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  tagline: { type: String, default: "" },
  path: { type: String, default: "" },
  banner: { type: String, default: "" },
  bannerPublicId: { type: String, default: "" },
});

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      default: "",
      trim: true,
    },
    path: {
      type: String,
      default: "",
      trim: true,
    },
    tone: {
      type: String,
      default: "from-cyan-50 via-white to-blue-100",
      trim: true,
    },
    accent: {
      type: String,
      default: "#0b3474",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    subcategories: [subcategorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);