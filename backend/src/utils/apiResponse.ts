import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T | null;
  meta?: PaginationMeta;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  success = true,
  message,
  data = null,
  meta,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    ...(meta && { meta }),
  });
};
