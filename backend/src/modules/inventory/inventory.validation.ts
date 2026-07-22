import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createInventoryMovementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    movementType: z.nativeEnum(MovementType),
    quantity: z.number().int().positive('Quantity must be greater than zero'),
    reason: z.string().min(2, 'Reason is required'),
    referenceNumber: z.string().optional(),
  }),
});

export const getInventoryMovementsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    productId: z.string().optional(),
    movementType: z.nativeEnum(MovementType).optional(),
  }),
});

export type CreateInventoryMovementInput = z.infer<typeof createInventoryMovementSchema>['body'];
