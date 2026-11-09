import mongoose from 'mongoose';

export const PROPERTY_TYPES = ['residential-plot', 'commercial-plot', 'house', 'apartment', 'shop', 'plot-file'];
export const PURPOSES = ['sale', 'rent'];
export const STATUSES = ['available', 'booked', 'sold'];
export const AREA_UNITS = ['marla', 'kanal', 'sqft'];
export const FREQUENCIES = ['monthly', 'quarterly', 'half-yearly'];

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, maxlength: 300 },
    thumb: { type: String, maxlength: 300, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    alt: { type: String, trim: true, maxlength: 160, default: '' },
  },
  { _id: false },
);

const shortText = (max) => ({ type: String, trim: true, maxlength: max, default: '' });

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [140, 'Title must be 140 characters or fewer.'],
    },
    slug: { type: String, required: true, unique: true },
    ref: { type: String, required: true, unique: true },
    purpose: { type: String, enum: PURPOSES, default: 'sale' },
    type: { type: String, enum: PROPERTY_TYPES, required: [true, 'Property type is required.'] },
    area: {
      value: {
        type: Number,
        required: [true, 'Size is required.'],
        min: [0.1, 'Size must be greater than zero.'],
        max: 1000000,
      },
      unit: { type: String, enum: AREA_UNITS, default: 'marla' },
    },
    // Normalised size used for filtering/sorting (1 Kanal = 20 Marla).
    areaMarla: { type: Number, index: true },
    price: { type: Number, min: [0, 'Price cannot be negative.'], default: null },
    installment: {
      available: { type: Boolean, default: false },
      downPayment: { type: Number, min: 0, default: null },
      amount: { type: Number, min: 0, default: null },
      count: { type: Number, min: 0, max: 600, default: null },
      frequency: { type: String, enum: FREQUENCIES, default: 'monthly' },
    },
    location: {
      block: shortText(60),
      phase: shortText(60),
      street: shortText(60),
      plotNo: shortText(30),
      address: shortText(200),
    },
    bedrooms: { type: Number, min: 0, max: 50, default: null },
    bathrooms: { type: Number, min: 0, max: 50, default: null },
    features: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: [],
      validate: [(v) => v.length <= 30, 'Up to 30 features are allowed.'],
    },
    description: { type: String, trim: true, maxlength: [5000, 'Description is too long.'], default: '' },
    images: {
      type: [imageSchema],
      default: [],
      validate: [(v) => v.length <= 20, 'Up to 20 photos are allowed.'],
    },
    status: { type: String, enum: STATUSES, default: 'available' },
    featured: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

propertySchema.index({ status: 1, featured: -1, createdAt: -1 });
propertySchema.index({ type: 1, purpose: 1, status: 1 });
propertySchema.index({ price: 1 });

propertySchema.pre('validate', async function normaliseArea() {
  const value = this.area?.value;
  const unit = this.area?.unit;
  if (!value) return;
  if (unit === 'kanal') this.areaMarla = value * 20;
  else if (unit === 'sqft') this.areaMarla = Math.round((value / 225) * 100) / 100;
  else this.areaMarla = value;
});

export const Property = mongoose.model('Property', propertySchema);
