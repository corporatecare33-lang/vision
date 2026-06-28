import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "ফ্ল্যাশ সেল",
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    banner: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FlashSale", flashSaleSchema);