import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/endpoints';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Users,
  DollarSign,
  AlertTriangle,
  FileText,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
          Failed to load dashboard metrics
        </h3>
        <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
          Please check your backend connection or refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            Executive Operations Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time insight into sales, customer CRM pipeline, and inventory status.
          </p>
        </div>
        <Link
          to="/sales/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          Create Sales Challan
        </Link>
      </div>

      {/* Low Stock Alert Header Banner if triggered */}
      {data.products.lowStock > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-sm">
                Low Stock Threshold Warning ({data.products.lowStock} Products Alert)
              </div>
              <div className="text-xs opacity-80">
                Items are falling below minimum safety stock levels. Reorder advised.
              </div>
            </div>
          </div>
          <Link
            to="/products?lowStockOnly=true"
            className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            View Low Stock
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmed Sales Revenue
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            ${data.sales.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>From {data.sales.confirmedCount} confirmed challans</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="p-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            {data.customers.total}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{data.customers.active} Active</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{data.customers.leads} Leads</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active SKU Catalog
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            {data.products.total}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {data.products.lowStock} products require restocking
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Draft Challans
            </span>
            <div className="p-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            {data.sales.draftCount}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting warehouse confirmation
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inventory Movements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-slate-100">
              Recent Inventory Audit Log
            </h3>
            <Link
              to="/inventory"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      movement.movementType === 'IN'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {movement.movementType === 'IN' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {movement.product?.name || 'Unknown Product'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {movement.reason} • {new Date(movement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={movement.movementType === 'IN' ? 'success' : 'danger'}>
                    {movement.movementType === 'IN' ? `+${movement.quantity}` : `-${movement.quantity}`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Challans */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-heading text-slate-900 dark:text-slate-100">
              Recent Sales Challans
            </h3>
            <Link
              to="/sales"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentChallans.map((challan) => (
              <div
                key={challan.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {challan.challanNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {challan.customer?.name} • {new Date(challan.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ${challan.totalAmount.toFixed(2)}
                  </div>
                  <Badge
                    variant={
                      challan.status === 'CONFIRMED'
                        ? 'success'
                        : challan.status === 'DRAFT'
                        ? 'info'
                        : 'danger'
                    }
                  >
                    {challan.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
