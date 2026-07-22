import { Request, Response, NextFunction } from 'express';
import { SalesService } from './sales.service';
import { sendResponse } from '../../utils/apiResponse';
import { ChallanStatus } from '@prisma/client';

export class SalesController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as ChallanStatus | undefined;
      const customerId = req.query.customerId as string | undefined;

      const { challans, meta } = await SalesService.getChallans({
        page,
        limit,
        search,
        status,
        customerId,
      });

      return sendResponse({
        res,
        message: 'Sales challans fetched successfully',
        data: challans,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await SalesService.getChallanById(id);
      return sendResponse({
        res,
        message: 'Sales challan details fetched',
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const challan = await SalesService.createChallan(req.body, userId);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Sales challan draft created',
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.userId;

      const challan = await SalesService.updateChallanStatus(id, status, userId);
      return sendResponse({
        res,
        message: `Sales challan status updated to '${status}'`,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }
}
