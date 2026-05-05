import mongoose, { Schema, models, model, type Model } from "mongoose";

export interface IPage {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  puckData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    puckData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

PageSchema.index({ projectId: 1, slug: 1 }, { unique: true });

export const Page = (models.Page ??
  model("Page", PageSchema)) as Model<IPage>;
