import mongoose, { Schema } from "mongoose";
import { IUserDocument } from "@/types/user";

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
  privatekey: { type: String, required: false},
  publicKey: { type: String, required: false},
  computers: [{ type: Schema.Types.ObjectId, ref: 'Computer' }]
});

export const UserModel = (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUserDocument>('User', userSchema);