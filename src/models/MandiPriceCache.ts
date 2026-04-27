import { Schema, Document, models, model, Model } from "mongoose";

export interface IMandiPrice extends Document {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  arrivalDate: Date;
  fetchedAt: Date;
}

const mandiPriceSchema = new Schema<IMandiPrice>(
  {
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    market: { type: String, required: true, index: true },
    commodity: { type: String, required: true, index: true },
    variety: { type: String, default: "" },
    grade: { type: String, default: "" },
    minPrice: { type: Number },
    maxPrice: { type: Number },
    modalPrice: { type: Number },
    arrivalDate: { type: Date, required: true, index: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mandiPriceSchema.index(
  { market: 1, commodity: 1, variety: 1, arrivalDate: 1 },
  { unique: true }
);
mandiPriceSchema.index({ state: 1, commodity: 1, arrivalDate: -1 });
mandiPriceSchema.index({ commodity: 1, arrivalDate: -1 });

const MandiPrice: Model<IMandiPrice> =
  models.MandiPrice || model<IMandiPrice>("MandiPrice", mandiPriceSchema);
export default MandiPrice;
