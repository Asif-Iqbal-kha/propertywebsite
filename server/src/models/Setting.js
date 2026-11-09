import mongoose from 'mongoose';
import { imageSchema, FREQUENCIES } from './Property.js';

const { Schema } = mongoose;
const text = (max) => ({ type: String, trim: true, maxlength: max, default: '' });

const factSchema = new Schema({ label: text(60), value: text(120) }, { _id: false });

const featureSchema = new Schema({ icon: text(40), title: text(80), description: text(400) }, { _id: false });

const planSchema = new Schema(
  {
    title: text(80),
    totalPrice: { type: Number, min: 0, default: null },
    downPayment: { type: Number, min: 0, default: null },
    installmentAmount: { type: Number, min: 0, default: null },
    installmentCount: { type: Number, min: 0, max: 600, default: null },
    frequency: { type: String, enum: FREQUENCIES, default: 'monthly' },
    possessionAmount: { type: Number, min: 0, default: null },
    notes: text(300),
  },
  { _id: false },
);

const cityFactSchema = new Schema({ value: text(30), label: text(80), detail: text(200) }, { _id: false });

const guideItemSchema = new Schema({ title: text(100), body: text(500) }, { _id: false });

const settingSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true },
    business: {
      name: text(60),
      officeName: text(60),
      tagline: text(120),
      phone: text(30),
      phoneDisplay: text(30),
      whatsapp: text(20),
      email: text(120),
      address: text(200),
      city: text(80),
      officeHours: text(120),
      mapQuery: text(160),
      socials: {
        facebook: text(200),
        instagram: text(200),
        youtube: text(200),
        tiktok: text(200),
      },
    },
    hero: {
      eyebrow: text(80),
      title: text(80),
      highlight: text(60),
      subtitle: text(400),
      image: { type: imageSchema, default: null },
    },
    about: {
      heading: text(120),
      body: text(4000),
      services: { type: [featureSchema], default: [] },
    },
    society: {
      overview: text(4000),
      facts: { type: [factSchema], default: [] },
      amenities: { type: [featureSchema], default: [] },
      masterPlan: { type: imageSchema, default: null },
    },
    payment: {
      intro: text(600),
      plans: { type: [planSchema], default: [] },
      terms: text(1500),
    },
    city: {
      heading: text(80),
      intro: text(600),
      facts: { type: [cityFactSchema], default: [] },
      sourceNote: text(200),
      sourceUrl: text(300),
    },
    guide: {
      heading: text(100),
      items: { type: [guideItemSchema], default: [] },
      sourceNote: text(200),
      sourceUrl: text(300),
    },
    seo: {
      title: text(80),
      description: text(200),
    },
  },
  { timestamps: true, versionKey: false, minimize: false },
);

export const SETTING_SECTIONS = ['business', 'hero', 'about', 'society', 'payment', 'city', 'guide', 'seo'];

export const Setting = mongoose.model('Setting', settingSchema);
