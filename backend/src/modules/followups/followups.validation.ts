import { z } from 'zod';

export const createFollowUpSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    notes: z.string().min(2, 'Notes are required'),
    followUpDate: z.string().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional().default('PENDING'),
  }),
});

export const updateFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid follow-up ID'),
  }),
  body: z.object({
    notes: z.string().min(2).optional(),
    followUpDate: z.string().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>['body'];
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>['body'];
