import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const salesItemInputSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Item quantity must be greater than zero'),
});

export const createSalesChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    notes: z.string().optional(),
    items: z.array(salesItemInputSchema).min(1, 'At least one product item is required'),
  }),
});

export const updateChallanStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid challan ID'),
  }),
  body: z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED']),
  }),
});

export const getSalesChallansQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(ChallanStatus).optional(),
    customerId: z.string().optional(),
  }),
});

export type CreateSalesChallanInput = z.infer<typeof createSalesChallanSchema>['body'];
export type UpdateChallanStatusInput = z.infer<typeof updateChallanStatusSchema>['body'];
