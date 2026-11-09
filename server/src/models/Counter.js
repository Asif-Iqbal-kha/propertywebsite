import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  { _id: { type: String, required: true }, seq: { type: Number, default: 0 } },
  { versionKey: false },
);

counterSchema.statics.next = async function next(name) {
  const doc = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean();
  return doc.seq;
};

export const Counter = mongoose.model('Counter', counterSchema);
