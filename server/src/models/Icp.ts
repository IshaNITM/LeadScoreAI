import mongoose, { Schema, Document } from 'mongoose';
import { IcpConfig, DEFAULT_WEIGHTS } from '../types.js';

export interface IcpDocument extends Omit<IcpConfig, '_id'>, Document {}

const icpSchema = new Schema<IcpDocument>(
  {
    targetIndustries: { type: [String], required: true },
    minEmployeeCount: { type: Number, required: true },
    maxEmployeeCount: { type: Number, required: true },
    targetLocations: { type: [String], default: [] },
    targetCountries: { type: [String], default: [] },
    targetRoles: { type: [String], default: [] },
    targetTechnologies: { type: [String], default: [] },
    additionalCriteria: { type: [String], default: [] },
    weights: {
      industryFit: { type: Number, default: DEFAULT_WEIGHTS.industryFit },
      companySizeFit: { type: Number, default: DEFAULT_WEIGHTS.companySizeFit },
      locationFit: { type: Number, default: DEFAULT_WEIGHTS.locationFit },
      roleMatch: { type: Number, default: DEFAULT_WEIGHTS.roleMatch },
      technologyFit: { type: Number, default: DEFAULT_WEIGHTS.technologyFit },
      dataCompleteness: { type: Number, default: DEFAULT_WEIGHTS.dataCompleteness },
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

export const IcpModel = mongoose.model<IcpDocument>('Icp', icpSchema);
