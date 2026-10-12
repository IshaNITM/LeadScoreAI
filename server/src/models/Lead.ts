import mongoose, { Schema, Document } from 'mongoose';
import { Lead } from '../types.js';

export interface LeadDocument extends Omit<Lead, '_id' | 'id'>, Document {}

const leadSchema = new Schema<LeadDocument>(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    jobTitle: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    employeeCount: { type: Number, default: undefined },
    location: { type: String, default: '', trim: true },
    country: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    domain: { type: String, default: '', trim: true },
    technologies: { type: [String], default: [] },
    revenue: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted', 'needs_verification'],
      default: 'new',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete (ret as any).__v;
      },
    },
  },
);

leadSchema.index({ companyName: 'text', contactName: 'text', email: 'text' });
leadSchema.index({ industry: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ domain: 1 });

export const LeadModel = mongoose.model<LeadDocument>('Lead', leadSchema);
