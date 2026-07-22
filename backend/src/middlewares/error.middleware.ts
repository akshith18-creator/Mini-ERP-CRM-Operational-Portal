import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendResponse({
      res,
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: err.errors ? { details: err.errors } : null,
    });
  }

  // Log unexpected errors
  console.error('Unhandled Error:', err);

  return sendResponse({
    res,
    statusCode: 500,
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    data: env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  });
};
