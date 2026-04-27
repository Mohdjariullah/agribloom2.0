import { Schema, Document, models, model, Model } from "mongoose";

export type SchemeType =
  | "subsidy"
  | "insurance"
  | "credit"
  | "training"
  | "input_support"
  | "marketing"
  | "pension"
  | "other";

export type SchemeStatus = "active" | "expired" | "upcoming";

export interface IGovtScheme extends Document {
  slug: string;
  name: string;
  shortName?: string;
  nameHindi?: string;
  type: SchemeType;
  description: string;
  benefits: string;
  eligibility: string[];
  applicationProcess?: string;
  requiredDocuments: string[];
  officialUrl?: string;
  helpline?: string;
  ministry?: string;
  applicableStates: string[]; // empty = all India
  targetFarmers: string[]; // small, marginal, women, sc_st, all, etc
  status: SchemeStatus;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const schemeSchema = new Schema<IGovtScheme>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: String,
    nameHindi: String,
    type: {
      type: String,
      enum: ["subsidy", "insurance", "credit", "training", "input_support", "marketing", "pension", "other"],
      default: "other",
      index: true,
    },
    description: { type: String, default: "" },
    benefits: { type: String, default: "" },
    eligibility: { type: [String], default: [] },
    applicationProcess: String,
    requiredDocuments: { type: [String], default: [] },
    officialUrl: String,
    helpline: String,
    ministry: String,
    applicableStates: { type: [String], default: [] },
    targetFarmers: { type: [String], default: [], index: true },
    status: { type: String, enum: ["active", "expired", "upcoming"], default: "active", index: true },
    lastUpdated: Date,
  },
  { timestamps: true }
);

schemeSchema.index(
  { name: "text", description: "text", benefits: "text" },
  { weights: { name: 10, description: 3, benefits: 5 }, name: "scheme_text_search" }
);

const GovtScheme: Model<IGovtScheme> =
  models.GovtScheme || model<IGovtScheme>("GovtScheme", schemeSchema);
export default GovtScheme;
