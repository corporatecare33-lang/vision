import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "হিরো ব্যানার",
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "Vision banner",
    },
    link: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;