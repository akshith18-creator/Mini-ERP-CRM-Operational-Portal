import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import customersRoutes from './modules/customers/customers.routes';
import followupsRoutes from './modules/followups/followups.routes';
import productsRoutes from './modules/products/products.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import salesRoutes from './modules/sales/sales.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { sendResponse } from './utils/apiResponse';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  return sendResponse({
    res,
    message: 'Mini ERP + CRM API Service is healthy',
    data: { status: 'UP', environment: env.NODE_ENV, timestamp: new Date() },
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/followups', followupsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Requested API endpoint does not exist',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
