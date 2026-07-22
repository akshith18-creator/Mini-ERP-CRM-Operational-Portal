import { prisma } from '../../config/prisma';
import { CustomerStatus, ChallanStatus } from '@prisma/client';

export class DashboardRepository {
  static async getSummaryStats() {
    const [
      totalCustomers,
      leadCustomers,
      activeCustomers,
      totalProducts,
      rawProducts,
      confirmedChallans,
      draftChallans,
      recentMovements,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.LEAD } }),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.product.count(),
      prisma.product.findMany({ select: { stockQuantity: true, minStockAlert: true } }),
      prisma.salesChallan.aggregate({
        where: { status: ChallanStatus.CONFIRMED },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.inventoryMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, sku: true } } },
      }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, company: true } } },
      }),
    ]);

    const lowStockCount = rawProducts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
    const totalSalesRevenue = confirmedChallans._sum.totalAmount || 0;
    const confirmedCount = confirmedChallans._count.id || 0;

    return {
      customers: {
        total: totalCustomers,
        leads: leadCustomers,
        active: activeCustomers,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockCount,
      },
      sales: {
        confirmedCount,
        draftCount: draftChallans,
        totalRevenue: totalSalesRevenue,
      },
      recentMovements,
      recentChallans,
    };
  }
}
