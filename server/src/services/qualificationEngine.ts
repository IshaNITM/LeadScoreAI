import {
  Lead,
  IcpConfig,
  QualificationFactor,
  QualificationResult,
  MatchStatus,
  Priority,
} from '../types.js';

// ── Priority Thresholds (single source of truth) ─────────────
export const PRIORITY_THRESHOLDS = {
  HIGH: 75,
  MODERATE: 45,
} as const;

export function getPriority(score: number): Priority {
  if (score >= PRIORITY_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= PRIORITY_THRESHOLDS.MODERATE) return 'MODERATE';
  return 'LOW';
}

// ── Normalization Helpers ────────────────────────────────────
function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeRole(title: string): string[] {
  const t = normalize(title);
  const aliases: Record<string, string[]> = {
    'ceo': ['ceo', 'chief executive officer'],
    'cto': ['cto', 'chief technology officer'],
    'cfo': ['cfo', 'chief financial officer'],
    'coo': ['coo', 'chief operating officer'],
    'vp engineering': ['vp engineering', 'vp of engineering', 'vice president of engineering', 'vice president engineering'],
    'vp sales': ['vp sales', 'vp of sales', 'vice president of sales'],
    'founder': ['founder', 'co-founder', 'cofounder'],
    'director': ['director of engineering', 'engineering director', 'director of technology'],
    'head': ['head of engineering', 'head of technology', 'head of product'],
  };

  const expanded: string[] = [t];
  for (const [, variants] of Object.entries(aliases)) {
    if (variants.some(v => t.includes(v))) {
      expanded.push(...variants);
    }
  }
  return [...new Set(expanded)];
}

// ── Completeness Fields ──────────────────────────────────────
const COMPLETENESS_FIELDS: (keyof Lead)[] = [
  'companyName', 'contactName', 'email', 'jobTitle',
  'industry', 'employeeCount', 'location', 'website',
  'domain', 'technologies',
];

// ── Factor Scoring Functions ─────────────────────────────────

function scoreIndustryFit(lead: Lead, icp: IcpConfig, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Industry Fit',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  if (!lead.industry || lead.industry.trim() === '') {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'Industry information is not available.';
    factor.evidence = ['Industry field is missing or empty'];
    return factor;
  }

  const leadIndustry = normalize(lead.industry);
  const targetIndustries = icp.targetIndustries.map(normalize);
  const matched = targetIndustries.find(t => leadIndustry.includes(t) || t.includes(leadIndustry));

  if (matched) {
    factor.earnedPoints = maxPoints;
    factor.matchStatus = 'MATCH';
    factor.explanation = `"${lead.industry}" matches target industry.`;
    factor.evidence = [`Lead industry: ${lead.industry}`, `Matched target: ${matched}`];
  } else {
    factor.earnedPoints = 0;
    factor.matchStatus = 'MISMATCH';
    factor.explanation = `"${lead.industry}" does not match any target industry.`;
    factor.evidence = [`Lead industry: ${lead.industry}`, `Target industries: ${icp.targetIndustries.join(', ')}`];
  }

  return factor;
}

function scoreCompanySizeFit(lead: Lead, icp: IcpConfig, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Company Size Fit',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  if (lead.employeeCount === undefined || lead.employeeCount === null) {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'Employee count is not available.';
    factor.evidence = ['Employee count field is missing'];
    return factor;
  }

  if (lead.employeeCount >= icp.minEmployeeCount && lead.employeeCount <= icp.maxEmployeeCount) {
    factor.earnedPoints = maxPoints;
    factor.matchStatus = 'MATCH';
    factor.explanation = `${lead.employeeCount} employees falls within the target range (${icp.minEmployeeCount}–${icp.maxEmployeeCount}).`;
    factor.evidence = [`Employee count: ${lead.employeeCount}`, `Target range: ${icp.minEmployeeCount}–${icp.maxEmployeeCount}`];
  } else {
    factor.earnedPoints = 0;
    factor.matchStatus = 'MISMATCH';
    factor.explanation = `${lead.employeeCount} employees is outside the target range (${icp.minEmployeeCount}–${icp.maxEmployeeCount}).`;
    factor.evidence = [`Employee count: ${lead.employeeCount}`, `Target range: ${icp.minEmployeeCount}–${icp.maxEmployeeCount}`];
  }

  return factor;
}

