import { Router } from 'express';
import { CustomersController } from './customers.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomersQuerySchema,
} from './customers.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole([Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE]),
  validateRequest(getCustomersQuerySchema),
  CustomersController.getCustomers
);

router.get(
  '/:id',
  requireRole([Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE]),
  CustomersController.getCustomerById
);

router.post(
  '/',
  requireRole([Role.ADMIN, Role.SALES]),
  validateRequest(createCustomerSchema),
  CustomersController.createCustomer
);

router.patch(
  '/:id',
  requireRole([Role.ADMIN, Role.SALES]),
  validateRequest(updateCustomerSchema),
  CustomersController.updateCustomer
);

router.delete(
  '/:id',
  requireRole([Role.ADMIN]),
  CustomersController.deleteCustomer
);

export default router;
