import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { sendResponse } from '../../utils/apiResponse';
import { Role } from '@prisma/client';

export class UsersController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const role = req.query.role as Role | undefined;

      const { users, meta } = await UsersService.getUsers({ page, limit, search, role });

      return sendResponse({
        res,
        message: 'Users fetched successfully',
        data: users,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UsersService.getUserById(id);
      return sendResponse({
        res,
        message: 'User details fetched successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await UsersService.updateUser(id, req.body);
      return sendResponse({
        res,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
