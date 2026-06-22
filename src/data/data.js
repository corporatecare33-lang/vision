export const assetPath = (path) => {
  if (!path || /^https?:\/\//.test(path)) return path;
  const baseUrl = import.meta.env?.BASE_URL || "/";
  return `${baseUrl}${path.replace(/^\/+/, "")}`;
};

export const categories = [
  {
    id: "tvs",
    name: "TVs",
    shortName: "Televisions",
    path: "/category/tvs",
    tone: "from-cyan-50 via-white to-blue-100",
    accent: "#0b3474",
    image: "/products/category-tv.png",
    tagline: "Brilliant screens for every room",
    description: "Smart entertainment, sharp color, and immersive sound for modern homes.",
    subcategories: [
      { id: "smart-tv", name: "Smart TV", path: "/category/tvs/smart-tv", tagline: "Streaming-ready displays with easy controls." },
      { id: "android-tv", name: "Android TV", path: "/category/tvs/android-tv", tagline: "Apps, voice search, and cinematic clarity." },
      { id: "led-tv", name: "LED TV", path: "/category/tvs/led-tv", tagline: "Reliable everyday entertainment." },
      { id: "4k-uhd-tv", name: "4K UHD TV", path: "/category/tvs/4k-uhd-tv", tagline: "Ultra-sharp picture with richer contrast." },
    ],
  },
  {
    id: "kettles",
    name: "Kettles",
    shortName: "Kettles",
    path: "/category/kettles",
    tone: "from-cyan-50 via-white to-emerald-50",
    accent: "#28c7cf",
    tagline: "Fast boiling, clean design",
    description: "Compact kitchen essentials for tea, coffee, and everyday cooking.",
    subcategories: [
      { id: "electric-kettle", name: "Electric Kettle", path: "/category/kettles/electric-kettle", tagline: "Quick boil performance with durable bodies." },
      { id: "smart-kettle", name: "Smart Kettle", path: "/category/kettles/smart-kettle", tagline: "Temperature presets and keep-warm comfort." },
    ],
  },
  {
    id: "refrigerators",
    name: "Refrigerators / Freezers",
    shortName: "Cooling",
    path: "/category/refrigerators",
    tone: "from-blue-50 via-white to-cyan-100",
    accent: "#0b3474",
    tagline: "Freshness made beautifully simple",
    description: "Energy-aware cooling systems for homes, stores, and busy kitchens.",
    subcategories: [
      { id: "side-by-side", name: "Side by Side", path: "/category/refrigerators/side-by-side", tagline: "Wide storage, dispenser-ready convenience.", banner: "/banners/side-by-side.jpg" },
      { id: "no-frost", name: "No Frost", path: "/category/refrigerators/no-frost", tagline: "Even cooling without manual defrosting.", banner: "/banners/no-frost.jpg" },
      { id: "direct-cool", name: "Direct Cool", path: "/category/refrigerators/direct-cool", tagline: "Durable cooling for everyday family use.", banner: "/banners/single-door.jpg" },
      { id: "beverage-cooler", name: "Beverage Cooler", path: "/category/refrigerators/beverage-cooler", tagline: "Commercial display cooling for drinks.", banner: "/banners/beverage-cooler.jpg" },
      { id: "commercial-freezer", name: "Deep Freezer", path: "/category/refrigerators/commercial-freezer", tagline: "High-capacity frozen storage for homes and businesses.", banner: "/banners/vertical-freezer.jpg" },
      { id: "four-door", name: "Four Door", path: "/category/refrigerators/four-door", tagline: "Flexible premium storage zones.", banner: "/banners/refrigerator-main.jpg" },
      { id: "single-door", name: "Single Door", path: "/category/refrigerators/single-door", tagline: "Compact in size, big on freshness.", banner: "/banners/single-door.jpg" },
    ],
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    shortName: "Home Appliances",
    path: "/category/home-appliances",
    tone: "from-cyan-50 via-white to-slate-50",
    accent: "#159ba5",
    image: "/products/washing-machine-white-front.jpg",
    tagline: "Daily comfort, quietly handled",
    description: "Practical home appliances for cleaning, comfort, and routine care.",
    subcategories: [
      { id: "washing-machine", name: "Washing Machine", path: "/category/home-appliances/washing-machine", tagline: "Gentle wash programs with strong motors." },
      { id: "air-conditioner", name: "Air Conditioner", path: "/category/home-appliances/air-conditioner", tagline: "Efficient cooling for hot days." },
      { id: "microwave-oven", name: "Microwave Oven", path: "/category/home-appliances/microwave-oven", tagline: "Fast heating, cooking, and reheating." },
      { id: "fan", name: "Fan", path: "/category/home-appliances/fan", tagline: "Reliable air flow for every room." },
    ],
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen Appliances",
    shortName: "Kitchen",
    path: "/category/kitchen-appliances",
    tone: "from-emerald-50 via-white to-cyan-50",
    accent: "#159ba5",
    image: "/products/electric-kettle-glass.jpg",
    tagline: "Helpful tools for everyday cooking",
    description: "Smart kitchen appliances for faster prep, cooking, and serving.",
    subcategories: [
      { id: "rice-cooker", name: "Rice Cooker", path: "/category/kitchen-appliances/rice-cooker", tagline: "Simple cooking with steady heat control." },
      { id: "blender", name: "Blender", path: "/category/kitchen-appliances/blender", tagline: "Smooth blending for drinks and recipes." },
      { id: "induction-cooker", name: "Induction Cooker", path: "/category/kitchen-appliances/induction-cooker", tagline: "Fast electric cooking with precise control." },
    ],
  },
  {
    id: "small-appliances",
    name: "Small Appliances",
    shortName: "Small Appliances",
    path: "/category/small-appliances",
    tone: "from-slate-50 via-white to-cyan-50",
    accent: "#0b3474",
    tagline: "Everyday helpers for a smoother home",
    description: "Compact appliances for cleaning, garment care, water heating, and daily comfort.",
    subcategories: [
      { id: "vacuum-cleaner", name: "Vacuum Cleaner", path: "/category/small-appliances/vacuum-cleaner", tagline: "Easy cleaning power for floors, corners, and daily dust." },
      { id: "electric-iron", name: "Electric Iron", path: "/category/small-appliances/electric-iron", tagline: "Quick heat and smooth pressing for everyday clothing care." },
      { id: "water-heater", name: "Water Heater", path: "/category/small-appliances/water-heater", tagline: "Reliable warm water comfort with practical safety controls." },
      { id: "room-heater", name: "Room Heater", path: "/category/small-appliances/room-heater", tagline: "Compact warmth for bedrooms, offices, and winter evenings." },
      { id: "hair-dryer", name: "Hair Dryer", path: "/category/small-appliances/hair-dryer", tagline: "Fast drying with simple heat and airflow control." },
    ],
  },
  {
    id: "audio",
    name: "Audio",
    shortName: "Audio",
    path: "/category/audio",
    tone: "from-blue-50 via-white to-slate-100",
    accent: "#159ba5",
    tagline: "Sound for movies, music, and daily entertainment",
    description: "Home audio products that pair naturally with televisions and modern living rooms.",
    subcategories: [
      { id: "soundbar", name: "Soundbar", path: "/category/audio/soundbar", tagline: "Slim TV sound upgrades with deeper, clearer audio." },
      { id: "bluetooth-speaker", name: "Bluetooth Speaker", path: "/category/audio/bluetooth-speaker", tagline: "Portable wireless sound for home and outdoor listening." },
      { id: "home-theater", name: "Home Theater", path: "/category/audio/home-theater", tagline: "Bigger surround sound for cinematic rooms." },
    ],
  },
  {
    id: "commercial",
    name: "Commercial Appliances",
    shortName: "Commercial",
    path: "/category/commercial",
    tone: "from-cyan-50 via-white to-blue-50",
    accent: "#0b3474",
    tagline: "Appliances built for business use",
    description: "Commercial-ready cooling and utility appliances for stores, offices, and service counters.",
    subcategories: [
      { id: "water-dispenser", name: "Water Dispenser", path: "/category/commercial/water-dispenser", tagline: "Hot and cold drinking water access for shared spaces." },
      { id: "display-freezer", name: "Display Freezer", path: "/category/commercial/display-freezer", tagline: "Visible frozen storage for retail and food service." },
      { id: "display-cooler", name: "Display Cooler", path: "/category/commercial/display-cooler", tagline: "Glass-door beverage and food display cooling." },
    ],
  },
];

const productSeeds = {
  "smart-tv": ["Vision SmartView 43", "VSV-43S", "43 inch FHD", "Wi-Fi", "Dolby Audio"],
  "android-tv": ["Vision Android Pro 55", "VAP-55A", "55 inch", "Google TV", "Voice Remote"],
  "led-tv": ["Vision LED Classic 32", "VLC-32L", "HD Ready", "USB Movie", "Low Power"],
  "4k-uhd-tv": ["Vision Ultra 65", "VUL-65U", "4K UHD", "HDR10", "Bezel-less"],
  "electric-kettle": ["Vision Swift Kettle", "VKT-18E", "1.8L", "Auto Cut-off", "Steel Body"],
  "smart-kettle": ["Vision TempSense Kettle", "VKT-15S", "Preset Heat", "Keep Warm", "Touch Control"],
  "side-by-side": ["Vision Grande SBS", "VRS-620S", "620L", "Inverter", "Water Dispenser"],
  "no-frost": ["Vision FrostGuard", "VRN-355N", "No Frost", "Multi Airflow", "Digital Display"],
  "direct-cool": ["Vision FreshCool", "VRD-245D", "Direct Cool", "Low Noise", "Energy Saver"],
  "beverage-cooler": ["Vision ChillBar", "VBC-360B", "Glass Door", "LED Light", "Adjustable Shelf"],
  "commercial-freezer": ["Vision Deep Freeze", "VCF-420C", "Chest Freezer", "Fast Freeze", "Lockable Lid"],
  "four-door": ["Vision FlexiFour", "VRF-560F", "Four Door", "Convertible Zone", "Premium Finish"],
  "single-door": ["Vision Compact Fresh", "VRS-190D", "Single Door", "Vegetable Crisper", "Stabilizer Free"],
  "washing-machine": ["Vision WashPro", "VWM-85F", "8.5 KG", "Quick Wash", "Soft Close"],
  "air-conditioner": ["Vision CoolAir", "VAC-18I", "1.5 Ton", "Inverter", "Turbo Cool"],
  "microwave-oven": ["Vision HeatWave", "VMW-28G", "28L", "Grill", "Auto Cook"],
  "fan": ["Vision Breeze", "VFN-56C", "56 inch", "Copper Motor", "Silent Air"],
  "rice-cooker": ["Vision RicePro", "VRC-18R", "1.8L", "Keep Warm", "Non-stick Pot"],
  "blender": ["Vision BlendMax", "VBL-12B", "1.2L Jar", "Stainless Blade", "Pulse Mode"],
  "induction-cooker": ["Vision CookSense", "VIC-20I", "2000W", "Touch Control", "Timer"],
  "vacuum-cleaner": ["Vision CleanMate", "VVC-16C", "1600W", "Dust Filter", "Easy Wheels"],
  "electric-iron": ["Vision SteamPress", "VIR-12S", "Steam Iron", "Non-stick Sole", "Quick Heat"],
  "water-heater": ["Vision WarmFlow", "VWH-30L", "30L", "Safety Valve", "Auto Cut-off"],
  "room-heater": ["Vision HeatPlus", "VRH-20H", "2000W", "Tip-over Safety", "Adjustable Heat"],
  "hair-dryer": ["Vision StyleDry", "VHD-18D", "1800W", "Cool Shot", "Foldable Handle"],
  "soundbar": ["Vision SoundEdge", "VSB-220", "2.1 Channel", "Bluetooth", "Deep Bass"],
  "bluetooth-speaker": ["Vision BeatBox", "VBS-40", "Portable", "Wireless", "Rechargeable"],
  "home-theater": ["Vision CinemaMax", "VHT-510", "5.1 Channel", "USB", "Remote Control"],
  "water-dispenser": ["Vision AquaServe", "VWD-3T", "Hot & Cold", "Storage Cabinet", "Low Noise"],
  "display-freezer": ["Vision FrostView", "VDF-320", "Glass Top", "Fast Freeze", "Retail Ready"],
  "display-cooler": ["Vision ChillView", "VDC-420", "Glass Door", "LED Light", "Adjustable Shelf"],
};

const visualBySubcategory = {
  "smart-tv": "tv",
  "android-tv": "tv",
  "led-tv": "tv",
  "4k-uhd-tv": "tv",
  "electric-kettle": "kettle",
  "smart-kettle": "kettle",
  "side-by-side": "fridge",
  "no-frost": "fridge",
  "direct-cool": "fridge",
  "beverage-cooler": "cooler",
  "commercial-freezer": "freezer",
  "four-door": "fridge",
  "single-door": "fridge",
  "washing-machine": "washer",
  "air-conditioner": "ac",
  "microwave-oven": "microwave",
  "fan": "fan",
  "rice-cooker": "microwave",
  "blender": "kettle",
  "induction-cooker": "microwave",
  "vacuum-cleaner": "cooler",
  "electric-iron": "kettle",
  "water-heater": "freezer",
  "room-heater": "fan",
  "hair-dryer": "fan",
  "soundbar": "tv",
  "bluetooth-speaker": "cooler",
  "home-theater": "tv",
  "water-dispenser": "cooler",
  "display-freezer": "freezer",
  "display-cooler": "cooler",
};

const refrigeratorImages = [
  "/products/refrigerator-flower-black.jpg",
  "/products/refrigerator-four-door-black.jpg",
  "/products/refrigerator-single-black.jpg",
  "/products/refrigerator-silver.jpg",
];

const deepFreezerImages = [
  "/products/deep-freezer-green-1.jpg",
  "/products/deep-freezer-green-2.jpg",
  "/products/deep-freezer-pink.jpg",
  "/products/deep-freezer-white.jpg",
];

const electricKettleImages = [
  "/products/electric-kettle-steel-black.jpeg",
  "/products/electric-kettle-rose-steel.jpg",
  "/products/electric-kettle-red-classic.jpg",
  "/products/electric-kettle-glass.jpg",
  "/products/electric-kettle-steel-round.jpg",
];

const tvImages = [
  "/products/tv-front-id.jpg",
  "/products/tv-w55s3bg.jpg",
  "/products/tv-w65s3bg.jpg",
  "/products/tv-w65s6dg.jpg",
  "/products/tv-wd55rug.jpg",
];

const washingMachineImages = [
  "/products/washing-machine-white-front.jpg",
  "/products/washing-machine-commercial-silver.jpg",
  "/products/washing-machine-blue-door.jpg",
  "/products/washing-machine-front-open.jpg",
];

const airConditionerImages = [
  "/products/air-conditioner-photo.jpg",
  "/products/washing-machine-white-front.jpg",
  "/products/refrigerator-silver.jpg",
  "/products/washing-machine-blue-door.jpg",
];

const microwaveImages = [
  "/products/electric-kettle-steel-black.jpeg",
  "/products/electric-kettle-steel-round.jpg",
  "/products/electric-kettle-red-classic.jpg",
  "/products/electric-kettle-glass.jpg",
];

const fanImages = [
  "/products/air-conditioner-photo.jpg",
  "/products/washing-machine-front-open.jpg",
  "/products/refrigerator-single-black.jpg",
  "/products/electric-kettle-glass.jpg",
];

const riceCookerImages = [
  "/products/electric-kettle-steel-round.jpg",
  "/products/electric-kettle-rose-steel.jpg",
  "/products/electric-kettle-red-classic.jpg",
  "/products/electric-kettle-glass.jpg",
];

const blenderImages = [
  "/products/blender-photo.jpg",
  "/products/electric-kettle-glass.jpg",
  "/products/electric-kettle-steel-black.jpeg",
  "/products/electric-kettle-rose-steel.jpg",
];

const inductionCookerImages = [
  "/products/electric-kettle-steel-black.jpeg",
  "/products/electric-kettle-steel-round.jpg",
  "/products/electric-kettle-red-classic.jpg",
  "/products/electric-kettle-glass.jpg",
];

const smallApplianceImages = [
  "/products/vacuum-cleaner-photo.jpg",
  "/products/washing-machine-front-open.jpg",
  "/products/air-conditioner-photo.jpg",
  "/products/electric-kettle-steel-round.jpg",
];

const audioImages = [
  "/products/soundbar-photo.jpg",
  "/products/tv-front-id.jpg",
  "/products/tv-front-id.jpg",
  "/products/tv-w55s3bg.jpg",
];

const commercialApplianceImages = [
  "/products/water-dispenser-photo.png",
  "/products/deep-freezer-white.jpg",
  "/products/deep-freezer-green-1.jpg",
  "/products/refrigerator-silver.jpg",
];

const imageBySubcategory = {
  "smart-tv": tvImages,
  "android-tv": tvImages,
  "led-tv": tvImages,
  "4k-uhd-tv": tvImages,
  "smart-kettle": [
    "/products/electric-kettle-steel-black.jpeg",
    "/products/electric-kettle-glass.jpg",
    "/products/electric-kettle-rose-steel.jpg",
    "/products/electric-kettle-steel-round.jpg",
  ],
  "side-by-side": [
    "/products/refrigerator-four-door-black.jpg",
    "/products/refrigerator-flower-black.jpg",
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-single-black.jpg",
  ],
  "no-frost": [
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-single-black.jpg",
    "/products/refrigerator-flower-black.jpg",
    "/products/refrigerator-four-door-black.jpg",
  ],
  "direct-cool": [
    "/products/refrigerator-single-black.jpg",
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-flower-black.jpg",
    "/products/refrigerator-four-door-black.jpg",
  ],
  "commercial-freezer": deepFreezerImages,
  "four-door": [
    "/products/refrigerator-flower-black.jpg",
    "/products/refrigerator-four-door-black.jpg",
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-single-black.jpg",
  ],
  "single-door": [
    "/products/refrigerator-single-black.jpg",
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-flower-black.jpg",
    "/products/refrigerator-four-door-black.jpg",
  ],
  "electric-kettle": electricKettleImages,
  "washing-machine": washingMachineImages,
  "air-conditioner": airConditionerImages,
  "microwave-oven": microwaveImages,
  "fan": fanImages,
  "rice-cooker": riceCookerImages,
  "blender": blenderImages,
  "induction-cooker": inductionCookerImages,
  "vacuum-cleaner": smallApplianceImages,
  "electric-iron": [
    "/products/vacuum-cleaner-photo.jpg",
    "/products/electric-kettle-steel-round.jpg",
    "/products/washing-machine-front-open.jpg",
    "/products/air-conditioner-photo.jpg",
  ],
  "water-heater": [
    "/products/water-dispenser-photo.png",
    "/products/air-conditioner-photo.jpg",
    "/products/deep-freezer-white.jpg",
    "/products/washing-machine-white-front.jpg",
  ],
  "room-heater": [
    "/products/air-conditioner-photo.jpg",
    "/products/electric-kettle-red-classic.jpg",
    "/products/washing-machine-front-open.jpg",
    "/products/vacuum-cleaner-photo.jpg",
  ],
  "hair-dryer": [
    "/products/vacuum-cleaner-photo.jpg",
    "/products/electric-kettle-steel-black.jpeg",
    "/products/electric-kettle-glass.jpg",
    "/products/air-conditioner-photo.jpg",
  ],
  "soundbar": audioImages,
  "bluetooth-speaker": [
    "/products/soundbar-photo.jpg",
    "/products/tv-front-id.jpg",
    "/products/tv-w55s3bg.jpg",
    "/products/tv-w65s3bg.jpg",
  ],
  "home-theater": [
    "/products/tv-front-id.jpg",
    "/products/soundbar-photo.jpg",
    "/products/tv-w65s6dg.jpg",
    "/products/tv-wd55rug.jpg",
  ],
  "water-dispenser": commercialApplianceImages,
  "display-freezer": deepFreezerImages,
  "display-cooler": [
    "/products/refrigerator-silver.jpg",
    "/products/refrigerator-single-black.jpg",
    "/products/deep-freezer-green-1.jpg",
    "/products/deep-freezer-white.jpg",
  ],
};

categories.forEach((category) => {
  if (category.image) {
    category.image = assetPath(category.image);
  }
});

export const products = categories.flatMap((category) =>
  category.subcategories.flatMap((subcategory) => {
    const seed = productSeeds[subcategory.id];
    const productCount = imageBySubcategory[subcategory.id]?.length || 4;
    return Array.from({ length: productCount }, (_, index) => ({
      id: `${subcategory.id}-${index + 1}`,
      name: index === 0 ? seed[0] : `${seed[0]} ${index + 1}`,
      model: `${seed[1]}-${index + 1}0`,
      price: `${(index + 1) * 4500 + (category.id === "refrigerators" ? 48500 : category.id === "tvs" ? 28500 : 8500)}`,
      category: category.id,
      subcategory: subcategory.id,
      visual: visualBySubcategory[subcategory.id],
      color: category.accent,
      image: assetPath(imageBySubcategory[subcategory.id]?.[index] || (category.id === "refrigerators" ? refrigeratorImages[index] : undefined)),
      description: subcategory.tagline,
      specs: [seed[2], seed[3], seed[4]],
    }));
  })
);

export const getCategory = (categoryId) => categories.find((category) => category.id === categoryId);

export const getSubcategory = (categoryId, subcategoryId) =>
  getCategory(categoryId)?.subcategories.find((subcategory) => subcategory.id === subcategoryId);

export const getProductsForSubcategory = (categoryId, subcategoryId) =>
  products.filter((product) => product.category === categoryId && product.subcategory === subcategoryId);

export const getProductsForCategory = (categoryId) =>
  products.filter((product) => product.category === categoryId);

export const getProduct = (productId) =>
  products.find((product) => product.id === productId);
