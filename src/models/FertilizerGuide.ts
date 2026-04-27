import { Schema, Document, models, model, Model } from "mongoose";

export interface FertilizerDose {
  name: string;
  dose: string;
  timing: string;
}

export interface IFertilizerGuide extends Document {
  cropSlug: string; // slug of the corresponding Crop document
  cropName: string;
  nitrogenKgPerHectare?: number;
  phosphorusKgPerHectare?: number;
  potassiumKgPerHectare?: number;
  recommendedFertilizers: FertilizerDose[];
  organicAlternatives: string[];
  soilPrepNotes?: string;
  micronutrients?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const fertilizerSchema = new Schema<IFertilizerGuide>(
  {
    cropSlug: { type: String, required: true, unique: true, lowercase: true, index: true },
    cropName: { type: String, required: true, trim: true },
    nitrogenKgPerHectare: Number,
    phosphorusKgPerHectare: Number,
    potassiumKgPerHectare: Number,
    recommendedFertilizers: {
      type: [
        new Schema<FertilizerDose>(
          {
            name: String,
            dose: String,
            timing: String,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    organicAlternatives: { type: [String], default: [] },
    soilPrepNotes: String,
    micronutrients: String,
  },
  { timestamps: true }
);

const FertilizerGuide: Model<IFertilizerGuide> =
  models.FertilizerGuide || model<IFertilizerGuide>("FertilizerGuide", fertilizerSchema);
export default FertilizerGuide;
