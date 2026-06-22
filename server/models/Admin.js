import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "নাম আবশ্যক"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "ইউজারনেম আবশ্যক"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "ইমেইল আবশ্যক"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "পাসওয়ার্ড আবশ্যক"],
      minlength: [6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"],
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook: পাসওয়ার্ড অটোমেটিক হ্যাশ করা
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// পাসওয়ার্ড compare করার মেথড
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// লগইন helper - ইউজারনেম বা ইমেইল দিয়ে খোঁজে
adminSchema.statics.findByCredentials = async function (username) {
  return this.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: username?.toLowerCase() },
    ],
  });
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
