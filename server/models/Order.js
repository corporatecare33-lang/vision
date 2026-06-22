import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    items: [
      {
        productId: { type: String },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad", "card", "bank"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      district: { type: String },
      zip: { type: String },
    },
    trackingNumber: { type: String, default: "" },
    courierService: { type: String, default: "" },
    courierTrackingId: { type: String, default: "" },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    isFraudSuspected: { type: Boolean, default: false },
    fraudReason: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderId before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-`;
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `${prefix}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;