import mongoose, { Schema, models, model, type Model } from "mongoose";

export interface IProject {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const Project = (models.Project ??
  model("Project", ProjectSchema)) as Model<IProject>;
