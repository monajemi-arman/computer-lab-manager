import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
  computers: [{ type: Schema.Types.ObjectId, ref: 'Computer' }]
});

export const User = mongoose.model('User', userSchema);