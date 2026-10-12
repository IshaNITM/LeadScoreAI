import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  qualifyAllLeads,
  qualifySingleLead,
  getDashboardStats,
} from '../controllers/leadController.js';
import { getIcp, updateIcp } from '../controllers/icpController.js';
import { getAiExplanation } from '../controllers/aiController.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Leads — batch qualify must come before :id routes
router.post('/leads/qualify', qualifyAllLeads);

// Leads CRUD
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.get('/leads/:id', getLeadById);
router.patch('/leads/:id', updateLead);

// Single lead qualification
router.post('/leads/:id/qualify', qualifySingleLead);

// AI explanation
router.post('/leads/:id/explanation', getAiExplanation);

// ICP
router.get('/icp', getIcp);
router.put('/icp', updateIcp);

export default router;
