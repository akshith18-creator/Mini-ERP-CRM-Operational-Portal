import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getUsersQuerySchema, updateUserSchema } from './users.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, requireRole([Role.ADMIN]));

router.get('/', validateRequest(getUsersQuerySchema), UsersController.getUsers);
router.get('/:id', UsersController.getUserById);
router.patch('/:id', validateRequest(updateUserSchema), UsersController.updateUser);

export default router;
