import { z } from 'zod';

export const leadCreateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(200),
  email: z.string().email('Invalid email').or(z.literal('')).default(''),
  phone: z.string().max(50).default(''),
  jobTitle: z.string().max(200).default(''),
  industry: z.string().max(100).default(''),
  employeeCount: z.number().int().positive().optional(),
  location: z.string().max(200).default(''),
  country: z.string().max(100).default(''),
  website: z.string().url().or(z.literal('')).default(''),
  domain: z.string().max(200).default(''),
  technologies: z.array(z.string().max(100)).default([]),
  revenue: z.string().max(100).default(''),
  notes: z.string().max(2000).default(''),
  status: z.enum(['new', 'reviewed', 'contacted', 'needs_verification']).default('new'),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const icpSchema = z.object({
  targetIndustries: z.array(z.string().min(1).max(100)).min(1, 'At least one target industry is required'),
  minEmployeeCount: z.number().int().min(1, 'Minimum employee count must be at least 1'),
  maxEmployeeCount: z.number().int().min(1, 'Maximum employee count must be at least 1'),
  targetLocations: z.array(z.string().max(200)).default([]),
  targetCountries: z.array(z.string().max(100)).default([]),
  targetRoles: z.array(z.string().max(200)).default([]),
  targetTechnologies: z.array(z.string().max(100)).default([]),
  additionalCriteria: z.array(z.string().max(500)).default([]),
  weights: z.object({
    industryFit: z.number().min(0).max(100),
    companySizeFit: z.number().min(0).max(100),
    locationFit: z.number().min(0).max(100),
    roleMatch: z.number().min(0).max(100),
    technologyFit: z.number().min(0).max(100),
    dataCompleteness: z.number().min(0).max(100),
  }),
}).refine(
  (data) => data.minEmployeeCount <= data.maxEmployeeCount,
  { message: 'Minimum employee count must be less than or equal to maximum', path: ['minEmployeeCount'] }
).refine(
  (data) => {
    const total = Object.values(data.weights).reduce((sum, w) => sum + w, 0);
    return total === 100;
  },
  { message: 'Qualification weights must total exactly 100', path: ['weights'] }
);

export const queryParamsSchema = z.object({
  search: z.string().optional(),
  priority: z.enum(['HIGH', 'MODERATE', 'LOW']).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['new', 'reviewed', 'contacted', 'needs_verification']).optional(),
  sortBy: z.enum(['score', 'companyName', 'employeeCount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
