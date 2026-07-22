import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    company: z.string().optional(),
    address: z.string().optional(),
    type: z.nativeEnum(CustomerType).optional().default(CustomerType.RETAIL),
    status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.LEAD),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    type: z.nativeEnum(CustomerType).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
  }),
});

export const getCustomersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    type: z.nativeEnum(CustomerType).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
