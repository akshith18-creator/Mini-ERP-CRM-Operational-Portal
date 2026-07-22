import { prisma } from '../../config/prisma';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';
import { CreateSalesChallanInput } from './sales.validation';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export class SalesRepository {
  static async generateChallanNumber(): Promise<string> {
    const count = await prisma.salesChallan.count();
    const nextNumber = (count + 1).toString().padStart(5, '0');
    return `CH-${new Date().getFullYear()}-${nextNumber}`;
  }

  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const { page, limit, search, status, customerId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { challanNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { company: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          createdBy: { select: { id: true, name: true } },
          confirmedBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, challans };
  }

  static async findById(id: string) {
    return prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, company: true, address: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        confirmedBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, stockQuantity: true } },
          },
        },
      },
    });
  }

  static async createDraft(data: CreateSalesChallanInput & { createdById: string }) {
    const challanNumber = await this.generateChallanNumber();

    // Fetch product details for snapshot
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemsData = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestError(`Product with ID '${item.productId}' not found`);
      }
      const subtotal = product.unitPrice * item.quantity;
      totalAmount += subtotal;

      return {
        productId: product.id,
        skuSnapshot: product.sku,
        nameSnapshot: product.name,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    return prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        notes: data.notes,
        totalAmount,
        status: ChallanStatus.DRAFT,
        createdById: data.createdById,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        items: true,
      },
    });
  }

  static async updateStatus(
    id: string,
    targetStatus: ChallanStatus,
    userId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new NotFoundError('Sales challan not found');
      }

      if (challan.status === targetStatus) {
        throw new BadRequestError(`Sales challan is already in '${targetStatus}' status`);
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new BadRequestError('Cancelled sales challans cannot be modified');
      }

      // Transition DRAFT -> CONFIRMED
      if (challan.status === ChallanStatus.DRAFT && targetStatus === ChallanStatus.CONFIRMED) {
        // Validate and deduct stock for each item
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new BadRequestError(`Product SKU '${item.skuSnapshot}' no longer exists`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new BadRequestError(
              `Insufficient stock for SKU '${product.sku}'. Available: ${product.stockQuantity}, Required: ${item.quantity}`
            );
          }

          // Deduct stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          // Log Inventory Movement
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: MovementType.OUT,
              quantity: item.quantity,
              reason: `Sales Challan #${challan.challanNumber} Confirmed`,
              referenceNumber: challan.challanNumber,
              createdById: userId,
            },
          });
        }

        return tx.salesChallan.update({
          where: { id },
          data: {
            status: ChallanStatus.CONFIRMED,
            confirmedAt: new Date(),
            confirmedById: userId,
          },
          include: {
            customer: true,
            items: true,
            confirmedBy: { select: { id: true, name: true } },
          },
        });
      }

      // Transition CONFIRMED -> CANCELLED (restore stock)
      if (challan.status === ChallanStatus.CONFIRMED && targetStatus === ChallanStatus.CANCELLED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: MovementType.IN,
              quantity: item.quantity,
              reason: `Sales Challan #${challan.challanNumber} Cancelled (Stock Restored)`,
              referenceNumber: challan.challanNumber,
              createdById: userId,
            },
          });
        }

        return tx.salesChallan.update({
          where: { id },
          data: {
            status: ChallanStatus.CANCELLED,
          },
          include: {
            customer: true,
            items: true,
          },
        });
      }

      // Transition DRAFT -> CANCELLED
      if (challan.status === ChallanStatus.DRAFT && targetStatus === ChallanStatus.CANCELLED) {
        return tx.salesChallan.update({
          where: { id },
          data: { status: ChallanStatus.CANCELLED },
          include: { customer: true, items: true },
        });
      }

      throw new BadRequestError(`Invalid status transition from ${challan.status} to ${targetStatus}`);
    });
  }
}
