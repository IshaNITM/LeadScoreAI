import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders, Save, RefreshCw, CheckCircle2, RotateCcw,
  Plus, X, Info, Target, Layers, ArrowLeft
} from 'lucide-react';
import { api } from '../../lib/api';
import type { IcpConfig } from '../../types';
import { DEFAULT_ICP } from '../../types';
import { Layout } from '../../components/Layout';
import { LoadingSpinner, ErrorState } from '../../components/ui';

export function IcpSettings() {
  const navigate = useNavigate();
  const [icp, setIcp] = useState<IcpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Local input helpers for adding tags
  const [newIndustry, setNewIndustry] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const fetchIcp = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getIcp();
      setIcp(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ICP configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIcp();
  }, [fetchIcp]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!icp) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      await api.updateIcp(icp);
      // Requalify all leads against new ICP rules
      await api.qualifyAll();

      setSuccessMsg('ICP configuration saved successfully and all leads recalculated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save ICP');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all criteria and scoring weights back to factory defaults?')) {
      setIcp(JSON.parse(JSON.stringify(DEFAULT_ICP)));
    }
  };

  const addTag = (
    field: 'targetIndustries' | 'targetRoles' | 'targetTechnologies' | 'targetLocations',
    value: string,
    setter: (s: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed || !icp) return;
    if (!icp[field].includes(trimmed)) {
      setIcp({
        ...icp,
        [field]: [...icp[field], trimmed],
      });
    }
    setter('');
  };

  const removeTag = (
    field: 'targetIndustries' | 'targetRoles' | 'targetTechnologies' | 'targetLocations',
    tagToRemove: string
  ) => {
    if (!icp) return;
    setIcp({
      ...icp,
      [field]: icp[field].filter(t => t !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" />
      </Layout>
    );
  }

  if (error && !icp) {
    return (
      <Layout>
        <ErrorState message={error} onRetry={fetchIcp} />
      </Layout>
    );
  }

  if (!icp) return null;

  const totalWeights =
    (icp.weights.industryFit || 0) +
    (icp.weights.companySizeFit || 0) +
    (icp.weights.locationFit || 0) +
    (icp.weights.roleMatch || 0) +
    (icp.weights.technologyFit || 0) +
    (icp.weights.dataCompleteness || 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-6 h-6 text-indigo-600" />
                Ideal Customer Profile (ICP) Engine
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure your qualification criteria, employee thresholds, and scoring weight distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving & Recalculating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Apply ICP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-sm text-emerald-800 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Firmographic & Persona Criteria */}
            <div className="lg:col-span-2 space-y-6">
              {/* Target Industries */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Target Industries
                  </h3>
                  <span className="text-xs text-slate-400">{icp.targetIndustries.length} defined</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Prospects operating in these market verticals receive full industry fit scoring points.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {icp.targetIndustries.map(ind => (
                    <span
                      key={ind}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100"
                    >
                      {ind}
                      <button
                        type="button"
                        onClick={() => removeTag('targetIndustries', ind)}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add industry (e.g. Fintech, Healthcare)..."
                    value={newIndustry}
                    onChange={e => setNewIndustry(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('targetIndustries', newIndustry, setNewIndustry);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('targetIndustries', newIndustry, setNewIndustry)}
                    className="px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Company Size Thresholds */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Company Size (Employee Headcount)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Defines the ideal headcount corridor for your target segment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Employees
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={icp.minEmployeeCount}
                      onChange={e =>
                        setIcp({ ...icp, minEmployeeCount: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Maximum Employees
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={icp.maxEmployeeCount}
                      onChange={e =>
                        setIcp({ ...icp, maxEmployeeCount: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Target Decision Maker Roles */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">Key Decision-Maker Personas & Titles</h3>
                  <span className="text-xs text-slate-400">{icp.targetRoles.length} titles</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Matches titles like Founder, VP of Engineering, or Head of Sales for persona fit.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {icp.targetRoles.map(role => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => removeTag('targetRoles', role)}
                        className="text-emerald-400 hover:text-emerald-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add target role (e.g. Chief Revenue Officer)..."
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('targetRoles', newRole, setNewRole);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('targetRoles', newRole, setNewRole)}
                    className="px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Target Technologies */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">Technographic Signal Preferences</h3>
                  <span className="text-xs text-slate-400">{icp.targetTechnologies.length} tools</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Modern technologies or stack tools that signal technical maturity and integration readiness.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {icp.targetTechnologies.map(tech => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-100"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTag('targetTechnologies', tech)}
                        className="text-purple-400 hover:text-purple-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tech stack tool (e.g. Snowflake, Next.js, Kubernetes)..."
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('targetTechnologies', newTech, setNewTech);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('targetTechnologies', newTech, setNewTech)}
                    className="px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Target Locations */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">Target Geographies & Tech Hubs</h3>
                  <span className="text-xs text-slate-400">{icp.targetLocations.length} locations</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Preferred locations, metropolitan hubs, or remote territories.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {icp.targetLocations.map(loc => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100"
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeTag('targetLocations', loc)}
                        className="text-amber-400 hover:text-amber-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add target location (e.g. London, Toronto, Chicago)..."
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('targetLocations', newLocation, setNewLocation);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('targetLocations', newLocation, setNewLocation)}
                    className="px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Weights & Distribution */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Weight Distribution
                  </h3>
                  <div
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      totalWeights === 100
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Total: {totalWeights} pts
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 mb-4">
                  Adjust points allocation across criteria to balance your qualification priority formula.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Industry Fit</span>
                      <span>{icp.weights.industryFit} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.industryFit}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, industryFit: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Company Size Fit</span>
                      <span>{icp.weights.companySizeFit} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.companySizeFit}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, companySizeFit: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Location / Region Fit</span>
                      <span>{icp.weights.locationFit} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.locationFit}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, locationFit: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Decision Maker Role</span>
                      <span>{icp.weights.roleMatch} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.roleMatch}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, roleMatch: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Technology Stack Fit</span>
                      <span>{icp.weights.technologyFit} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.technologyFit}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, technologyFit: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Data Completeness</span>
                      <span>{icp.weights.dataCompleteness} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={icp.weights.dataCompleteness}
                      onChange={e =>
                        setIcp({
                          ...icp,
                          weights: { ...icp.weights, dataCompleteness: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span>
                      Saving ICP will immediately trigger an asynchronous recalculation cycle across all registered prospect accounts.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-4 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? 'Applying...' : 'Apply & Recalculate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
