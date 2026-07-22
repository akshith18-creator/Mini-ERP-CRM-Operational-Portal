import { prisma } from '../../config/prisma';
import { CustomerType, CustomerStatus, Prisma } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.validation';

export class CustomersRepository {
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    type?: CustomerType;
    status?: CustomerStatus;
  }) {
    const { page, limit, search, type, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      ...(type && { type }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { followUps: true, salesChallans: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, customers };
  }

  static async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        followUps: {
          include: { createdBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        salesChallans: {
          select: { id: true, challanNumber: true, status: true, totalAmount: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.customer.findUnique({ where: { email } });
  }

  static async create(data: CreateCustomerInput & { createdById: string }) {
    return prisma.customer.create({
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async update(id: string, data: UpdateCustomerInput) {
    return prisma.customer.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  }
}
