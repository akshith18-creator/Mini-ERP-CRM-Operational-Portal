import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from './products.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/categories', ProductsController.getCategories);

router.get(
  '/',
  validateRequest(getProductsQuerySchema),
  ProductsController.getProducts
);

router.get('/:id', ProductsController.getProductById);

router.post(
  '/',
  requireRole([Role.ADMIN, Role.WAREHOUSE]),
  validateRequest(createProductSchema),
  ProductsController.createProduct
);

router.patch(
  '/:id',
  requireRole([Role.ADMIN, Role.WAREHOUSE]),
  validateRequest(updateProductSchema),
  ProductsController.updateProduct
);

router.delete(
  '/:id',
  requireRole([Role.ADMIN]),
  ProductsController.deleteProduct
);

export default router;
