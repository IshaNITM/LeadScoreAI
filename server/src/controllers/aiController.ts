import { Request, Response, NextFunction } from 'express';
import { isDemoMode } from '../config/index.js';
import { demoStore } from '../services/demoStore.js';
import { LeadModel } from '../models/Lead.js';
import { IcpModel } from '../models/Icp.js';
import { qualifyLead } from '../services/qualificationEngine.js';
import { enrichWithAction } from '../services/nextBestAction.js';
import { generateAiExplanation } from '../services/aiExplanation.js';
import { AppError } from '../middleware/errorHandler.js';
import { Lead, IcpConfig, DEFAULT_ICP } from '../types.js';

// ── POST /api/leads/:id/explanation ──────────────────────────
export async function getAiExplanation(req: Request, res: Response, next: NextFunction) {
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

    let icp: IcpConfig;
    if (isDemoMode()) {
      icp = demoStore.getIcp();
    } else {
      const doc = await IcpModel.findOne().sort({ updatedAt: -1 }).lean();
      icp = doc ? (doc as unknown as IcpConfig) : { ...DEFAULT_ICP };
    }

    let result = qualifyLead(lead, icp);
    result = enrichWithAction(lead, result);

    const { aiResponse, aiEnhanced } = await generateAiExplanation(lead, icp, result);

    if (aiEnhanced && aiResponse) {
      result.explanation = aiResponse.explanation;
      result.recommendation = aiResponse.nextAction;
      result.recommendationReason = aiResponse.justification;
      result.aiEnhanced = true;
    }

    if (isDemoMode()) {
      demoStore.setQualificationResult(id, result);
    }

    res.json({
      success: true,
      data: result,
      aiEnhanced,
      demoMode: isDemoMode(),
    });
  } catch (err) {
    next(err);
  }
}
