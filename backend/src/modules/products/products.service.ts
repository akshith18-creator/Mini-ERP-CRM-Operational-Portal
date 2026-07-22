import { ProductsRepository } from './products.repository';
import { CreateProductInput, UpdateProductInput } from './products.validation';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class ProductsService {
  static async getProducts(params: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const { total, products } = await ProductsRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      products,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  static async getProductById(id: string) {
    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  static async createProduct(data: CreateProductInput) {
    const existing = await ProductsRepository.findBySku(data.sku);
    if (existing) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
    }
    return ProductsRepository.create(data);
  }

  static async updateProduct(id: string, data: UpdateProductInput) {
    await this.getProductById(id);

    if (data.sku) {
      const existing = await ProductsRepository.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
      }
    }

    return ProductsRepository.update(id, data);
  }

  static async deleteProduct(id: string) {
    await this.getProductById(id);
    return ProductsRepository.delete(id);
  }

  static async getCategories() {
    return ProductsRepository.getCategories();
  }
}
