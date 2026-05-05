import mongoose, { Schema, models, model, type Model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = (models.User ??
  model("User", UserSchema)) as Model<IUser>;
