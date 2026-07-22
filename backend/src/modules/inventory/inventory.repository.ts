import { prisma } from '../../config/prisma';
import { MovementType, Prisma } from '@prisma/client';
import { CreateInventoryMovementInput } from './inventory.validation';
import { BadRequestError } from '../../utils/errors';

export class InventoryRepository {
  static async findAll(params: {
    page: number;
    limit: number;
    productId?: string;
    movementType?: MovementType;
  }) {
    const { page, limit, productId, movementType } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryMovementWhereInput = {
      ...(productId && { productId }),
      ...(movementType && { movementType }),
    };

    const [total, movements] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, category: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, movements };
  }

  static async recordMovement(
    data: CreateInventoryMovementInput & { createdById: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new BadRequestError('Target product not found');
      }

      if (data.movementType === MovementType.OUT) {
        if (product.stockQuantity < data.quantity) {
          throw new BadRequestError(
            `Insufficient stock for SKU '${product.sku}'. Available: ${product.stockQuantity}, Requested: ${data.quantity}`
          );
        }
      }

      const stockChange =
        data.movementType === MovementType.IN ? data.quantity : -data.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: {
          stockQuantity: { increment: stockChange },
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: data.productId,
          movementType: data.movementType,
          quantity: data.quantity,
          reason: data.reason,
          referenceNumber: data.referenceNumber,
          createdById: data.createdById,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return { movement, updatedStock: updatedProduct.stockQuantity };
    });
  }
}
