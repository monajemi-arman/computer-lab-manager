import mongoose, { Schema } from "mongoose";
import { IUser, IUserDocument } from "@/types/user";

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
  computers: [{ type: Schema.Types.ObjectId, ref: 'Computer' }]
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);