function scoreLocationFit(lead: Lead, icp: IcpConfig, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Location Fit',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  const loc = lead.location?.trim() || '';
  const country = lead.country?.trim() || '';

  if (!loc && !country) {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'Location information is not available.';
    factor.evidence = ['Location and country fields are missing'];
    return factor;
  }

  const normalizedLoc = normalize(loc);
  const normalizedCountry = normalize(country);

  // Check city-level match
  const targetLocs = icp.targetLocations.map(normalize);
  const cityMatch = targetLocs.find(t => normalizedLoc.includes(t) || t.includes(normalizedLoc));

  // Check country-level match
  const targetCountries = icp.targetCountries.map(normalize);
  const countryMatch = targetCountries.find(t =>
    normalizedCountry.includes(t) || t.includes(normalizedCountry) ||
    normalizedLoc.includes(t) || t.includes(normalizedLoc)
  );

  if (cityMatch) {
    factor.earnedPoints = maxPoints;
    factor.matchStatus = 'MATCH';
    factor.explanation = `Location "${loc}" matches target location.`;
    factor.evidence = [`Lead location: ${loc}`, `Matched: ${cityMatch}`];
  } else if (countryMatch) {
    factor.earnedPoints = Math.round(maxPoints * 0.7);
    factor.matchStatus = 'MATCH';
    factor.explanation = `Country match found but not an exact city match. Partial credit awarded.`;
    factor.evidence = [`Lead location: ${loc || country}`, `Country matched: ${countryMatch}`];
  } else {
    factor.earnedPoints = 0;
    factor.matchStatus = 'MISMATCH';
    factor.explanation = `"${loc || country}" does not match target locations or countries.`;
    factor.evidence = [`Lead location: ${loc || country}`, `Target locations: ${icp.targetLocations.join(', ')}`];
  }

  return factor;
}

function scoreRoleMatch(lead: Lead, icp: IcpConfig, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Decision-Maker Role Fit',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  if (!lead.jobTitle || lead.jobTitle.trim() === '') {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'Job title is not available.';
    factor.evidence = ['Job title field is missing or empty'];
    return factor;
  }

  const leadRoles = normalizeRole(lead.jobTitle);
  const targetRoles = icp.targetRoles.flatMap(r => normalizeRole(r));
  const matched = leadRoles.find(r => targetRoles.includes(r));

  if (matched) {
    factor.earnedPoints = maxPoints;
    factor.matchStatus = 'MATCH';
    factor.explanation = `"${lead.jobTitle}" matches target decision-maker role.`;
    factor.evidence = [`Lead title: ${lead.jobTitle}`, `Matched role: ${matched}`];
  } else {
    // Check for partial seniority keywords
    const seniorKeywords = ['vp', 'vice president', 'director', 'head', 'chief', 'president', 'senior', 'lead', 'manager'];
    const hasSeniority = seniorKeywords.some(kw => normalize(lead.jobTitle).includes(kw));

    if (hasSeniority) {
      factor.earnedPoints = Math.round(maxPoints * 0.5);
      factor.matchStatus = 'MATCH';
      factor.explanation = `"${lead.jobTitle}" shows seniority but is not an exact target role match. Partial credit.`;
      factor.evidence = [`Lead title: ${lead.jobTitle}`, `Has seniority indicators`];
    } else {
      factor.earnedPoints = 0;
      factor.matchStatus = 'MISMATCH';
      factor.explanation = `"${lead.jobTitle}" does not match any target decision-maker role.`;
      factor.evidence = [`Lead title: ${lead.jobTitle}`, `Target roles: ${icp.targetRoles.join(', ')}`];
    }
  }

  return factor;
}

function scoreTechnologyFit(lead: Lead, icp: IcpConfig, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Technology/Business Fit',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  if (!lead.technologies || lead.technologies.length === 0) {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'Technology information is not available.';
    factor.evidence = ['Technologies field is missing or empty'];
    return factor;
  }

  const leadTechs = lead.technologies.map(normalize);
  const targetTechs = icp.targetTechnologies.map(normalize);
  const matchedTechs = leadTechs.filter(t => targetTechs.some(tt => t.includes(tt) || tt.includes(t)));

  if (targetTechs.length === 0) {
    factor.matchStatus = 'UNKNOWN';
    factor.explanation = 'No target technologies configured.';
    factor.evidence = ['ICP has no target technologies'];
    return factor;
  }

  const matchRatio = matchedTechs.length / targetTechs.length;

  if (matchRatio >= 0.3) {
    factor.earnedPoints = Math.round(maxPoints * Math.min(matchRatio * 1.5, 1));
    factor.matchStatus = 'MATCH';
    factor.explanation = `${matchedTechs.length} of ${targetTechs.length} target technologies matched.`;
    factor.evidence = [`Matched: ${matchedTechs.join(', ')}`, `Lead stack: ${lead.technologies.join(', ')}`];
  } else if (matchedTechs.length > 0) {
    factor.earnedPoints = Math.round(maxPoints * 0.3);
    factor.matchStatus = 'MATCH';
    factor.explanation = `Weak technology overlap: ${matchedTechs.length} matches found.`;
    factor.evidence = [`Matched: ${matchedTechs.join(', ')}`, `Lead stack: ${lead.technologies.join(', ')}`];
  } else {
    factor.earnedPoints = 0;
    factor.matchStatus = 'MISMATCH';
    factor.explanation = 'No technology overlap with target profile.';
    factor.evidence = [`Lead stack: ${lead.technologies.join(', ')}`, `Target: ${icp.targetTechnologies.join(', ')}`];
  }

  return factor;
}

