import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/endpoints';
import { Product } from '../types';
import { SearchInput } from '../components/common/SearchInput';
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
import { Boxes, Plus, AlertTriangle, Filter, Trash2, Edit3 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const productSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  unitPrice: z.number().positive('Unit price must be positive'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  stockQuantity: z.number().int().nonnegative('Initial stock cannot be negative'),
  minStockAlert: z.number().int().nonnegative('Min stock alert cannot be negative'),
  warehouseLocation: z.string().min(2, 'Warehouse location is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

export const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const lowStockOnlyParam = searchParams.get('lowStockOnly') === 'true';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, categoryFilter, lowStockOnlyParam],
    queryFn: async () => {
      const res = await productsApi.getProducts({
        page,
        limit: 10,
        search: search || undefined,
        category: categoryFilter || undefined,
        lowStockOnly: lowStockOnlyParam,
      });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unitPrice: 100,
      costPrice: 50,
      stockQuantity: 25,
      minStockAlert: 10,
      warehouseLocation: 'Main Warehouse - Section A',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (formData: ProductFormData) => {
      if (editingProduct) {
        return productsApi.updateProduct(editingProduct.id, formData);
      }
      return productsApi.createProduct(formData);
    },
    onSuccess: () => {
      showToast(
        editingProduct ? 'Product details updated' : 'New product created',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      closeModal();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      showToast('Product removed from catalog', 'success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'Electronics',
      description: '',
      unitPrice: 99.99,
      costPrice: 50.0,
      stockQuantity: 50,
      minStockAlert: 10,
      warehouseLocation: 'Main Warehouse - Section A',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setValue('sku', prod.sku);
    setValue('name', prod.name);
    setValue('category', prod.category);
    setValue('description', prod.description || '');
    setValue('unitPrice', prod.unitPrice);
    setValue('costPrice', prod.costPrice);
    setValue('stockQuantity', prod.stockQuantity);
    setValue('minStockAlert', prod.minStockAlert);
    setValue('warehouseLocation', prod.warehouseLocation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-brand-600" />
            Product & SKU Inventory Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage product Master Data, unit prices, costs, and warehouse storage locations.
          </p>
        </div>
        {hasRole(['ADMIN', 'WAREHOUSE']) && (
          <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
            Add New Product
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by SKU, product name, category..."
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (lowStockOnlyParam) {
                searchParams.delete('lowStockOnly');
              } else {
                searchParams.set('lowStockOnly', 'true');
              }
              setSearchParams(searchParams);
              setPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              lowStockOnlyParam
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Only
          </button>
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
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">SKU & Product Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Pricing (Sell / Cost)</th>
                  <th className="px-6 py-4 font-semibold">Stock Balance</th>
                  <th className="px-6 py-4 font-semibold">Warehouse Location</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.data.map((product) => {
                  const isLowStock = product.stockQuantity <= product.minStockAlert;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">
                          {product.sku}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="purple">{product.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          ${product.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Cost: ${product.costPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {product.stockQuantity} units
                          </span>
                          {isLowStock && (
                            <Badge variant="danger" size="sm">
                              Min Alert ({product.minStockAlert})
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {product.warehouseLocation}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasRole(['ADMIN', 'WAREHOUSE']) && (
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Product Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {hasRole(['ADMIN']) && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete SKU '${product.sku}'?`
                                  )
                                ) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? `Edit Product ${editingProduct.sku}` : 'Add New Master Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                SKU Code *
              </label>
              <input
                {...register('sku')}
                type="text"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Category *
              </label>
              <input
                {...register('category')}
                type="text"
                placeholder="Electronics, Networking..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Product Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Selling Price ($) *
              </label>
              <input
                {...register('unitPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.unitPrice && (
                <p className="text-xs text-rose-500 mt-1">{errors.unitPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Cost Price ($) *
              </label>
              <input
                {...register('costPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {!editingProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  {...register('stockQuantity', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Min Stock Alert Threshold
                </label>
                <input
                  {...register('minStockAlert', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Warehouse Location *
            </label>
            <input
              {...register('warehouseLocation')}
              type="text"
              placeholder="e.g. Warehouse A - Rack 04"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
