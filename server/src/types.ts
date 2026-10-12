// ── Shared Types ──────────────────────────────────────────────

export interface Lead {
  _id?: string;
  id?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  industry: string;
  employeeCount?: number;
  location?: string;
  country?: string;
  website?: string;
  domain?: string;
  technologies?: string[];
  revenue?: string;
  notes?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'needs_verification';
  createdAt?: string;
  updatedAt?: string;
}

export interface IcpConfig {
  _id?: string;
  targetIndustries: string[];
  minEmployeeCount: number;
  maxEmployeeCount: number;
  targetLocations: string[];
  targetCountries: string[];
  targetRoles: string[];
  targetTechnologies: string[];
  additionalCriteria?: string[];
  weights: QualificationWeights;
  updatedAt?: string;
}

export interface QualificationWeights {
  industryFit: number;
  companySizeFit: number;
  locationFit: number;
  roleMatch: number;
  technologyFit: number;
  dataCompleteness: number;
}

export const DEFAULT_WEIGHTS: QualificationWeights = {
  industryFit: 25,
  companySizeFit: 20,
  locationFit: 15,
  roleMatch: 15,
  technologyFit: 15,
  dataCompleteness: 10,
};

export const DEFAULT_ICP: Omit<IcpConfig, '_id'> = {
  targetIndustries: ['SaaS', 'Technology', 'Software', 'Cloud Computing'],
  minEmployeeCount: 50,
  maxEmployeeCount: 500,
  targetLocations: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston', 'Denver'],
  targetCountries: ['United States', 'US', 'USA'],
  targetRoles: ['Founder', 'CEO', 'CTO', 'VP Engineering', 'VP of Engineering', 'Chief Technology Officer', 'Chief Executive Officer', 'Co-Founder'],
  targetTechnologies: ['React', 'Node.js', 'AWS', 'Python', 'Kubernetes', 'Docker', 'TypeScript', 'PostgreSQL', 'MongoDB'],
  weights: { ...DEFAULT_WEIGHTS },
};

export type MatchStatus = 'MATCH' | 'MISMATCH' | 'UNKNOWN';

export type Priority = 'HIGH' | 'MODERATE' | 'LOW';

export interface QualificationFactor {
  factor: string;
  maxPoints: number;
  earnedPoints: number;
  matchStatus: MatchStatus;
  explanation: string;
  evidence: string[];
}

export interface QualificationResult {
  leadId: string;
  score: number;
  priority: Priority;
  factors: QualificationFactor[];
  positiveSignals: string[];
  negativeSignals: string[];
  missingInfo: string[];
  explanation: string;
  recommendation: string;
  recommendationReason: string;
  aiEnhanced: boolean;
  qualifiedAt: string;
}

export interface DuplicateGroup {
  type: 'exact_domain' | 'exact_email' | 'name_similarity';
  confidence: 'confirmed' | 'potential';
  leads: string[];
  matchField: string;
  matchValue: string;
}

export interface DashboardStats {
  totalLeads: number;
  highPriority: number;
  moderatePriority: number;
  lowPriority: number;
  needsVerification: number;
  avgScore: number;
  industryBreakdown: { industry: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  demoMode: boolean;
}
