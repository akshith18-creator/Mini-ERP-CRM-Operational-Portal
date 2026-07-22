import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { sendResponse } from '../../utils/apiResponse';
import { MovementType } from '@prisma/client';

export class InventoryController {
  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const productId = req.query.productId as string | undefined;
      const movementType = req.query.movementType as MovementType | undefined;

      const { movements, meta } = await InventoryService.getMovements({
        page,
        limit,
        productId,
        movementType,
      });

      return sendResponse({
        res,
        message: 'Inventory movements fetched successfully',
        data: movements,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async recordMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await InventoryService.recordMovement(req.body, userId);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Stock movement recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
