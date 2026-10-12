import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Sparkles, AlertTriangle, CheckCircle2,
  XCircle, HelpCircle, Copy, Check, Building2, User, Mail,
  Phone, Briefcase, MapPin, Cpu, Edit3, ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import type { EnrichedLead, QualificationResult } from '../../types';
import { PriorityBadge, ScoreBadge, LoadingSpinner, ErrorState } from '../../components/ui';
import { Layout } from '../../components/Layout';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<EnrichedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requalifying, setRequalifying] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    jobTitle: '',
    industry: '',
    employeeCount: '',
    location: '',
    domain: '',
    technologies: '',
    notes: '',
    status: 'new' as 'new' | 'reviewed' | 'contacted' | 'needs_verification',
  });

  const fetchLead = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.getLead(id);
      setLead(res.data);
      setEditForm({
        companyName: res.data.companyName || '',
        contactName: res.data.contactName || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        jobTitle: res.data.jobTitle || '',
        industry: res.data.industry || '',
        employeeCount: res.data.employeeCount ? res.data.employeeCount.toString() : '',
        location: res.data.location || '',
        domain: res.data.domain || '',
        technologies: (res.data.technologies || []).join(', '),
        notes: res.data.notes || '',
        status: res.data.status || 'new',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleRequalify = async () => {
    if (!id) return;
    try {
      setRequalifying(true);
      const res = await api.qualifyLead(id);
      if (lead) {
        setLead({ ...lead, qualification: res.data });
      }
    } catch (err: any) {
      setError(err.message || 'Qualification failed');
    } finally {
      setRequalifying(false);
    }
  };

  const handleFetchAiExplanation = async () => {
    if (!id) return;
    try {
      setAiLoading(true);
      const res = await api.getExplanation(id);
      if (lead) {
        setLead({
          ...lead,
          qualification: {
            ...(lead.qualification || res.data),
            explanation: res.data.explanation,
            aiEnhanced: res.aiEnhanced,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSavingEdit(true);
      const techList = editForm.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        companyName: editForm.companyName.trim(),
        contactName: editForm.contactName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        jobTitle: editForm.jobTitle.trim(),
        industry: editForm.industry.trim(),
        employeeCount: editForm.employeeCount ? parseInt(editForm.employeeCount, 10) : undefined,
        location: editForm.location.trim() || undefined,
        domain: editForm.domain.trim() || undefined,
        technologies: techList,
        notes: editForm.notes.trim() || undefined,
        status: editForm.status,
      };

      await api.updateLead(id, payload);
      setIsEditing(false);
      // Re-qualify with new data
      await handleRequalify();
      await fetchLead();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" />
      </Layout>
    );
  }

  if (error || !lead) {
    return (
      <Layout>
        <div className="py-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <ErrorState message={error || 'Lead not found'} onRetry={fetchLead} />
        </div>
      </Layout>
    );
  }

  const q = lead.qualification as QualificationResult | null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900">{lead.companyName}</h1>
                {q && <PriorityBadge priority={q.priority} />}
                <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded-md bg-slate-100 text-slate-700">
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {lead.contactName} • {lead.jobTitle || 'Executive'} {lead.domain && `• ${lead.domain}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Lead'}
            </button>
            <button
              onClick={handleRequalify}
              disabled={requalifying}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${requalifying ? 'animate-spin' : ''}`} />
              {requalifying ? 'Scoring...' : 'Recalculate Fit'}
            </button>
          </div>
        </div>

        {/* Duplicate Warning Banner */}
        {lead.hasDuplicates && lead.duplicates && lead.duplicates.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Potential Duplicate Accounts Detected ({lead.duplicates.length})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Our duplicate detection engine discovered overlapping records matching this lead.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {lead.duplicates.map((dup, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs text-amber-900"
                  >
                    <span className="font-semibold">{dup.type.replace('_', ' ')}:</span>
                    <span>{dup.matchValue}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600 ml-1">
                      [{dup.confidence}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Fit Breakdown & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Qualification Score Card */}
            {q && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Ideal Customer Profile Fit Score</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluated against the active ICP scoring model on {new Date(q.qualifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-extrabold text-slate-900 leading-none">{q.score}</div>
                      <div className="text-[11px] text-slate-400 font-medium">out of 100</div>
                    </div>
                    <ScoreBadge score={q.score} />
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        q.score >= 75 ? 'bg-emerald-500' : q.score >= 45 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, q.score))}%` }}
                    />
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Scoring Factor Breakdown
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {q.factors.map(f => (
                      <div key={f.factor} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {f.matchStatus === 'MATCH' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {f.matchStatus === 'MISMATCH' && (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            {f.matchStatus === 'UNKNOWN' && (
                              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="text-sm font-semibold text-slate-800">{f.factor}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                f.matchStatus === 'MATCH'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : f.matchStatus === 'MISMATCH'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {f.matchStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 pl-6">{f.explanation}</p>
                          {f.evidence && f.evidence.length > 0 && (
                            <div className="pl-6 flex flex-wrap gap-1 mt-1">
                              {f.evidence.map((ev, i) => (
                                <span key={i} className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="sm:text-right shrink-0 pl-6 sm:pl-0">
                          <span className="text-sm font-bold text-slate-900">
                            {f.earnedPoints}
                          </span>
                          <span className="text-xs text-slate-400"> / {f.maxPoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signals Overview */}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Positive Fit Signals ({q.positiveSignals.length})
                    </div>
                    {q.positiveSignals.length === 0 ? (
                      <p className="text-xs text-emerald-600/70">No strong signals recorded</p>
                    ) : (
                      <ul className="text-xs text-emerald-900 space-y-1">
                        {q.positiveSignals.map((sig, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 mb-2">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      Risk / Mismatch Flags ({q.negativeSignals.length})
                    </div>
                    {q.negativeSignals.length === 0 ? (
                      <p className="text-xs text-red-600/70">No negative flags detected</p>
                    ) : (
                      <ul className="text-xs text-red-900 space-y-1">
                        {q.negativeSignals.map((sig, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      Missing Attributes ({q.missingInfo.length})
                    </div>
                    {q.missingInfo.length === 0 ? (
                      <p className="text-xs text-amber-600/70">Full profile completed</p>
                    ) : (
                      <ul className="text-xs text-amber-900 space-y-1">
                        {q.missingInfo.map((info, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Next-Best-Action Recommendation */}
            {q && (
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-indigo-700/60 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      AI Next-Best-Action Engine
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{q.recommendation}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-xs">
                      Priority: {q.priority}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">
                      Strategic Rationale
                    </h5>
                    <p className="text-sm text-indigo-100 mt-1 leading-relaxed">
                      {q.recommendationReason}
                    </p>
                  </div>

                  {/* Generated Outreach Angle Pitch */}
                  <div className="mt-4 bg-indigo-950/70 border border-indigo-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        Suggested Outreach Hook / Talking Point
                      </span>
                      <button
                        onClick={() =>
                          handleCopyPitch(
                            `Hi ${lead.contactName.split(' ')[0]},\n\nI noticed ${lead.companyName}'s work in ${lead.industry} and your use of ${(lead.technologies || []).slice(0, 3).join(', ')}. ${q.recommendationReason}\n\nWould you be open to a brief conversation this week?`
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white px-2 py-1 rounded bg-indigo-800/80 hover:bg-indigo-700 transition-colors"
                      >
                        {copiedPitch ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Angle
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-indigo-200/90 font-mono italic leading-relaxed">
                      "Hi {lead.contactName.split(' ')[0]}, I noticed {lead.companyName}'s work in {lead.industry} and your use of {(lead.technologies || []).slice(0, 3).join(', ')}. {q.recommendationReason} Would you be open to a brief conversation this week?"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Explanation / Analysis */}
            {q && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">Lead Synthesis & Narrative</h3>
                    {q.aiEnhanced ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        AI Model Enhanced
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Deterministic Engine
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleFetchAiExplanation}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? 'Synthesizing...' : 'Enrich with AI'}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Lead Profile & Inline Editing */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Prospect Profile</h3>
                <span className="text-xs text-slate-400">ID: {(lead.id || lead._id || '').slice(-6)}</span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.companyName}
                      onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.contactName}
                      onChange={e => setEditForm({ ...editForm, contactName: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={editForm.jobTitle}
                      onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                      <input
                        type="text"
                        value={editForm.industry}
                        onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Employees</label>
                      <input
                        type="number"
                        value={editForm.employeeCount}
                        onChange={e => setEditForm({ ...editForm, employeeCount: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Domain</label>
                    <input
                      type="text"
                      value={editForm.domain}
                      onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Stack (comma-sep)</label>
                    <input
                      type="text"
                      value={editForm.technologies}
                      onChange={e => setEditForm({ ...editForm, technologies: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="needs_verification">Needs Verification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                    <textarea
                      rows={2}
                      value={editForm.notes}
                      onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 shadow-xs"
                    >
                      {savingEdit ? 'Saving...' : 'Save & Requalify'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Company & Domain</div>
                        <div className="text-sm font-semibold text-slate-900">{lead.companyName}</div>
                        {lead.domain && (
                          <a
                            href={`https://${lead.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"
                          >
                            {lead.domain} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Primary Contact</div>
                        <div className="text-sm font-semibold text-slate-900">{lead.contactName}</div>
                        <div className="text-xs text-slate-600">{lead.jobTitle || 'Executive'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Email Address</div>
                        <a href={`mailto:${lead.email}`} className="text-sm text-slate-900 hover:text-indigo-600 font-medium">
                          {lead.email}
                        </a>
                      </div>
                    </div>

                    {lead.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Phone</div>
                          <div className="text-sm text-slate-900 font-medium">{lead.phone}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Industry & Headcount</div>
                        <div className="text-sm text-slate-900 font-medium">{lead.industry || '—'}</div>
                        <div className="text-xs text-slate-500">
                          {lead.employeeCount ? `${lead.employeeCount.toLocaleString()} employees` : 'Headcount unspecified'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Headquarters / Location</div>
                        <div className="text-sm text-slate-900 font-medium">{lead.location || 'Location unspecified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      Identified Technologies ({lead.technologies?.length || 0})
                    </div>
                    {lead.technologies && lead.technologies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {lead.technologies.map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No technologies indexed</span>
                    )}
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 mb-1">Notes & Context</div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {lead.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
