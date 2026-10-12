import { Request, Response, NextFunction } from 'express';
import { isDemoMode } from '../config/index.js';
import { demoStore } from '../services/demoStore.js';
import { LeadModel } from '../models/Lead.js';
import { IcpModel } from '../models/Icp.js';
import { qualifyLead, qualifyLeads } from '../services/qualificationEngine.js';
import { enrichWithAction } from '../services/nextBestAction.js';
import { detectDuplicates, getDuplicatesForLead } from '../services/duplicateDetection.js';
import { leadCreateSchema, leadUpdateSchema, queryParamsSchema } from '../validators/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Lead, IcpConfig, DEFAULT_ICP, QualificationResult, DashboardStats } from '../types.js';

// ── Helper: Get ICP ──────────────────────────────────────────
async function getCurrentIcp(): Promise<IcpConfig> {
  if (isDemoMode()) {
    return demoStore.getIcp();
  }
  const icp = await IcpModel.findOne().sort({ updatedAt: -1 }).lean();
  return icp ? (icp as unknown as IcpConfig) : { ...DEFAULT_ICP };
}

// ── GET /api/leads ───────────────────────────────────────────
export async function getLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const params = queryParamsSchema.parse(req.query);
    const { search, priority, industry, location, status, sortBy, sortOrder, page, limit } = params;

    let leads: Lead[];

    if (isDemoMode()) {
      leads = demoStore.getLeads();
    } else {
      leads = (await LeadModel.find().lean()) as unknown as Lead[];
      leads = leads.map(l => ({ ...l, id: (l as any)._id?.toString() || l.id }));
    }

    // Qualify all leads
    const icp = await getCurrentIcp();
    const qualResults = new Map<string, QualificationResult>();

    for (const lead of leads) {
      const id = lead.id || lead._id || '';
      let result = isDemoMode() ? demoStore.getQualificationResult(id) : undefined;
      if (!result) {
        result = qualifyLead(lead, icp);
        result = enrichWithAction(lead, result);
        if (isDemoMode()) demoStore.setQualificationResult(id, result);
      }
      qualResults.set(id, result);
    }

    // Detect duplicates
    const duplicateGroups = detectDuplicates(leads);

    // ── Filtering ──────────────────────────────────────────
    let filtered = leads;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.companyName?.toLowerCase().includes(s) ||
        l.contactName?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.domain?.toLowerCase().includes(s)
      );
    }

    if (priority) {
      filtered = filtered.filter(l => {
        const id = l.id || l._id || '';
        return qualResults.get(id)?.priority === priority;
      });
    }

    if (industry) {
      const ind = industry.toLowerCase();
      filtered = filtered.filter(l =>
        l.industry?.toLowerCase().includes(ind)
      );
    }

    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter(l =>
        l.location?.toLowerCase().includes(loc) ||
        l.country?.toLowerCase().includes(loc)
      );
    }

    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }

    // ── Sorting ────────────────────────────────────────────
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'score') {
      filtered.sort((a, b) => {
        const sa = qualResults.get(a.id || a._id || '')?.score ?? 0;
        const sb = qualResults.get(b.id || b._id || '')?.score ?? 0;
        return (sa - sb) * order;
      });
    } else if (sortBy === 'companyName') {
      filtered.sort((a, b) =>
        (a.companyName || '').localeCompare(b.companyName || '') * order
      );
    } else if (sortBy === 'employeeCount') {
      filtered.sort((a, b) =>
        ((a.employeeCount ?? 0) - (b.employeeCount ?? 0)) * order
      );
    } else {
      // Default: sort by score descending
      filtered.sort((a, b) => {
        const sa = qualResults.get(a.id || a._id || '')?.score ?? 0;
        const sb = qualResults.get(b.id || b._id || '')?.score ?? 0;
        return sb - sa;
      });
    }

    // ── Pagination ─────────────────────────────────────────
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    // ── Build response ─────────────────────────────────────
    const enrichedLeads = paginated.map(lead => {
      const id = lead.id || lead._id || '';
      const qual = qualResults.get(id);
      const dupes = getDuplicatesForLead(id, duplicateGroups);
      return {
        ...lead,
        qualification: qual || null,
        duplicates: dupes,
        hasDuplicates: dupes.length > 0,
      };
    });

    res.json({
      success: true,
      data: enrichedLeads,
      pagination: { page, limit, total, totalPages },
      demoMode: isDemoMode(),
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/leads/:id ───────────────────────────────────────
export async function getLeadById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    let lead: Lead | null | undefined;

    if (isDemoMode()) {
      lead = demoStore.getLeadById(id);
    } else {
      const doc = await LeadModel.findById(id).lean();
      if (doc) lead = { ...(doc as unknown as Lead), id: (doc as any)._id?.toString() };
    }

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    const icp = await getCurrentIcp();
    let result = isDemoMode() ? demoStore.getQualificationResult(id) : undefined;
    if (!result) {
      result = qualifyLead(lead, icp);
      result = enrichWithAction(lead, result);
      if (isDemoMode()) demoStore.setQualificationResult(id, result);
    }

    // Get all leads for duplicate detection
    const allLeads = isDemoMode() ? demoStore.getLeads() : ((await LeadModel.find().lean()) as unknown as Lead[]);
    const duplicateGroups = detectDuplicates(allLeads);
    const dupes = getDuplicatesForLead(id, duplicateGroups);

    res.json({
      success: true,
      data: {
        ...lead,
        qualification: result,
        duplicates: dupes,
        hasDuplicates: dupes.length > 0,
      },
      demoMode: isDemoMode(),
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/leads ──────────────────────────────────────────
export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = leadCreateSchema.parse(req.body);
    let lead: Lead;

    if (isDemoMode()) {
      lead = demoStore.createLead(data);
    } else {
      const doc = await LeadModel.create(data);
      lead = doc.toJSON() as unknown as Lead;
    }

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/leads/:id ─────────────────────────────────────
export async function updateLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = leadUpdateSchema.parse(req.body);
    let lead: Lead | null;

    if (isDemoMode()) {
      lead = demoStore.updateLead(id, data);
    } else {
      const doc = await LeadModel.findByIdAndUpdate(id, data, { new: true }).lean();
      lead = doc ? { ...(doc as unknown as Lead), id: (doc as any)._id?.toString() } : null;
    }

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/leads/qualify ──────────────────────────────────
export async function qualifyAllLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const icp = await getCurrentIcp();
    let leads: Lead[];

    if (isDemoMode()) {
      leads = demoStore.getLeads();
      demoStore.clearQualificationResults();
    } else {
      leads = (await LeadModel.find().lean()) as unknown as Lead[];
      leads = leads.map(l => ({ ...l, id: (l as any)._id?.toString() }));
    }

    const results = qualifyLeads(leads, icp).map((result, i) =>
      enrichWithAction(leads[i], result)
    );

    if (isDemoMode()) {
      results.forEach(r => demoStore.setQualificationResult(r.leadId, r));
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
      demoMode: isDemoMode(),
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/leads/:id/qualify ──────────────────────────────
export async function qualifySingleLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    let lead: Lead | null | undefined;

    if (isDemoMode()) {
      lead = demoStore.getLeadById(id);
    } else {
      const doc = await LeadModel.findById(id).lean();
      if (doc) lead = { ...(doc as unknown as Lead), id: (doc as any)._id?.toString() };
    }

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    const icp = await getCurrentIcp();
    let result = qualifyLead(lead, icp);
    result = enrichWithAction(lead, result);

    if (isDemoMode()) {
      demoStore.setQualificationResult(id, result);
    }

    res.json({ success: true, data: result, demoMode: isDemoMode() });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/dashboard/stats ─────────────────────────────────
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const icp = await getCurrentIcp();
    let leads: Lead[];

    if (isDemoMode()) {
      leads = demoStore.getLeads();
    } else {
      leads = (await LeadModel.find().lean()) as unknown as Lead[];
      leads = leads.map(l => ({ ...l, id: (l as any)._id?.toString() }));
    }

    // Qualify all
    const results: QualificationResult[] = [];
    for (const lead of leads) {
      const id = lead.id || lead._id || '';
      let result = isDemoMode() ? demoStore.getQualificationResult(id) : undefined;
      if (!result) {
        result = qualifyLead(lead, icp);
        result = enrichWithAction(lead, result);
        if (isDemoMode()) demoStore.setQualificationResult(id, result);
      }
      results.push(result);
    }

    const highPriority = results.filter(r => r.priority === 'HIGH').length;
    const moderatePriority = results.filter(r => r.priority === 'MODERATE').length;
    const lowPriority = results.filter(r => r.priority === 'LOW').length;
    const needsVerification = leads.filter(l => l.status === 'needs_verification').length;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0;

    // Industry breakdown
    const industryMap = new Map<string, number>();
    for (const lead of leads) {
      const ind = lead.industry || 'Unknown';
      industryMap.set(ind, (industryMap.get(ind) || 0) + 1);
    }
    const industryBreakdown = Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    const priorityBreakdown = [
      { priority: 'HIGH', count: highPriority },
      { priority: 'MODERATE', count: moderatePriority },
      { priority: 'LOW', count: lowPriority },
    ];

    const stats: DashboardStats = {
      totalLeads: leads.length,
      highPriority,
      moderatePriority,
      lowPriority,
      needsVerification,
      avgScore,
      industryBreakdown,
      priorityBreakdown,
      demoMode: isDemoMode(),
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
