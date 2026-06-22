import mongoose from "mongoose";
import dns from "node:dns";

const connectionOptions = { serverSelectionTimeoutMS: 10000 };

export const connectDatabase = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_DIRECT_URI;

  if (!primaryUri && !fallbackUri) {
    throw new Error("MONGODB_URI is not configured");
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
    if (!canUseFallback) throw error;

    console.warn("MongoDB SRV connection failed; trying MONGODB_DIRECT_URI...");
    return mongoose.connect(fallbackUri, connectionOptions);
  }
};

export const disconnectDatabase = () => mongoose.disconnect();
