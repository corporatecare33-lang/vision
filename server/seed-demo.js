import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import Admin from "./models/Admin.js";
import Category from "./models/Category.js";
import Order from "./models/Order.js";
import Page from "./models/Page.js";
import Product from "./models/Product.js";
import StockTransaction from "./models/StockTransaction.js";
import { categories, products } from "../src/data/data.js";

const demoOrders = [
  {
    orderId: "DEMO-ORDER-001",
    customer: { name: "Rahim Ahmed", phone: "01711000001", email: "rahim@example.com", address: "Dhanmondi, Dhaka" },
    items: [{ productId: products[0].id, name: products[0].name, price: Number(products[0].price), quantity: 1 }],
    totalAmount: Number(products[0].price),
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddress: { street: "Road 7", city: "Dhaka", district: "Dhaka", zip: "1209" },
  },
  {
    orderId: "DEMO-ORDER-002",
    customer: { name: "Nusrat Jahan", phone: "01811000002", email: "nusrat@example.com", address: "Agrabad, Chattogram" },
    items: [{ productId: products[8].id, name: products[8].name, price: Number(products[8].price), quantity: 1 }],
    totalAmount: Number(products[8].price),
    paymentMethod: "bkash",
    paymentStatus: "paid",
    orderStatus: "processing",
    shippingAddress: { street: "Commerce College Road", city: "Chattogram", district: "Chattogram", zip: "4100" },
  },
  {
    orderId: "DEMO-ORDER-003",
    customer: { name: "Tanvir Hasan", phone: "01911000003", email: "tanvir@example.com", address: "Zindabazar, Sylhet" },
    items: [{ productId: products[12].id, name: products[12].name, price: Number(products[12].price), quantity: 1 }],
    totalAmount: Number(products[12].price),
    paymentMethod: "card",
    paymentStatus: "paid",
    orderStatus: "delivered",
    shippingAddress: { street: "Main Road", city: "Sylhet", district: "Sylhet", zip: "3100" },
  },
];

const demoPages = [
  { name: "About Us", title: "About Vision", slug: "about-us", content: "Demo company profile content.", showInFooter: true, sortOrder: 1 },
  { name: "Delivery Policy", title: "Delivery Policy", slug: "delivery-policy", content: "Demo delivery policy content.", showInFooter: true, sortOrder: 2 },
];

const upsertMany = (Model, key, documents) =>
  Promise.all(documents.map((document) => Model.updateOne(
    { [key]: document[key] },
    { $set: document },
    { upsert: true, runValidators: true }
  )));

const seed = async () => {
  try {
    await connectDatabase();
    console.log(`Connected to MongoDB database: ${process.env.MONGODB_DB_NAME || "vision"}`);

    const categoryDocuments = categories.map((category, index) => ({ ...category, isActive: true, sortOrder: index + 1 }));
    const productDocuments = products.map((product, index) => ({
      ...product,
      price: Number(product.price),
      originalPrice: Math.round(Number(product.price) * 1.08),
      stock: 8 + (index % 24),
      lowStockThreshold: 5,
      isActive: true,
    }));

    await upsertMany(Category, "id", categoryDocuments);
    await upsertMany(Product, "id", productDocuments);
    await upsertMany(Order, "orderId", demoOrders);
    await upsertMany(Page, "slug", demoPages);

    if (!await Admin.exists({ username: "superadmin" })) {
      await Admin.create({ name: "Demo Super Admin", username: "superadmin", email: "superadmin@gmail.com", password: "admin123", role: "superadmin" });
    }

    const stockTransactions = productDocuments.slice(0, 5).map((product) => ({
      productId: product.id,
      productName: product.name,
      type: "set",
      quantity: product.stock,
      previousStock: 0,
      newStock: product.stock,
      reason: "Demo opening stock",
      reference: `DEMO-STOCK-${product.id}`,
      performedBy: "seed-script",
    }));
    await upsertMany(StockTransaction, "reference", stockTransactions);

    console.log(`Seed complete: ${categoryDocuments.length} categories, ${productDocuments.length} products, ${demoOrders.length} orders, ${demoPages.length} pages, 1 admin.`);
  } finally {
    await disconnectDatabase();
  }
};

seed().catch((error) => {
  console.error("Demo seed failed:", error.message);
  process.exitCode = 1;
});
