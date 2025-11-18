import { IFileDocument } from "@/types/file";
import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
    filename: { type: String, required: true },
    access: { type: String, enum: ['public', 'private'], required: true },
    owner: { type: String, required: true },
    users: [{ type: String, required: false }],
    size: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now }
});

export const FileModel = (mongoose.models && mongoose.models.File) ?
    mongoose.models.File :
    mongoose.model<IFileDocument>('File', fileSchema);