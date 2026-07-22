import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customersApi, productsApi, salesApi } from '../api/endpoints';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const NewSalesChallan: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([
    { productId: '', quantity: 1 },
  ]);

  const { data: customers } = useQuery({
    queryKey: ['all-customers-select'],
    queryFn: async () => {
      const res = await customersApi.getCustomers({ page: 1, limit: 100 });
      return res.data.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['all-products-select'],
    queryFn: async () => {
      const res = await productsApi.getProducts({ page: 1, limit: 100 });
      return res.data.data;
    },
  });

  const productMap = new Map<string, Product>(
    products?.map((p) => [p.id, p]) || []
  );

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SelectedItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Grand Total calculation
  const grandTotal = items.reduce((acc, item) => {
    const p = productMap.get(item.productId);
    if (!p) return acc;
    return acc + p.unitPrice * (item.quantity || 0);
  }, 0);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) {
        throw new Error('Please select a customer');
      }
      const validItems = items.filter((i) => i.productId && i.quantity > 0);
      if (validItems.length === 0) {
        throw new Error('Please add at least one product with quantity > 0');
      }

      return salesApi.createChallan({
        customerId,
        notes,
        items: validItems,
      });
    },
    onSuccess: (res) => {
      showToast('Sales Challan created as DRAFT', 'success');
      navigate(`/sales/${res.data.data.id}`);
    },
    onError: (err: any) => {
      showToast(err.message || err.response?.data?.message || 'Failed to create sales challan', 'error');
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link
          to="/sales"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Challans List
        </Link>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-brand-600" />
          Create New Sales Delivery Challan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Draft order snapshot. Stock is deducted only after confirmation by Warehouse.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Customer Account *
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
          >
            <option value="">-- Choose Customer --</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''} - [{c.type}]
              </option>
            ))}
          </select>
        </div>

        {/* Product Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Product Items Order List
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addItemRow} icon={<Plus className="w-4 h-4" />}>
              Add Product Line
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProduct = productMap.get(item.productId);
              const subtotal = selectedProduct ? selectedProduct.unitPrice * (item.quantity || 0) : 0;
              const isStockInsufficient = selectedProduct && selectedProduct.stockQuantity < item.quantity;

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Product SKU / Name *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">-- Select Product --</option>
                        {products?.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.name} - ${p.unitPrice.toFixed(2)} (Stock: {p.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-3 text-right">
                      <div className="text-xs text-slate-500 mb-1">Subtotal</div>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Insufficient Stock Warning */}
                  {isStockInsufficient && (
                    <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Warning: Requested quantity ({item.quantity}) exceeds available stock ({selectedProduct.stockQuantity}). Confirmation will be blocked until stock is received.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Delivery Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Special packing request, express shipping carrier details..."
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Grand Total & Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold">
              Grand Total Calculated Amount
            </div>
            <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
              ${grandTotal.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/sales')}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              icon={<FileText className="w-4 h-4" />}
            >
              Save Draft Challan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
