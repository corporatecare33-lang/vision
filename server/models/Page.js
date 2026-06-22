import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "পেজের নাম আবশ্যক"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "পেজ টাইটেল আবশ্যক"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    metaKeywords: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInFooter: {
      type: Boolean,
      default: false,
    },
    showInHeader: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "FileText",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
pageSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\u0980-\u09FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

const Page = mongoose.model("Page", pageSchema);
export default Page;