import type {
  ApiResponse,
  PaginatedResponse,
  EnrichedLead,
  DashboardStats,
  IcpConfig,
  QualificationResult,
  Lead,
} from '../types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Health ────────────────────────────────────────────────────
export const api = {
  health: () => request<ApiResponse<{ status: string }>>('/health'),

  // ── Dashboard ──────────────────────────────────────────────
  getStats: () => request<ApiResponse<DashboardStats>>('/dashboard/stats'),

  // ── Leads ──────────────────────────────────────────────────
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<EnrichedLead>>(`/leads${qs}`);
  },

  getLead: (id: string) =>
    request<ApiResponse<EnrichedLead>>(`/leads/${id}`),

  createLead: (data: Partial<Lead>) =>
    request<ApiResponse<Lead>>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLead: (id: string, data: Partial<Lead>) =>
    request<ApiResponse<Lead>>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ── Qualification ──────────────────────────────────────────
  qualifyAll: () =>
    request<ApiResponse<QualificationResult[]>>('/leads/qualify', {
      method: 'POST',
    }),

  qualifyLead: (id: string) =>
    request<ApiResponse<QualificationResult>>(`/leads/${id}/qualify`, {
      method: 'POST',
    }),

  // ── AI Explanation ─────────────────────────────────────────
  getExplanation: (id: string) =>
    request<ApiResponse<QualificationResult> & { aiEnhanced: boolean }>(
      `/leads/${id}/explanation`,
      { method: 'POST' },
    ),

  // ── ICP ────────────────────────────────────────────────────
  getIcp: () => request<ApiResponse<IcpConfig>>('/icp'),

  updateIcp: (data: IcpConfig) =>
    request<ApiResponse<IcpConfig>>('/icp', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
