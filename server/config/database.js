
import mongoose from "mongoose";
import dns from "node:dns";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectionOptions = { 
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

export const connectDatabase = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_DIRECT_URI;

  if (!primaryUri && !fallbackUri) {
    console.log("⚠️ No MongoDB URI provided, using in-memory server for testing!");
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log("🚀 In-memory MongoDB server started at:", uri);
    return mongoose.connect(uri, connectionOptions);
  }

  try {
    return await mongoose.connect(primaryUri || fallbackUri, connectionOptions);
  } catch (error) {
    const isSrvDnsError = primaryUri?.startsWith("mongodb+srv://")
      && ["ECONNREFUSED", "ETIMEOUT", "ENOTFOUND", "ESERVFAIL"].some((code) => error.message.includes(code));

    if (isSrvDnsError) {
      const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);
      dns.setServers(dnsServers);

      try {
        return await mongoose.connect(primaryUri, connectionOptions);
      } catch (dnsRetryError) {
        error = dnsRetryError;
      }
    }

    const canUseFallback = primaryUri && fallbackUri && fallbackUri !== primaryUri;
    if (canUseFallback) {
      console.warn("MongoDB SRV connection failed; trying fallback URI...");
      return mongoose.connect(fallbackUri, connectionOptions);
    }

    console.warn("⚠️ MongoDB connection failed, using in-memory server for testing!");
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log("🚀 In-memory MongoDB server started at:", uri);
    return mongoose.connect(uri, connectionOptions);
  }
};

export const disconnectDatabase = async () => {
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
  return mongoose.disconnect();
};
