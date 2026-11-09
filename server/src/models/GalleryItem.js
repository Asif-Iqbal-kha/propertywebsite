import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, maxlength: 300 },
    thumb: { type: String, maxlength: 300, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    caption: { type: String, trim: true, maxlength: 160, default: '' },
    category: { type: String, trim: true, maxlength: 40, default: 'General' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

galleryItemSchema.index({ order: 1, createdAt: -1 });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
