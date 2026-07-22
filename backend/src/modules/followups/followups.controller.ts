import { Request, Response, NextFunction } from 'express';
import { FollowUpsService } from './followups.service';
import { sendResponse } from '../../utils/apiResponse';

export class FollowUpsController {
  static async getByCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const followUps = await FollowUpsService.getFollowUpsByCustomer(customerId);
      return sendResponse({
        res,
        message: 'Follow-ups retrieved successfully',
        data: followUps,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const followUp = await FollowUpsService.createFollowUp(req.body, userId);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Follow-up note added',
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUp = await FollowUpsService.updateFollowUp(id, req.body);
      return sendResponse({
        res,
        message: 'Follow-up note updated',
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FollowUpsService.deleteFollowUp(id);
      return sendResponse({
        res,
        message: 'Follow-up note deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
