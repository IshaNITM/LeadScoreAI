import { Lead, QualificationResult, Priority } from '../types.js';

/**
 * Next-Best-Action Engine
 *
 * Deterministic recommendation logic based on:
 * - Qualification score & priority
 * - Matching/mismatching signals
 * - Contact-data availability
 * - Data completeness
 */

interface ActionRecommendation {
  recommendation: string;
  reason: string;
}

function hasContactInfo(lead: Lead): boolean {
  return !!(lead.email && lead.email.trim() !== '');
}

function hasPhoneInfo(lead: Lead): boolean {
  return !!(lead.phone && lead.phone.trim() !== '');
}

export function generateNextBestAction(
  lead: Lead,
  result: QualificationResult,
): ActionRecommendation {
  const { priority, missingInfo, negativeSignals, positiveSignals } = result;
  const hasEmail = hasContactInfo(lead);
  const hasPhone = hasPhoneInfo(lead);

  if (priority === 'HIGH') {
    return generateHighPriorityAction(lead, result, hasEmail, hasPhone);
  }

  if (priority === 'MODERATE') {
    return generateModeratePriorityAction(lead, result, hasEmail);
  }

  return generateLowPriorityAction(lead, result);
}

function generateHighPriorityAction(
  lead: Lead,
  result: QualificationResult,
  hasEmail: boolean,
  hasPhone: boolean,
): ActionRecommendation {
  const { positiveSignals, missingInfo } = result;
  const topSignal = positiveSignals[0] || 'Strong ICP alignment';

  if (!hasEmail) {
    return {
      recommendation: 'Find contact email before outreach',
      reason: `This lead scores ${result.score}/100 with strong ICP fit (${topSignal}), but email is missing. Locate a valid contact email to enable direct outreach.`,
    };
  }

  if (missingInfo.length > 2) {
    return {
      recommendation: 'Enrich lead data, then prioritize for outreach',
      reason: `Strong match (${result.score}/100) but ${missingInfo.length} data gaps remain. Enrich the profile to confirm fit, then proceed with personalized outreach.`,
    };
  }

  return {
    recommendation: 'Prioritize for personalized outreach',
    reason: `${lead.companyName} is a strong ICP match (${result.score}/100). ${topSignal} Prepare a personalized outreach sequence highlighting relevant value propositions.`,
  };
}

function generateModeratePriorityAction(
  lead: Lead,
  result: QualificationResult,
  hasEmail: boolean,
): ActionRecommendation {
  const { missingInfo, negativeSignals } = result;

  if (missingInfo.length > 0) {
    const topMissing = missingInfo[0];
    return {
      recommendation: 'Verify missing information to confirm fit',
      reason: `${lead.companyName} shows moderate alignment (${result.score}/100) but key data is missing: ${topMissing} Research and fill gaps to determine if this lead is worth pursuing.`,
    };
  }

  if (negativeSignals.length > 0) {
    const topNegative = negativeSignals[0];
    return {
      recommendation: 'Review ICP fit before investing outreach effort',
      reason: `Moderate score (${result.score}/100) with known mismatches: ${topNegative} Evaluate whether these gaps are dealbreakers for your ICP.`,
    };
  }

  return {
    recommendation: 'Add to nurture sequence',
    reason: `${lead.companyName} has moderate alignment (${result.score}/100). Add to a nurture campaign and revisit when more data becomes available or ICP criteria change.`,
  };
}

function generateLowPriorityAction(
  lead: Lead,
  result: QualificationResult,
): ActionRecommendation {
  const { negativeSignals, missingInfo } = result;

  if (negativeSignals.length > 0) {
    const topMismatch = negativeSignals[0];
    return {
      recommendation: 'Deprioritize — review ICP relevance',
      reason: `${lead.companyName} scored ${result.score}/100 with significant mismatches: ${topMismatch} This lead does not align with the current ICP. Deprioritize unless criteria change.`,
    };
  }

  if (missingInfo.length >= 3) {
    return {
      recommendation: 'Deprioritize — insufficient data',
      reason: `${lead.companyName} scored ${result.score}/100 with ${missingInfo.length} missing data points. Insufficient information to justify outreach investment.`,
    };
  }

  return {
    recommendation: 'Deprioritize — low ICP alignment',
    reason: `${lead.companyName} scored ${result.score}/100 and does not strongly align with ICP criteria. Focus on higher-priority leads.`,
  };
}

/**
 * Apply next-best-action to a qualification result, mutating it in place.
 */
export function enrichWithAction(lead: Lead, result: QualificationResult): QualificationResult {
  const action = generateNextBestAction(lead, result);
  result.recommendation = action.recommendation;
  result.recommendationReason = action.reason;
  return result;
}
