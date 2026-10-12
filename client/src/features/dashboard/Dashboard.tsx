import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, SortAsc, SortDesc, ChevronLeft, ChevronRight,
  Users, TrendingUp, AlertTriangle, ArrowDownCircle, X,
  RefreshCw, Briefcase, Settings, Plus,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import type { EnrichedLead, DashboardStats, Priority } from '../../types';
import { PriorityBadge, ScoreBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/ui';
import { Layout } from '../../components/Layout';
import { LeadCreateModal } from '../leads/LeadCreateModal';

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#059669',
  MODERATE: '#d97706',
  LOW: '#dc2626',
};

export function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [requalifying, setRequalifying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (industryFilter) params.industry = industryFilter;
      if (locationFilter) params.location = locationFilter;

      const [leadsRes, statsRes] = await Promise.all([
        api.getLeads(params),
        api.getStats(),
      ]);

      setLeads(leadsRes.data);
      setTotalPages(leadsRes.pagination.totalPages);
      setTotal(leadsRes.pagination.total);
      setStats(statsRes.data);
      setDemoMode(leadsRes.demoMode);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search, priorityFilter, industryFilter, locationFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequalify = async () => {
    try {
      setRequalifying(true);
      await api.qualifyAll();
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequalifying(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('');
    setIndustryFilter('');
    setLocationFilter('');
    setPage(1);
  };

  const hasFilters = search || priorityFilter || industryFilter || locationFilter;

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  // Get unique industries from stats
  const industries = stats?.industryBreakdown.map(i => i.industry) || [];

  return (
    <Layout demoMode={demoMode}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lead Qualification Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">
              Discover, qualify, and prioritize your best-fit leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Prospect
            </button>
            <Link
              to="/icp"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit ICP
            </Link>
            <button
              onClick={handleRequalify}
              disabled={requalifying}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${requalifying ? 'animate-spin' : ''}`} />
              {requalifying ? 'Qualifying...' : 'Requalify All'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Total Leads"
              value={stats.totalLeads}
              icon={Users}
              color="indigo"
            />
            <StatCard
              label="High Priority"
              value={stats.highPriority}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Moderate"
              value={stats.moderatePriority}
              icon={AlertTriangle}
              color="amber"
            />
            <StatCard
              label="Low Priority"
              value={stats.lowPriority}
              icon={ArrowDownCircle}
              color="red"
            />
            <StatCard
              label="Needs Verification"
              value={stats.needsVerification}
              icon={AlertTriangle}
              color="slate"
            />
          </div>
        )}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.priorityBreakdown.filter(p => p.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="priority"
                  >
                    {stats.priorityBreakdown.map(entry => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [value, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {stats.priorityBreakdown.map(entry => (
                  <div key={entry.priority} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[entry.priority] }} />
                    <span className="text-slate-600">{entry.priority} ({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Industry Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.industryBreakdown.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="industry" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company, contact, email, or domain..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value as Priority | ''); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={industryFilter}
              onChange={e => { setIndustryFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[160px]"
            />

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Lead Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? 'No leads match your filters' : 'No leads found'}
            description={hasFilters ? 'Try adjusting your filters or search criteria.' : 'Get started by adding your first lead.'}
            action={hasFilters ? (
              <button onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                Clear Filters
              </button>
            ) : undefined}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      <button onClick={() => toggleSort('companyName')} className="inline-flex items-center gap-1 hover:text-slate-900">
                        Company
                        {sortBy === 'companyName' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Industry</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">
                      <button onClick={() => toggleSort('employeeCount')} className="inline-flex items-center gap-1 hover:text-slate-900">
                        Size
                        {sortBy === 'employeeCount' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Location</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">
                      <button onClick={() => toggleSort('score')} className="inline-flex items-center gap-1 hover:text-slate-900">
                        Score
                        {sortBy === 'score' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden xl:table-cell">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => {
                    const id = lead.id || lead._id || '';
                    return (
                      <tr
                        key={id}
                        onClick={() => navigate(`/leads/${id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-slate-900 flex items-center gap-1.5">
                                {lead.companyName}
                                {lead.hasDuplicates && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                                    DUP
                                  </span>
                                )}
                              </div>
                              {lead.domain && (
                                <div className="text-xs text-slate-400">{lead.domain}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-900">{lead.contactName}</div>
                          <div className="text-xs text-slate-500">{lead.jobTitle || '—'}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-slate-600">{lead.industry || <span className="text-slate-400">—</span>}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-slate-600">
                            {lead.employeeCount ? lead.employeeCount.toLocaleString() : <span className="text-slate-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-slate-600">
                            {lead.location || <span className="text-slate-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lead.qualification ? (
                            <ScoreBadge score={lead.qualification.score} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lead.qualification ? (
                            <PriorityBadge priority={lead.qualification.priority} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell max-w-[200px]">
                          <span className="text-xs text-slate-600 line-clamp-2">
                            {lead.qualification?.recommendation || '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} leads
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ICP Indicator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current ICP</p>
                <p className="text-sm text-slate-700">
                  SaaS / Technology • 50–500 employees • United States
                </p>
              </div>
            </div>
            <Link
              to="/icp"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Configure →
            </Link>
          </div>
        </div>
      </div>

      <LeadCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeadCreated={fetchData}
      />
    </Layout>
  );
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
}) {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
    slate: 'bg-slate-100',
  };
  const iconColors: Record<string, string> = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    slate: 'text-slate-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
