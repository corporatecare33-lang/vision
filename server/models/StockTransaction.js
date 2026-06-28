import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["add", "subtract", "set"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    reference: {
      type: String,
      default: "",
      trim: true,
    },
    performedBy: {
      type: String,
      default: "admin",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StockTransaction", stockTransactionSchema);