import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronCard,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowDownCircle,
  X,
  RefreshCw,
  Briefcase,
  Settings,
  Plus,
  MapPin,
  Building2,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../lib/api';
import type { EnrichedLead, DashboardStats, Priority } from '../../types';
import {
  PriorityBadge,
  ScoreBadge,
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from '../../components/ui';
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

  // View mode: 'auto' adapts automatically (cards on mobile, table on desktop), or explicit 'cards' / 'table'
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

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

      setLeads(leadsRes.data || []);
      setTotalPages(leadsRes.pagination?.totalPages || 1);
      setTotal(leadsRes.pagination?.total || 0);
      setStats(statsRes.data || null);
      setDemoMode(!!leadsRes.demoMode);
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
      setError(err.message || 'Failed to requalify leads');
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

  const hasFilters = Boolean(search || priorityFilter || industryFilter || locationFilter);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  // Get unique industries from stats
  const industries = stats?.industryBreakdown?.map((i) => i.industry) || [];

  return (
    <Layout demoMode={demoMode}>
      <div className="space-y-4 sm:space-y-6 w-full max-w-full">
        {/* Page Header & Responsive Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Lead Qualification Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              Discover, score, and prioritize high-value prospects against your ICP.
            </p>
          </div>

          {/* Action Buttons: Responsive row/grid */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs touch-target"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Prospect</span>
            </button>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <Link
                to="/icp"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors touch-target shadow-2xs"
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Edit ICP</span>
              </Link>
              <button
                onClick={handleRequalify}
                disabled={requalifying}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors touch-target shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${requalifying ? 'animate-spin' : ''}`} />
                <span>{requalifying ? 'Scoring...' : 'Requalify'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards: Responsive Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
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
            <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <StatCard
                label="Needs Verification"
                value={stats.needsVerification}
                icon={AlertTriangle}
                color="slate"
              />
            </div>
          </div>
        )}

        {/* Analytics Charts: Responsive Stack */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Priority Distribution Pie */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-2xs min-w-0 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 mb-2 sm:mb-4 flex items-center justify-between">
                <span>Priority Distribution</span>
                <span className="text-xs font-normal text-slate-400">By fit tier</span>
              </h3>
              <div className="w-full h-[180px] sm:h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.priorityBreakdown.filter((p) => p.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="priority"
                    >
                      {stats.priorityBreakdown.map((entry) => (
                        <Cell
                          key={entry.priority}
                          fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [value, name]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-1.5 pt-2 border-t border-slate-100">
                {stats.priorityBreakdown.map((entry) => (
                  <div key={entry.priority} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PRIORITY_COLORS[entry.priority] || '#94a3b8' }}
                    />
                    <span className="text-slate-600 font-medium">
                      {entry.priority} ({entry.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Breakdown Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-2xs min-w-0 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 mb-2 sm:mb-4 flex items-center justify-between">
                <span>Industry Breakdown</span>
                <span className="text-xs font-normal text-slate-400">Top target verticals</span>
              </h3>
              <div className="w-full h-[200px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.industryBreakdown.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="industry"
                      width={80}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls: Ultra-Responsive */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-2.5 sm:space-y-3">
          {/* Row 1: Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search company, contact, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px]"
            />
          </div>

          {/* Row 2: Responsive Dropdowns & Location Filter */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as Priority | '');
                setPage(1);
              }}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[38px] truncate"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[38px] truncate"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="col-span-1 sm:col-auto w-full sm:w-36 px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            />

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[38px]"
              >
                <X className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* View Toggle Bar (Cards vs Table on small screens) */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            <span>Found {total} prospect{total === 1 ? '' : 's'}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'cards' || (viewMode === 'auto')
                  ? 'bg-white text-indigo-700 shadow-2xs md:bg-transparent md:text-slate-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 md:bg-white md:text-indigo-700 md:shadow-2xs'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Leads Section: Mobile Card View + Desktop Table View */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? 'No leads match your filters' : 'No leads found'}
            description={
              hasFilters
                ? 'Try adjusting your filters or search query.'
                : 'Get started by adding your first prospect.'
            }
            action={
              hasFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors touch-target"
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {/* 1. Mobile Cards View (shown on mobile or when viewMode === 'cards') */}
            <div
              className={`divide-y divide-slate-100 ${
                viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block md:hidden'
              }`}
            >
              {leads.map((lead) => {
                const id = lead.id || lead._id || '';
                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/leads/${id}`)}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors cursor-pointer space-y-2"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/leads/${id}`);
                      }
                    }}
                  >
                    {/* Top Row: Company Name & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{lead.companyName}</span>
                          {lead.hasDuplicates && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 shrink-0">
                              DUP
                            </span>
                          )}
                        </div>
                        {lead.domain && (
                          <div className="text-[11px] text-slate-400 truncate">{lead.domain}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {lead.qualification ? (
                          <>
                            <ScoreBadge score={lead.qualification.score} />
                            <PriorityBadge priority={lead.qualification.priority} />
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unscored</span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Contact & Metadata Chips */}
                    <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">{lead.contactName}</span>
                        {lead.jobTitle && (
                          <span className="text-slate-500"> • {lead.jobTitle}</span>
                        )}
                      </div>
                    </div>

                    {/* Attribute tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {lead.industry && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{lead.industry}</span>
                        </span>
                      )}
                      {lead.location && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{lead.location}</span>
                        </span>
                      )}
                      {lead.employeeCount && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lead.employeeCount.toLocaleString()} emp
                        </span>
                      )}
                    </div>

                    {/* Next Best Action Snippet & Arrow */}
                    {lead.qualification?.recommendation && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium truncate">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{lead.qualification.recommendation}</span>
                        </div>
                        <ChevronCard className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop & Tablet Table View (shown on desktop or when viewMode === 'table') */}
            <div
              className={`overflow-x-auto custom-scrollbar ${
                viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'
              }`}
            >
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">
                    <th className="px-4 py-3.5">
                      <button
                        onClick={() => toggleSort('companyName')}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        <span>Company</span>
                        {sortBy === 'companyName' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Industry</th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">
                      <button
                        onClick={() => toggleSort('employeeCount')}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        <span>Size</span>
                        {sortBy === 'employeeCount' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => toggleSort('score')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                      >
                        <span>Score</span>
                        {sortBy === 'score' && <SortIcon className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-center">Priority</th>
                    <th className="px-4 py-3.5 hidden xl:table-cell">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const id = lead.id || lead._id || '';
                    return (
                      <tr
                        key={id}
                        onClick={() => navigate(`/leads/${id}`)}
                        className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span className="group-hover:text-indigo-600 transition-colors truncate">
                                  {lead.companyName}
                                </span>
                                {lead.hasDuplicates && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 shrink-0">
                                    DUP
                                  </span>
                                )}
                              </div>
                              {lead.domain && (
                                <div className="text-xs text-slate-400 truncate">{lead.domain}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-900 font-medium">{lead.contactName}</div>
                          <div className="text-xs text-slate-500">{lead.jobTitle || '—'}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-700">{lead.industry || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-slate-700">
                            {lead.employeeCount ? lead.employeeCount.toLocaleString() : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-slate-700">{lead.location || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {lead.qualification ? (
                            <ScoreBadge score={lead.qualification.score} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {lead.qualification ? (
                            <PriorityBadge priority={lead.qualification.priority} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden xl:table-cell max-w-[220px]">
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-200 bg-slate-50/75">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {total === 0 ? 0 : (page - 1) * 10 + 1}
                </span>
                –
                <span className="font-semibold text-slate-700">
                  {Math.min(page * 10, total)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{total}</span> prospects
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target flex items-center justify-center shadow-2xs"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-700 font-semibold px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target flex items-center justify-center shadow-2xs"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current ICP Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Ideal Customer Profile
                </p>
                <p className="text-xs sm:text-sm text-slate-700 font-medium truncate">
                  SaaS & Technology • 50–500 headcount • US & Global Tech Hubs
                </p>
              </div>
            </div>
            <Link
              to="/icp"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors shrink-0 self-start sm:self-auto"
            >
              Configure Parameters →
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
  label,
  value,
  icon: Icon,
  color,
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
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 ${bgColors[color] || 'bg-slate-100'} rounded-lg flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColors[color] || 'text-slate-600'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight truncate">
            {value}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
