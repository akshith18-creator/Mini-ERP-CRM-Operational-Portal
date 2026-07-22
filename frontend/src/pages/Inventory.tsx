import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, productsApi } from '../api/endpoints';
import { MovementType } from '../types';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, ArrowUpRight, ArrowDownLeft, Plus, History, Filter } from 'lucide-react';

const movementSchema = z.object({
  productId: z.string().uuid('Product selection is required'),
  movementType: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(2, 'Reason is required'),
  referenceNumber: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

export const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-movements', page, typeFilter],
    queryFn: async () => {
      const res = await inventoryApi.getMovements({
        page,
        limit: 10,
        movementType: typeFilter || undefined,
      });
      return res.data;
    },
  });

  const { data: productOptions } = useQuery({
    queryKey: ['all-products-select'],
    queryFn: async () => {
      const res = await productsApi.getProducts({ page: 1, limit: 100 });
      return res.data.data;
    },
    enabled: isModalOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      movementType: 'IN',
      quantity: 1,
      reason: 'Manual Stock Intake',
    },
  });

  const recordMutation = useMutation({
    mutationFn: (formData: MovementFormData) => inventoryApi.recordMovement(formData),
    onSuccess: (res) => {
      showToast(
        `Stock movement recorded! New balance: ${res.data.data.updatedStock} units`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to record movement', 'error');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-brand-600" />
            Inventory Control & Audit Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track every stock intake, warehouse issuance, and inventory adjustment.
          </p>
        </div>
        {hasRole(['ADMIN', 'WAREHOUSE']) && (
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Record Stock Movement
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filter by Movement Type:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTypeFilter('');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              typeFilter === ''
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => {
              setTypeFilter('IN');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              typeFilter === 'IN'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Stock IN (+ Handled)
          </button>
          <button
            onClick={() => {
              setTypeFilter('OUT');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              typeFilter === 'OUT'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Stock OUT (- Issued)
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No stock movements recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Target Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Reason & Reference</th>
                  <th className="px-6 py-4 font-semibold">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.data.map((movement) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {movement.product?.name || 'Unknown'}
                      </div>
                      <div className="font-mono text-xs text-brand-600 dark:text-brand-400">
                        {movement.product?.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {movement.movementType === 'IN' ? (
                          <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <Badge
                          variant={movement.movementType === 'IN' ? 'success' : 'danger'}
                        >
                          {movement.movementType}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {movement.movementType === 'IN' ? `+${movement.quantity}` : `-${movement.quantity}`} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-100 font-medium">
                        {movement.reason}
                      </div>
                      {movement.referenceNumber && (
                        <div className="text-xs text-slate-400 font-mono">
                          Ref: {movement.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {movement.createdBy?.name || 'System'}
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

      {/* Record Stock Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock Movement (IN / OUT)"
      >
        <form onSubmit={handleSubmit((d) => recordMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Target Product *
            </label>
            <select
              {...register('productId')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Select Product --</option>
              {productOptions?.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Current Stock: {p.stockQuantity})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs text-rose-500 mt-1">{errors.productId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Movement Direction *
              </label>
              <select
                {...register('movementType')}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="IN">IN (Stock Intake / Purchase)</option>
                <option value="OUT">OUT (Issue / Damaged / Sample)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Quantity *
              </label>
              <input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
              {errors.quantity && (
                <p className="text-xs text-rose-500 mt-1">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Reason for Movement *
            </label>
            <input
              {...register('reason')}
              type="text"
              placeholder="e.g. Factory shipment receipt, Internal QC demo sample..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.reason && (
              <p className="text-xs text-rose-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Reference Number (PO / Invoice #)
            </label>
            <input
              {...register('referenceNumber')}
              type="text"
              placeholder="e.g. PO-2026-8801"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Record Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
