import mongoose from "mongoose";

const uri = "mongodb://vision:i2pposA7EgyOHDlr@ac-r9uxwsx-shard-00-00.sxhpwng.mongodb.net:27017,ac-r9uxwsx-shard-00-01.sxhpwng.mongodb.net:27017,ac-r9uxwsx-shard-00-02.sxhpwng.mongodb.net:27017/vision?ssl=true&replicaSet=atlas-tqx1hf-shard-0&authSource=admin";

console.log("Connecting to MongoDB Atlas...");
console.log("URI (with password hidden):", uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"));

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Failed to connect:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    process.exit(1);
  });