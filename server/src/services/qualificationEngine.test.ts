import { describe, it, expect } from 'vitest';
import { qualifyLead, getPriority, PRIORITY_THRESHOLDS } from '../services/qualificationEngine.js';
import { Lead, IcpConfig, DEFAULT_ICP, DEFAULT_WEIGHTS } from '../types.js';

const baseIcp: IcpConfig = {
  ...DEFAULT_ICP,
  weights: { ...DEFAULT_WEIGHTS },
};

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-lead',
    companyName: 'TestCo',
    contactName: 'Test User',
    email: 'test@testco.com',
    jobTitle: 'CTO',
    industry: 'SaaS',
    employeeCount: 100,
    location: 'San Francisco',
    country: 'United States',
    website: 'https://testco.com',
    domain: 'testco.com',
    technologies: ['React', 'Node.js', 'AWS'],
    status: 'new',
    ...overrides,
  };
}

describe('QualificationEngine', () => {
  describe('getPriority', () => {
    it('returns HIGH for scores >= 75', () => {
      expect(getPriority(75)).toBe('HIGH');
      expect(getPriority(100)).toBe('HIGH');
      expect(getPriority(80)).toBe('HIGH');
    });

    it('returns MODERATE for scores >= 45 and < 75', () => {
      expect(getPriority(45)).toBe('MODERATE');
      expect(getPriority(74)).toBe('MODERATE');
      expect(getPriority(60)).toBe('MODERATE');
    });

    it('returns LOW for scores < 45', () => {
      expect(getPriority(44)).toBe('LOW');
      expect(getPriority(0)).toBe('LOW');
      expect(getPriority(30)).toBe('LOW');
    });

    it('handles boundary scores exactly', () => {
      expect(getPriority(44)).toBe('LOW');
      expect(getPriority(45)).toBe('MODERATE');
      expect(getPriority(74)).toBe('MODERATE');
      expect(getPriority(75)).toBe('HIGH');
    });
  });

  describe('qualifyLead', () => {
    it('scores a perfect ICP match highly', () => {
      const lead = makeLead();
      const result = qualifyLead(lead, baseIcp);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.priority).toBe('HIGH');
      expect(result.factors).toHaveLength(6);
    });

    it('produces deterministic results', () => {
      const lead = makeLead();
      const result1 = qualifyLead(lead, baseIcp);
      const result2 = qualifyLead(lead, baseIcp);
      expect(result1.score).toBe(result2.score);
      expect(result1.priority).toBe(result2.priority);
      expect(result1.factors.map(f => f.earnedPoints))
        .toEqual(result2.factors.map(f => f.earnedPoints));
    });

    it('scores a partial match as MODERATE', () => {
      const lead = makeLead({
        industry: 'E-Commerce',
        employeeCount: 300,
        location: 'Denver',
      });
      const result = qualifyLead(lead, baseIcp);
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.score).toBeLessThan(75);
    });

    it('scores a clear mismatch as LOW', () => {
      const lead = makeLead({
        industry: 'Agriculture',
        employeeCount: 15000,
        location: 'London',
        country: 'United Kingdom',
        jobTitle: 'Junior Analyst',
        technologies: ['SAP', 'Oracle'],
      });
      const result = qualifyLead(lead, baseIcp);
      expect(result.priority).toBe('LOW');
      expect(result.negativeSignals.length).toBeGreaterThan(0);
    });

    it('handles missing employee count as UNKNOWN, not MISMATCH', () => {
      const lead = makeLead({ employeeCount: undefined });
      const result = qualifyLead(lead, baseIcp);
      const sizeFactor = result.factors.find(f => f.factor === 'Company Size Fit');
      expect(sizeFactor).toBeDefined();
      expect(sizeFactor!.matchStatus).toBe('UNKNOWN');
      expect(sizeFactor!.earnedPoints).toBe(0);
    });

    it('handles missing location as UNKNOWN', () => {
      const lead = makeLead({ location: '', country: '' });
      const result = qualifyLead(lead, baseIcp);
      const locFactor = result.factors.find(f => f.factor === 'Location Fit');
      expect(locFactor).toBeDefined();
      expect(locFactor!.matchStatus).toBe('UNKNOWN');
    });

    it('handles missing job title as UNKNOWN', () => {
      const lead = makeLead({ jobTitle: '' });
      const result = qualifyLead(lead, baseIcp);
      const roleFactor = result.factors.find(f => f.factor === 'Decision-Maker Role Fit');
      expect(roleFactor).toBeDefined();
      expect(roleFactor!.matchStatus).toBe('UNKNOWN');
    });

    it('handles missing technologies as UNKNOWN', () => {
      const lead = makeLead({ technologies: [] });
      const result = qualifyLead(lead, baseIcp);
      const techFactor = result.factors.find(f => f.factor === 'Technology/Business Fit');
      expect(techFactor).toBeDefined();
      expect(techFactor!.matchStatus).toBe('UNKNOWN');
    });

    it('clamps score to 0-100 range', () => {
      const lead = makeLead();
      const result = qualifyLead(lead, baseIcp);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('returns all 6 qualification factors', () => {
      const lead = makeLead();
      const result = qualifyLead(lead, baseIcp);
      expect(result.factors).toHaveLength(6);
      const factorNames = result.factors.map(f => f.factor);
      expect(factorNames).toContain('Industry Fit');
      expect(factorNames).toContain('Company Size Fit');
      expect(factorNames).toContain('Location Fit');
      expect(factorNames).toContain('Decision-Maker Role Fit');
      expect(factorNames).toContain('Technology/Business Fit');
      expect(factorNames).toContain('Data Completeness');
    });

    it('includes positive signals for matching factors', () => {
      const lead = makeLead();
      const result = qualifyLead(lead, baseIcp);
      expect(result.positiveSignals.length).toBeGreaterThan(0);
    });

    it('includes negative signals for mismatched factors', () => {
      const lead = makeLead({ industry: 'Agriculture' });
      const result = qualifyLead(lead, baseIcp);
      expect(result.negativeSignals.length).toBeGreaterThan(0);
    });

    it('includes missing info for UNKNOWN factors', () => {
      const lead = makeLead({ employeeCount: undefined, technologies: [] });
      const result = qualifyLead(lead, baseIcp);
      expect(result.missingInfo.length).toBeGreaterThan(0);
    });

    it('generates an explanation string', () => {
      const lead = makeLead();
      const result = qualifyLead(lead, baseIcp);
      expect(result.explanation).toBeTruthy();
      expect(result.explanation).toContain('TestCo');
    });

    it('correctly normalizes CTO title', () => {
      const lead = makeLead({ jobTitle: 'Chief Technology Officer' });
      const result = qualifyLead(lead, baseIcp);
      const roleFactor = result.factors.find(f => f.factor === 'Decision-Maker Role Fit');
      expect(roleFactor!.matchStatus).toBe('MATCH');
      expect(roleFactor!.earnedPoints).toBe(baseIcp.weights.roleMatch);
    });

    it('gives partial credit for seniority but non-matching role', () => {
      const lead = makeLead({ jobTitle: 'Senior Software Engineer' });
      const result = qualifyLead(lead, baseIcp);
      const roleFactor = result.factors.find(f => f.factor === 'Decision-Maker Role Fit');
      expect(roleFactor!.earnedPoints).toBeGreaterThan(0);
      expect(roleFactor!.earnedPoints).toBeLessThan(baseIcp.weights.roleMatch);
    });
  });
});
