import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service';
import { sendResponse } from '../../utils/apiResponse';
import { CustomerType, CustomerStatus } from '@prisma/client';

export class CustomersController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const type = req.query.type as CustomerType | undefined;
      const status = req.query.status as CustomerStatus | undefined;

      const { customers, meta } = await CustomersService.getCustomers({
        page,
        limit,
        search,
        type,
        status,
      });

      return sendResponse({
        res,
        message: 'Customers retrieved successfully',
        data: customers,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomersService.getCustomerById(id);
      return sendResponse({
        res,
        message: 'Customer details retrieved',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const customer = await CustomersService.createCustomer(req.body, userId);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomersService.updateCustomer(id, req.body);
      return sendResponse({
        res,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CustomersService.deleteCustomer(id);
      return sendResponse({
        res,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
