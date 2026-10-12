import { config, isAiConfigured } from '../config/index.js';
import { Lead, IcpConfig, QualificationResult } from '../types.js';

interface AiExplanationResponse {
  explanation: string;
  topReason: string;
  nextAction: string;
  justification: string;
}

/**
 * Generate AI-enhanced explanation for a lead qualification.
 * Falls back to deterministic explanation if AI is unavailable.
 */
export async function generateAiExplanation(
  lead: Lead,
  icp: IcpConfig,
  result: QualificationResult,
): Promise<{ aiResponse: AiExplanationResponse | null; aiEnhanced: boolean }> {
  if (!isAiConfigured()) {
    return { aiResponse: null, aiEnhanced: false };
  }

  try {
    const prompt = buildPrompt(lead, icp, result);
    const response = await callAiApi(prompt);
    return { aiResponse: response, aiEnhanced: true };
  } catch (error) {
    console.error('AI explanation failed, using deterministic fallback:', error);
    return { aiResponse: null, aiEnhanced: false };
  }
}

function buildPrompt(lead: Lead, icp: IcpConfig, result: QualificationResult): string {
  return `You are a B2B sales qualification assistant. Analyze this lead qualification and provide a concise, actionable response.

Lead Information:
- Company: ${lead.companyName}
- Contact: ${lead.contactName}, ${lead.jobTitle || 'Unknown role'}
- Industry: ${lead.industry || 'Unknown'}
- Employee Count: ${lead.employeeCount || 'Unknown'}
- Location: ${lead.location || 'Unknown'}
- Technologies: ${lead.technologies?.join(', ') || 'Unknown'}

ICP Criteria:
- Target Industries: ${icp.targetIndustries.join(', ')}
- Employee Range: ${icp.minEmployeeCount}-${icp.maxEmployeeCount}
- Target Locations: ${icp.targetLocations.join(', ')}
- Target Roles: ${icp.targetRoles.join(', ')}

Qualification Result:
- Score: ${result.score}/100
- Priority: ${result.priority}
- Positive Signals: ${result.positiveSignals.join('; ') || 'None'}
- Negative Signals: ${result.negativeSignals.join('; ') || 'None'}
- Missing Information: ${result.missingInfo.join('; ') || 'None'}

Respond with a JSON object containing exactly these fields:
{
  "explanation": "A 2-3 sentence qualification summary",
  "topReason": "The single most important reason to pursue or skip this lead",
  "nextAction": "A specific recommended next action",
  "justification": "A 1-sentence justification for the recommendation based on available evidence"
}

Important:
- Base your response only on the provided data. Do not fabricate information.
- Do not override or contradict the deterministic score.
- Be specific and actionable, not generic.`;
}

async function callAiApi(prompt: string): Promise<AiExplanationResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.aiTimeout);

  try {
    const url = `${config.aiApiUrl}?key=${config.aiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI API responded with ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(text);

    // Validate structure
    if (!parsed.explanation || !parsed.topReason || !parsed.nextAction || !parsed.justification) {
      throw new Error('AI response missing required fields');
    }

    return parsed as AiExplanationResponse;
  } finally {
    clearTimeout(timeout);
  }
}
