import mongoose from 'mongoose';

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'];
export const INQUIRY_KINDS = ['general', 'property', 'visit'];

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    kind: { type: String, enum: INQUIRY_KINDS, default: 'general' },
    visitDate: { type: Date, default: null },
    preferredContact: { type: String, enum: ['call', 'whatsapp'], default: 'call' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    propertyTitle: { type: String, default: '' },
    propertyRef: { type: String, default: '' },
    propertySlug: { type: String, default: '' },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new' },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    page: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true, versionKey: false },
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
