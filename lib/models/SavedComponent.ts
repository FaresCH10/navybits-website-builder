import mongoose, { Schema, models, model, type Model } from "mongoose";

/** User-saved reusable block: component type + default props snapshot */
export interface ISavedComponent {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  name: string;
  componentType: string;
  props: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SavedComponentSchema = new Schema<ISavedComponent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true },
    componentType: { type: String, required: true },
    props: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

SavedComponentSchema.index({ userId: 1, name: 1 });

export const SavedComponent = (models.SavedComponent ??
  model(
    "SavedComponent",
    SavedComponentSchema
  )) as Model<ISavedComponent>;
