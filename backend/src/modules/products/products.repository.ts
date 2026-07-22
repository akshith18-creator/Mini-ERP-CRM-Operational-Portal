import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from './products.validation';

export class ProductsRepository {
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const { page, limit, search, category, lowStockOnly } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    if (lowStockOnly) {
      // Products where stockQuantity <= minStockAlert
      const rawProducts = await prisma.product.findMany({
        where,
        orderBy: { stockQuantity: 'asc' },
      });
      const lowStockProducts = rawProducts.filter((p) => p.stockQuantity <= p.minStockAlert);
      const total = lowStockProducts.length;
      const paginated = lowStockProducts.slice(skip, skip + limit);
      return { total, products: paginated };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, products };
  }

  static async findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  }

  static async create(data: CreateProductInput) {
    return prisma.product.create({ data });
  }

  static async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  static async getCategories() {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    return categories.map((c) => c.category);
  }
}
