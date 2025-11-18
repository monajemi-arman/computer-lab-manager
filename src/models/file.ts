import { IFileDocument } from "@/types/file";
import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
    uuid: { type: String, required: true },
    filename: { type: String, required: true },
    access: { type: String, enum: ['public', 'private'], required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    size: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now }
});

export const ComputerModel = (mongoose.models && mongoose.models.Computer) ?
    mongoose.models.File :
    mongoose.model<IFileDocument>('File', fileSchema);