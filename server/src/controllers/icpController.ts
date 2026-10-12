import { Request, Response, NextFunction } from 'express';
import { isDemoMode } from '../config/index.js';
import { demoStore } from '../services/demoStore.js';
import { IcpModel } from '../models/Icp.js';
import { icpSchema } from '../validators/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { IcpConfig, DEFAULT_ICP } from '../types.js';

// ── GET /api/icp ─────────────────────────────────────────────
export async function getIcp(req: Request, res: Response, next: NextFunction) {
  try {
    let icp: IcpConfig;

    if (isDemoMode()) {
      icp = demoStore.getIcp();
    } else {
      const doc = await IcpModel.findOne().sort({ updatedAt: -1 }).lean();
      icp = doc ? (doc as unknown as IcpConfig) : { ...DEFAULT_ICP };
    }

    res.json({ success: true, data: icp, demoMode: isDemoMode() });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/icp ─────────────────────────────────────────────
export async function updateIcp(req: Request, res: Response, next: NextFunction) {
  try {
    const data = icpSchema.parse(req.body);
    let icp: IcpConfig;

    if (isDemoMode()) {
      icp = demoStore.updateIcp(data);
      // Clear qualification results when ICP changes
      demoStore.clearQualificationResults();
    } else {
      const existing = await IcpModel.findOne().sort({ updatedAt: -1 });
      if (existing) {
        Object.assign(existing, data);
        await existing.save();
        icp = existing.toJSON() as unknown as IcpConfig;
      } else {
        const doc = await IcpModel.create(data);
        icp = doc.toJSON() as unknown as IcpConfig;
      }
    }

    res.json({
      success: true,
      data: icp,
      message: 'ICP updated. Lead qualifications will be recalculated.',
      demoMode: isDemoMode(),
    });
  } catch (err) {
    next(err);
  }
}
