import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "./server/config/database.js";

console.log("Testing MongoDB connection...");

const testConnection = async () => {
  if (!process.env.MONGODB_URI && !process.env.MONGODB_DIRECT_URI) {
    console.error("No MongoDB URI in .env");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDatabase();
    console.log("MongoDB connected successfully");
    console.log("  Host:", mongoose.connection.host);
    console.log("  Database:", mongoose.connection.name);
    await disconnectDatabase();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  }
};

testConnection();
