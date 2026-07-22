import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../api/endpoints';
import { ChallanStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  UserCheck,
} from 'lucide-react';

export const SalesChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: challan, isLoading, error } = useQuery({
    queryKey: ['sales-challan', id],
    queryFn: async () => {
      const res = await salesApi.getChallanById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ChallanStatus) => salesApi.updateStatus(id!, status),
    onSuccess: (_, targetStatus) => {
      showToast(
        targetStatus === 'CONFIRMED'
          ? 'Challan Confirmed! Product stock deducted & inventory movement logged.'
          : 'Challan Cancelled! Stock restored.',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['sales-challan', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Status transition failed', 'error');
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-2xl">
        <p className="text-rose-700 dark:text-rose-300">Sales challan record not found.</p>
        <Button onClick={() => navigate('/sales')} className="mt-4" size="sm">
          Return to Sales List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/sales')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Challans
        </button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print Delivery Slip
          </Button>

          {/* Workflow Action Buttons */}
          {challan.status === 'DRAFT' && hasRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']) && (
            <Button
              size="sm"
              onClick={() => {
                if (window.confirm('Confirming this challan will deduct stock from inventory. Proceed?')) {
                  statusMutation.mutate('CONFIRMED');
                }
              }}
              isLoading={statusMutation.isPending}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Issue Stock
            </Button>
          )}

          {challan.status !== 'CANCELLED' && hasRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Cancelling this challan will restore deducted stock back to inventory. Proceed?')) {
                  statusMutation.mutate('CANCELLED');
                }
              }}
              isLoading={statusMutation.isPending}
              icon={<XCircle className="w-4 h-4" />}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Printable Challan Slip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Challan Slip Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
                SALES DELIVERY CHALLAN
              </h1>
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
            <div className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">
              Challan Number: {challan.challanNumber}
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <div>
              <span className="font-semibold">Issued Date:</span> {new Date(challan.createdAt).toLocaleDateString()}
            </div>
            {challan.confirmedAt && (
              <div>
                <span className="font-semibold">Confirmed Date:</span> {new Date(challan.confirmedAt).toLocaleDateString()}
              </div>
            )}
            <div>
              <span className="font-semibold">Prepared By:</span> {challan.createdBy?.name || 'Sales User'}
            </div>
            {challan.confirmedBy && (
              <div>
                <span className="font-semibold">Confirmed By:</span> {challan.confirmedBy.name}
              </div>
            )}
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Customer Account
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {challan.customer?.name}
            </div>
            {challan.customer?.company && (
              <div className="text-xs text-slate-500 font-medium">{challan.customer.company}</div>
            )}
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {challan.customer?.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {challan.customer?.phone}
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Delivery Address
            </span>
            <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{challan.customer?.address || 'Standard Delivery Address'}</span>
            </div>
            {challan.notes && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Notes:</span>{' '}
                {challan.notes}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Product Line Items Snapshot
          </h3>
          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Product Description</th>
                  <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                  <th className="px-4 py-3 font-semibold text-right">Qty</th>
                  <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {challan.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {item.skuSnapshot}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.nameSnapshot}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                      ${item.unitPriceSnapshot.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full max-w-xs space-y-2 text-right">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Items Total Count:</span>
              <span className="font-semibold">{challan.items?.length || 0} Lines</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Total Challan Value:</span>
              <span className="text-xl font-heading font-extrabold text-brand-600 dark:text-brand-400">
                ${challan.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures for printed version */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-16 text-center text-xs text-slate-500">
          <div>
            <div className="border-b border-slate-400 mb-2 h-12" />
            Authorized Dispatch Signature
          </div>
          <div>
            <div className="border-b border-slate-400 mb-2 h-12" />
            Customer Receiving Signature
          </div>
        </div>
      </div>
    </div>
  );
};
