import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.validation';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getProfile);

export default router;