function scoreDataCompleteness(lead: Lead, maxPoints: number): QualificationFactor {
  const factor: QualificationFactor = {
    factor: 'Data Completeness',
    maxPoints,
    earnedPoints: 0,
    matchStatus: 'UNKNOWN',
    explanation: '',
    evidence: [],
  };

  let filled = 0;
  const missing: string[] = [];

  for (const field of COMPLETENESS_FIELDS) {
    const value = lead[field];
    if (value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
      missing.push(field);
    } else {
      filled++;
    }
  }

  const ratio = filled / COMPLETENESS_FIELDS.length;
  factor.earnedPoints = Math.round(maxPoints * ratio);

  if (ratio >= 0.8) {
    factor.matchStatus = 'MATCH';
    factor.explanation = `${filled}/${COMPLETENESS_FIELDS.length} key fields populated (${Math.round(ratio * 100)}%).`;
  } else if (ratio >= 0.5) {
    factor.matchStatus = 'MATCH';
    factor.explanation = `${filled}/${COMPLETENESS_FIELDS.length} key fields populated (${Math.round(ratio * 100)}%). Some information gaps remain.`;
  } else {
    factor.matchStatus = 'MISMATCH';
    factor.explanation = `Only ${filled}/${COMPLETENESS_FIELDS.length} key fields populated (${Math.round(ratio * 100)}%). Significant data gaps.`;
  }

  factor.evidence = missing.length > 0
    ? [`Missing: ${missing.join(', ')}`, `Completeness: ${Math.round(ratio * 100)}%`]
    : [`All ${COMPLETENESS_FIELDS.length} key fields populated`];

  return factor;
}

// ── Main Qualification Function ──────────────────────────────

export function qualifyLead(lead: Lead, icp: IcpConfig): QualificationResult {
  const leadId = lead._id || lead.id || '';
  const weights = icp.weights;

  const factors: QualificationFactor[] = [
    scoreIndustryFit(lead, icp, weights.industryFit),
    scoreCompanySizeFit(lead, icp, weights.companySizeFit),
    scoreLocationFit(lead, icp, weights.locationFit),
    scoreRoleMatch(lead, icp, weights.roleMatch),
    scoreTechnologyFit(lead, icp, weights.technologyFit),
    scoreDataCompleteness(lead, weights.dataCompleteness),
  ];

  const rawScore = factors.reduce((sum, f) => sum + f.earnedPoints, 0);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const priority = getPriority(score);

  const positiveSignals = factors
    .filter(f => f.matchStatus === 'MATCH')
    .map(f => f.explanation);

  const negativeSignals = factors
    .filter(f => f.matchStatus === 'MISMATCH')
    .map(f => f.explanation);

  const missingInfo = factors
    .filter(f => f.matchStatus === 'UNKNOWN')
    .map(f => f.explanation);

  const explanation = buildExplanation(lead, score, priority, positiveSignals, negativeSignals, missingInfo);

  return {
    leadId,
    score,
    priority,
    factors,
    positiveSignals,
    negativeSignals,
    missingInfo,
    explanation,
    recommendation: '',
    recommendationReason: '',
    aiEnhanced: false,
    qualifiedAt: new Date().toISOString(),
  };
}

function buildExplanation(
  lead: Lead,
  score: number,
  priority: Priority,
  positiveSignals: string[],
  negativeSignals: string[],
  missingInfo: string[],
): string {
  const company = lead.companyName || 'This company';
  const parts: string[] = [];

  parts.push(`${company} scored ${score}/100 (${priority} priority).`);

  if (positiveSignals.length > 0) {
    parts.push(`Strengths: ${positiveSignals[0]}`);
  }
  if (negativeSignals.length > 0) {
    parts.push(`Gaps: ${negativeSignals[0]}`);
  }
  if (missingInfo.length > 0) {
    parts.push(`Missing: ${missingInfo.length} data point(s) could not be evaluated.`);
  }

  return parts.join(' ');
}

// ── Batch Qualification ──────────────────────────────────────

export function qualifyLeads(leads: Lead[], icp: IcpConfig): QualificationResult[] {
  return leads.map(lead => qualifyLead(lead, icp));
}
