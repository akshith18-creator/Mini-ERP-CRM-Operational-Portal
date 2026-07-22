import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { sendResponse } from '../../utils/apiResponse';

export class DashboardController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getDashboardStats();
      return sendResponse({
        res,
        message: 'Dashboard metrics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
