import { Router } from 'express';
import { SalesController } from './sales.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createSalesChallanSchema,
  updateChallanStatusSchema,
  getSalesChallansQuerySchema,
} from './sales.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest(getSalesChallansQuerySchema),
  SalesController.getChallans
);

router.get('/:id', SalesController.getChallanById);

router.post(
  '/',
  requireRole([Role.ADMIN, Role.SALES]),
  validateRequest(createSalesChallanSchema),
  SalesController.createChallan
);

router.patch(
  '/:id/status',
  requireRole([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]),
  validateRequest(updateChallanStatusSchema),
  SalesController.updateStatus
);

export default router;
