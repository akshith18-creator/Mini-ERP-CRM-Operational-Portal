import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../api/endpoints';
import { ChallanStatus } from '../types';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Eye, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SalesChallans: React.FC = () => {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['sales-challans', page, search, statusFilter],
    queryFn: async () => {
      const res = await salesApi.getChallans({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      return res.data;
    },
  });

  const getStatusBadge = (status: ChallanStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Confirmed
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="info">
            <Clock className="w-3 h-3 mr-1 inline" /> Draft
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="danger">
            <XCircle className="w-3 h-3 mr-1 inline" /> Cancelled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-600" />
            Sales Delivery Challans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create sales orders, issue delivery challans, and manage stock deduction workflows.
          </p>
        </div>
        {hasRole(['ADMIN', 'SALES']) && (
          <Link to="/sales/new">
            <Button icon={<Plus className="w-4 h-4" />}>Create Sales Challan</Button>
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by Challan # (CH-2026-...), Customer name..."
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ChallanStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No sales challans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Challan Number</th>
                  <th className="px-6 py-4 font-semibold">Customer Account</th>
                  <th className="px-6 py-4 font-semibold">Items Count</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date Created</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.data.map((challan) => (
                  <tr
                    key={challan.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {challan.challanNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {challan.customer?.name || 'Customer'}
                      </div>
                      {challan.customer?.company && (
                        <div className="text-xs text-slate-500">{challan.customer.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {challan._count?.items || 0} product line items
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      ${challan.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(challan.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/sales/${challan.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/60 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.meta && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
