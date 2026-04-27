import { Schema, Document, models, model, Model } from "mongoose";

export type Season = "kharif" | "rabi" | "zaid";
export type WaterRequirement = "low" | "medium" | "high";
export type CropCategory =
  | "cereal"
  | "pulse"
  | "vegetable"
  | "fruit"
  | "oilseed"
  | "spice"
  | "cash_crop"
  | "other";

export interface ICrop extends Document {
  slug: string;
  name: string;
  nameHindi?: string;
  nameKannada?: string;
  scientificName?: string;
  category: CropCategory;
  season: Season[];
  soilTypes: string[];
  idealTempMinC?: number;
  idealTempMaxC?: number;
  idealRainfallMm?: number;
  waterRequirement?: WaterRequirement;
  waterRequirementText?: string;
  growingDurationDays?: number;
  avgYieldPerHectare?: string;
  seedVarieties: string[];
  states: string[];
  description?: string;
  sowingMethod?: string;
  sowingMonth?: string;
  floweringPeriod?: string;
  harvestingMonth?: string;
  sunlightRequirement?: string;
  harvestIndicators?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameHindi: { type: String, trim: true },
    nameKannada: { type: String, trim: true },
    scientificName: { type: String, trim: true },
    category: {
      type: String,
      enum: ["cereal", "pulse", "vegetable", "fruit", "oilseed", "spice", "cash_crop", "other"],
      default: "other",
      index: true,
    },
    season: {
      type: [String],
      enum: ["kharif", "rabi", "zaid"],
      default: [],
      index: true,
    },
    soilTypes: { type: [String], default: [] },
    idealTempMinC: Number,
    idealTempMaxC: Number,
    idealRainfallMm: Number,
    waterRequirement: { type: String, enum: ["low", "medium", "high"] },
    waterRequirementText: String,
    growingDurationDays: Number,
    avgYieldPerHectare: String,
    seedVarieties: { type: [String], default: [] },
    states: { type: [String], default: [], index: true },
    description: String,
    sowingMethod: String,
    sowingMonth: String,
    floweringPeriod: String,
    harvestingMonth: String,
    sunlightRequirement: String,
    harvestIndicators: String,
    imageUrl: String,
  },
  { timestamps: true }
);

// Text index for full-text search across primary string fields
cropSchema.index(
  {
    name: "text",
    nameHindi: "text",
    nameKannada: "text",
    scientificName: "text",
    description: "text",
  },
  { weights: { name: 10, scientificName: 5, description: 1 }, name: "crop_text_search" }
);

const Crop: Model<ICrop> = models.Crop || model<ICrop>("Crop", cropSchema);
export default Crop;
