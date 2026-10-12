import { describe, it, expect } from 'vitest';
import { detectDuplicates } from '../services/duplicateDetection.js';
import { Lead } from '../types.js';

describe('DuplicateDetection', () => {
  it('detects exact domain duplicates', () => {
    const leads: Lead[] = [
      { id: '1', companyName: 'Co A', contactName: 'A', email: 'a@co.com', domain: 'co.com', jobTitle: '', industry: '', status: 'new' },
      { id: '2', companyName: 'Co B', contactName: 'B', email: 'b@co.com', domain: 'co.com', jobTitle: '', industry: '', status: 'new' },
    ];
    const groups = detectDuplicates(leads);
    expect(groups.length).toBeGreaterThanOrEqual(1);
    const domainGroup = groups.find(g => g.type === 'exact_domain');
    expect(domainGroup).toBeDefined();
    expect(domainGroup!.confidence).toBe('confirmed');
    expect(domainGroup!.leads).toContain('1');
    expect(domainGroup!.leads).toContain('2');
  });

  it('detects exact email duplicates', () => {
    const leads: Lead[] = [
      { id: '1', companyName: 'Co A', contactName: 'A', email: 'same@test.com', domain: 'test1.com', jobTitle: '', industry: '', status: 'new' },
      { id: '2', companyName: 'Co B', contactName: 'B', email: 'same@test.com', domain: 'test2.com', jobTitle: '', industry: '', status: 'new' },
    ];
    const groups = detectDuplicates(leads);
    const emailGroup = groups.find(g => g.type === 'exact_email');
    expect(emailGroup).toBeDefined();
    expect(emailGroup!.confidence).toBe('confirmed');
  });

  it('detects name similarity duplicates', () => {
    const leads: Lead[] = [
      { id: '1', companyName: 'DataForge Inc', contactName: 'A', email: 'a@df1.com', domain: 'df1.com', jobTitle: '', industry: '', status: 'new' },
      { id: '2', companyName: 'DataForge', contactName: 'B', email: 'b@df2.com', domain: 'df2.com', jobTitle: '', industry: '', status: 'new' },
    ];
    const groups = detectDuplicates(leads);
    const nameGroup = groups.find(g => g.type === 'name_similarity');
    expect(nameGroup).toBeDefined();
    expect(nameGroup!.confidence).toBe('potential');
  });

  it('returns empty array when no duplicates exist', () => {
    const leads: Lead[] = [
      { id: '1', companyName: 'CompanyA', contactName: 'A', email: 'a@a.com', domain: 'a.com', jobTitle: '', industry: '', status: 'new' },
      { id: '2', companyName: 'CompanyB', contactName: 'B', email: 'b@b.com', domain: 'b.com', jobTitle: '', industry: '', status: 'new' },
    ];
    const groups = detectDuplicates(leads);
    expect(groups).toHaveLength(0);
  });
});
