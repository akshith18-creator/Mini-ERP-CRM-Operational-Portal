import { Router } from 'express';
import { FollowUpsController } from './followups.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createFollowUpSchema, updateFollowUpSchema } from './followups.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/customer/:customerId', FollowUpsController.getByCustomer);

router.post(
  '/',
  requireRole([Role.ADMIN, Role.SALES]),
  validateRequest(createFollowUpSchema),
  FollowUpsController.createFollowUp
);

router.patch(
  '/:id',
  requireRole([Role.ADMIN, Role.SALES]),
  validateRequest(updateFollowUpSchema),
  FollowUpsController.updateFollowUp
);

router.delete(
  '/:id',
  requireRole([Role.ADMIN]),
  FollowUpsController.deleteFollowUp
);

export default router;
