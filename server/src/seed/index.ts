import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LeadModel } from '../models/Lead.js';
import { IcpModel } from '../models/Icp.js';
import { demoLeads } from './demoData.js';
import { DEFAULT_ICP } from '../types.js';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Cannot seed database.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await LeadModel.deleteMany({});
  await IcpModel.deleteMany({});
  console.log('Cleared existing data');

  // Seed leads
  await LeadModel.insertMany(demoLeads.map(l => {
    const { id, ...rest } = l;
    return rest;
  }));
  console.log(`Seeded ${demoLeads.length} leads`);

  // Seed default ICP
  await IcpModel.create(DEFAULT_ICP);
  console.log('Seeded default ICP configuration');

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
