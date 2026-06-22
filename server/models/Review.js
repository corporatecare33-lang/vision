import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);