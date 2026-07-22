import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(2, 'SKU is required'),
    name: z.string().min(2, 'Product name is required'),
    category: z.string().min(2, 'Category is required'),
    description: z.string().optional(),
    unitPrice: z.number().positive('Unit price must be positive'),
    costPrice: z.number().nonnegative('Cost price cannot be negative').optional().default(0),
    stockQuantity: z.number().int().nonnegative('Initial stock cannot be negative').optional().default(0),
    minStockAlert: z.number().int().nonnegative('Min stock alert cannot be negative').optional().default(10),
    warehouseLocation: z.string().optional().default('Main Warehouse - Section A'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    sku: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    description: z.string().optional(),
    unitPrice: z.number().positive().optional(),
    costPrice: z.number().nonnegative().optional(),
    minStockAlert: z.number().int().nonnegative().optional(),
    warehouseLocation: z.string().optional(),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStockOnly: z.string().optional().transform((val) => val === 'true'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
