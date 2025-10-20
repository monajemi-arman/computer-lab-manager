import { IComputerDocument } from "@/types/computer";
import mongoose, { Schema } from "mongoose";

const computerSchema = new Schema({
  address: { type: String, required: true },
  hostname: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export const ComputerModel = (mongoose.models && mongoose.models.Computer) ||
  mongoose.model<IComputerDocument>('Computer', computerSchema);