import { Lead, IcpConfig, DEFAULT_ICP, QualificationResult } from '../types.js';
import { demoLeads } from '../seed/demoData.js';

/**
 * In-memory data store for demo mode (when MongoDB is unavailable).
 * Clearly identified as non-persistent demo data.
 */
class DemoStore {
  private leads: Lead[];
  private icp: IcpConfig;
  private qualificationResults: Map<string, QualificationResult>;

  constructor() {
    this.leads = JSON.parse(JSON.stringify(demoLeads));
    this.icp = JSON.parse(JSON.stringify(DEFAULT_ICP));
    this.qualificationResults = new Map();
  }

  // ── Leads ────────────────────────────────────────────────
  getLeads(): Lead[] {
    return [...this.leads];
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find(l => l.id === id || l._id === id);
  }

  createLead(data: Partial<Lead>): Lead {
    const id = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const lead: Lead = {
      id,
      companyName: data.companyName || '',
      contactName: data.contactName || '',
      email: data.email || '',
      phone: data.phone || '',
      jobTitle: data.jobTitle || '',
      industry: data.industry || '',
      employeeCount: data.employeeCount,
      location: data.location || '',
      country: data.country || '',
      website: data.website || '',
      domain: data.domain || '',
      technologies: data.technologies || [],
      revenue: data.revenue || '',
      notes: data.notes || '',
      status: data.status || 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.push(lead);
    return lead;
  }

  updateLead(id: string, data: Partial<Lead>): Lead | null {
    const index = this.leads.findIndex(l => l.id === id || l._id === id);
    if (index === -1) return null;
    this.leads[index] = { ...this.leads[index], ...data, updatedAt: new Date().toISOString() };
    return this.leads[index];
  }

  // ── ICP ──────────────────────────────────────────────────
  getIcp(): IcpConfig {
    return { ...this.icp };
  }

  updateIcp(data: Partial<IcpConfig>): IcpConfig {
    this.icp = { ...this.icp, ...data, updatedAt: new Date().toISOString() };
    return { ...this.icp };
  }

  // ── Qualification Results ────────────────────────────────
  setQualificationResult(leadId: string, result: QualificationResult): void {
    this.qualificationResults.set(leadId, result);
  }

  getQualificationResult(leadId: string): QualificationResult | undefined {
    return this.qualificationResults.get(leadId);
  }

  getAllQualificationResults(): Map<string, QualificationResult> {
    return new Map(this.qualificationResults);
  }

  clearQualificationResults(): void {
    this.qualificationResults.clear();
  }
}

// Singleton
export const demoStore = new DemoStore();
