import { describe, it, expect } from 'vitest';
import { enrichWithAction } from '../services/nextBestAction.js';
import { Lead, QualificationResult } from '../types.js';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-lead',
    companyName: 'TestCo',
    contactName: 'Test User',
    email: 'test@testco.com',
    phone: '+1-555-0100',
    jobTitle: 'CTO',
    industry: 'SaaS',
    employeeCount: 100,
    status: 'new',
    ...overrides,
  };
}

function makeResult(overrides: Partial<QualificationResult> = {}): QualificationResult {
  return {
    leadId: 'test-lead',
    score: 85,
    priority: 'HIGH',
    factors: [],
    positiveSignals: ['Industry matches target'],
    negativeSignals: [],
    missingInfo: [],
    explanation: 'Test explanation',
    recommendation: '',
    recommendationReason: '',
    aiEnhanced: false,
    qualifiedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('NextBestAction', () => {
  it('recommends outreach for HIGH priority with email', () => {
    const lead = makeLead({ email: 'test@testco.com' });
    const result = makeResult({ priority: 'HIGH', score: 85 });
    const enriched = enrichWithAction(lead, result);
    expect(enriched.recommendation).toContain('outreach');
  });

  it('recommends finding email for HIGH priority without email', () => {
    const lead = makeLead({ email: '' });
    const result = makeResult({ priority: 'HIGH', score: 85 });
    const enriched = enrichWithAction(lead, result);
    expect(enriched.recommendation.toLowerCase()).toContain('email');
  });

  it('recommends verification for MODERATE priority with missing info', () => {
    const lead = makeLead();
    const result = makeResult({
      priority: 'MODERATE',
      score: 55,
      missingInfo: ['Employee count unknown'],
    });
    const enriched = enrichWithAction(lead, result);
    expect(enriched.recommendation.toLowerCase()).toContain('verif');
  });

  it('recommends deprioritizing LOW priority leads', () => {
    const lead = makeLead();
    const result = makeResult({
      priority: 'LOW',
      score: 30,
      negativeSignals: ['Industry mismatch'],
    });
    const enriched = enrichWithAction(lead, result);
    expect(enriched.recommendation.toLowerCase()).toContain('deprioritize');
  });
});
