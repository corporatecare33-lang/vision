orimport "dotenv/config";
import mongoose from "mongoose";
import Category from "./models/Category.js";

const categories = [
  {
    id: "tvs",
    name: "TVs",
    shortName: "Televisions",
    path: "/category/tvs",
    tone: "from-cyan-50 via-white to-blue-100",
    accent: "#0b3474",
    image: "",
    tagline: "Brilliant screens for every room",
    description: "Smart entertainment, sharp color, and immersive sound for modern homes.",
    isActive: true, sortOrder: 1,
    subcategories: [
      { id: "smart-tv", name: "Smart TV", tagline: "Streaming-ready displays with easy controls.", path: "/category/tvs/smart-tv", banner: "/banners/smart-tv.jpg" },
      { id: "android-tv", name: "Android TV", tagline: "Apps, voice search, and cinematic clarity.", path: "/category/tvs/android-tv", banner: "/banners/android-tv.jpg" },
      { id: "led-tv", name: "LED TV", tagline: "Reliable everyday entertainment.", path: "/category/tvs/led-tv", banner: "/banners/led-tv.jpg" },
      { id: "4k-uhd-tv", name: "4K UHD TV", tagline: "Ultra-sharp picture with richer contrast.", path: "/category/tvs/4k-uhd-tv", banner: "/banners/4k-uhd-tv.jpg" },
    ],
  },
  {
    id: "kettles",
    name: "Kettles",
    shortName: "Kettles",
    path: "/category/kettles",
    tone: "from-cyan-50 via-white to-emerald-50",
    accent: "#28c7cf",
    image: "",
    tagline: "Fast boiling, clean design",
    description: "Compact kitchen essentials for tea, coffee, and everyday cooking.",
    isActive: true, sortOrder: 2,
    subcategories: [
      { id: "electric-kettle", name: "Electric Kettle", tagline: "Quick boil performance with durable bodies.", path: "/category/kettles/electric-kettle", banner: "/banners/electric-kettle.jpg" },
      { id: "smart-kettle", name: "Smart Kettle", tagline: "Temperature presets and keep-warm comfort.", path: "/category/kettles/smart-kettle", banner: "/banners/smart-kettle.jpg" },
    ],
  },
  {
    id: "refrigerators",
    name: "Refrigerators / Freezers",
    shortName: "Cooling",
    path: "/category/refrigerators",
    tone: "from-blue-50 via-white to-cyan-100",
    accent: "#0b3474",
    image: "",
    tagline: "Freshness made beautifully simple",
    description: "Energy-aware cooling systems for homes, stores, and busy kitchens.",
    isActive: true, sortOrder: 3,
    subcategories: [
      { id: "side-by-side", name: "Side by Side", tagline: "Wide storage, dispenser-ready convenience.", path: "/category/refrigerators/side-by-side", banner: "/banners/side-by-side.jpg" },
      { id: "no-frost", name: "No Frost", tagline: "Even cooling without manual defrosting.", path: "/category/refrigerators/no-frost", banner: "/banners/no-frost.jpg" },
      { id: "direct-cool", name: "Direct Cool", tagline: "Durable cooling for everyday family use.", path: "/category/refrigerators/direct-cool", banner: "/banners/direct-cool.jpg" },
      { id: "beverage-cooler", name: "Beverage Cooler", tagline: "Commercial display cooling for drinks.", path: "/category/refrigerators/beverage-cooler", banner: "/banners/beverage-cooler.jpg" },
      { id: "commercial-freezer", name: "Deep Freezer", tagline: "High-capacity frozen storage.", path: "/category/refrigerators/commercial-freezer", banner: "/banners/commercial-freezer.jpg" },
      { id: "four-door", name: "Four Door", tagline: "Flexible premium storage zones.", path: "/category/refrigerators/four-door", banner: "/banners/four-door.jpg" },
      { id: "single-door", name: "Single Door", tagline: "Compact in size, big on freshness.", path: "/category/refrigerators/single-door", banner: "/banners/single-door.jpg" },
    ],
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    shortName: "Home Appliances",
    path: "/category/home-appliances",
    tone: "from-cyan-50 via-white to-slate-50",
    accent: "#159ba5",
    image: "",
    tagline: "Daily comfort, quietly handled",
    description: "Practical home appliances for cleaning, comfort, and routine care.",
    isActive: true, sortOrder: 4,
    subcategories: [
      { id: "washing-machine", name: "Washing Machine", tagline: "Gentle wash programs with strong motors.", path: "/category/home-appliances/washing-machine", banner: "/banners/washing-machine.jpg" },
      { id: "air-conditioner", name: "Air Conditioner", tagline: "Efficient cooling for hot days.", path: "/category/home-appliances/air-conditioner", banner: "/banners/air-conditioner.jpg" },
      { id: "microwave-oven", name: "Microwave Oven", tagline: "Fast heating, cooking, and reheating.", path: "/category/home-appliances/microwave-oven", banner: "/banners/microwave-oven.jpg" },
      { id: "fan", name: "Fan", tagline: "Reliable air flow for every room.", path: "/category/home-appliances/fan", banner: "/banners/fan.jpg" },
    ],
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen Appliances",
    shortName: "Kitchen",
    path: "/category/kitchen-appliances",
    tone: "from-emerald-50 via-white to-cyan-50",
    accent: "#159ba5",
    image: "",
    tagline: "Helpful tools for everyday cooking",
    description: "Smart kitchen appliances for faster prep, cooking, and serving.",
    isActive: true, sortOrder: 5,
    subcategories: [
      { id: "rice-cooker", name: "Rice Cooker", tagline: "Simple cooking with steady heat control.", path: "/category/kitchen-appliances/rice-cooker", banner: "/banners/rice-cooker.jpg" },
      { id: "blender", name: "Blender", tagline: "Smooth blending for drinks and recipes.", path: "/category/kitchen-appliances/blender", banner: "/banners/blender.jpg" },
      { id: "induction-cooker", name: "Induction Cooker", tagline: "Fast electric cooking with precise control.", path: "/category/kitchen-appliances/induction-cooker", banner: "/banners/induction-cooker.jpg" },
    ],
  },
  {
    id: "small-appliances",
    name: "Small Appliances",
    shortName: "Small Appliances",
    path: "/category/small-appliances",
    tone: "from-slate-50 via-white to-cyan-50",
    accent: "#0b3474",
    image: "",
    tagline: "Everyday helpers for a smoother home",
    description: "Compact appliances for cleaning, garment care, water heating, and daily comfort.",
    isActive: true, sortOrder: 6,
    subcategories: [
      { id: "vacuum-cleaner", name: "Vacuum Cleaner", tagline: "Easy cleaning power.", path: "/category/small-appliances/vacuum-cleaner", banner: "/banners/vacuum-cleaner.jpg" },
      { id: "electric-iron", name: "Electric Iron", tagline: "Quick heat and smooth pressing.", path: "/category/small-appliances/electric-iron", banner: "/banners/electric-iron.jpg" },
      { id: "water-heater", name: "Water Heater", tagline: "Reliable warm water comfort.", path: "/category/small-appliances/water-heater", banner: "/banners/water-heater.jpg" },
      { id: "room-heater", name: "Room Heater", tagline: "Compact warmth for winter evenings.", path: "/category/small-appliances/room-heater", banner: "/banners/room-heater.jpg" },
      { id: "hair-dryer", name: "Hair Dryer", tagline: "Fast drying with simple control.", path: "/category/small-appliances/hair-dryer", banner: "/banners/hair-dryer.jpg" },
    ],
  },
  {
    id: "audio",
    name: "Audio",
    shortName: "Audio",
    path: "/category/audio",
    tone: "from-blue-50 via-white to-slate-100",
    accent: "#159ba5",
    image: "",
    tagline: "Sound for movies, music, and daily entertainment",
    description: "Home audio products that pair naturally with televisions.",
    isActive: true, sortOrder: 7,
    subcategories: [
      { id: "soundbar", name: "Soundbar", tagline: "Slim TV sound upgrades.", path: "/category/audio/soundbar", banner: "/banners/soundbar.jpg" },
      { id: "bluetooth-speaker", name: "Bluetooth Speaker", tagline: "Portable wireless sound.", path: "/category/audio/bluetooth-speaker", banner: "/banners/bluetooth-speaker.jpg" },
      { id: "home-theater", name: "Home Theater", tagline: "Bigger surround sound.", path: "/category/audio/home-theater", banner: "/banners/home-theater.jpg" },
    ],
  },
  {
    id: "commercial",
    name: "Commercial Appliances",
    shortName: "Commercial",
    path: "/category/commercial",
    tone: "from-cyan-50 via-white to-blue-50",
    accent: "#0b3474",
    image: "",
    tagline: "Appliances built for business use",
    description: "Commercial-ready cooling and utility appliances.",
    isActive: true, sortOrder: 8,
    subcategories: [
      { id: "water-dispenser", name: "Water Dispenser", tagline: "Hot and cold drinking water.", path: "/category/commercial/water-dispenser", banner: "/banners/water-dispenser.jpg" },
      { id: "display-freezer", name: "Display Freezer", tagline: "Visible frozen storage.", path: "/category/commercial/display-freezer", banner: "/banners/display-freezer.jpg" },
      { id: "display-cooler", name: "Display Cooler", tagline: "Glass-door beverage display.", path: "/category/commercial/display-cooler", banner: "/banners/display-cooler.jpg" },
    ],
  },
];

async function seedCategories() {
  try {
    const uri = process.env.MONGODB_URI;
    
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB!\n");

    console.log("🗑️  Deleting existing categories...");
    await Category.deleteMany({});
    console.log("✅ Existing categories deleted!\n");

    console.log("📦 Seeding categories...");
    for (const cat of categories) {
      await Category.create(cat);
      console.log(`   ✅ ${cat.name} (${cat.id})`);
    }

    const count = await Category.countDocuments();
    console.log(`\n🎉 Successfully seeded ${count} categories!`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();