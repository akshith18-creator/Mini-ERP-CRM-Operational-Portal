import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { sendResponse } from '../../utils/apiResponse';

export class ProductsController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const lowStockOnly = req.query.lowStockOnly === 'true';

      const { products, meta } = await ProductsService.getProducts({
        page,
        limit,
        search,
        category,
        lowStockOnly,
      });

      return sendResponse({
        res,
        message: 'Products fetched successfully',
        data: products,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductsService.getProductById(id);
      return sendResponse({
        res,
        message: 'Product details fetched',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.createProduct(req.body);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductsService.updateProduct(id, req.body);
      return sendResponse({
        res,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProductsService.deleteProduct(id);
      return sendResponse({
        res,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductsService.getCategories();
      return sendResponse({
        res,
        message: 'Categories fetched',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
