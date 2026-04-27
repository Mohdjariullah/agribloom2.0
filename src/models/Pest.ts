import { Schema, Document, models, model, Model } from "mongoose";

export type PestType = "pest" | "disease" | "weed";
export type Severity = "low" | "medium" | "high" | "critical";

export interface IPest extends Document {
  slug: string;
  name: string;
  nameHindi?: string;
  type: PestType;
  affectedCrops: string[]; // free-form crop names (kept simple — links via name match)
  symptoms: string;
  effect?: string;
  favorableConditions?: string;
  prevention: string[];
  chemicalControl: string[];
  organicControl: string[];
  imageUrl?: string;
  severity?: Severity;
  createdAt?: Date;
  updatedAt?: Date;
}

const pestSchema = new Schema<IPest>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameHindi: String,
    type: { type: String, enum: ["pest", "disease", "weed"], default: "pest", index: true },
    affectedCrops: { type: [String], default: [], index: true },
    symptoms: { type: String, default: "" },
    effect: String,
    favorableConditions: String,
    prevention: { type: [String], default: [] },
    chemicalControl: { type: [String], default: [] },
    organicControl: { type: [String], default: [] },
    imageUrl: String,
    severity: { type: String, enum: ["low", "medium", "high", "critical"] },
  },
  { timestamps: true }
);

pestSchema.index(
  { name: "text", symptoms: "text", effect: "text" },
  { weights: { name: 10, symptoms: 5, effect: 1 }, name: "pest_text_search" }
);

const Pest: Model<IPest> = models.Pest || model<IPest>("Pest", pestSchema);
export default Pest;
