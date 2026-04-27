import { Schema, Document, models, model, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "farmer" | "admin";
  isVerified?: boolean;
  // Farming profile (used for chat personalization, weather, prices)
  state?: string;
  district?: string;
  village?: string;
  lat?: number;
  lon?: number;
  primaryCrops?: string[];
  farmSizeAcres?: number;
  preferredLanguage?: string;
  phone?: string;
  // Legacy "favorite" fields kept for backward compat
  favoriteVegetable?: string;
  favoriteFruit?: string;
  favoriteTree?: string;
  favoriteFlower?: string;
  favoriteSeason?: string;
  favoriteActivity?: string;
  profileCompleted?: boolean;
  createdAt?: Date;
  forgetPasswordToken?: string;
  forgetPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Please enter your name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  role: {
    type: String,
    enum: ["farmer", "admin"],
    default: "farmer",
  },
  isVerified: { type: Boolean, default: false },

  // Farming profile
  state: { type: String, default: "" },
  district: { type: String, default: "" },
  village: { type: String, default: "" },
  lat: Number,
  lon: Number,
  primaryCrops: { type: [String], default: [] },
  farmSizeAcres: Number,
  preferredLanguage: { type: String, default: "en" },
  phone: { type: String, default: "" },

  // Legacy favorites — left in for back-compat with old data
  favoriteVegetable: { type: String, default: "" },
  favoriteFruit: { type: String, default: "" },
  favoriteTree: { type: String, default: "" },
  favoriteFlower: { type: String, default: "" },
  favoriteSeason: { type: String, default: "" },
  favoriteActivity: { type: String, default: "" },

  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  forgetPasswordToken: String,
  forgetPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
});

const User: Model<IUser> = models.User || model<IUser>("User", userSchema);
export default User;
