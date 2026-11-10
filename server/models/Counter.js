import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true },
});

export const Counter = mongoose.model('Counter', counterSchema);
