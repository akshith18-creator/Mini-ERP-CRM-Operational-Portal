import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createInventoryMovementSchema,
  getInventoryMovementsQuerySchema,
} from './inventory.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest(getInventoryMovementsQuerySchema),
  InventoryController.getMovements
);

router.post(
  '/',
  requireRole([Role.ADMIN, Role.WAREHOUSE]),
  validateRequest(createInventoryMovementSchema),
  InventoryController.recordMovement
);

export default router;
