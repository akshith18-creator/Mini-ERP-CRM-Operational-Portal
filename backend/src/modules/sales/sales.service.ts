import { SalesRepository } from './sales.repository';
import { ChallanStatus } from '@prisma/client';
import { CreateSalesChallanInput } from './sales.validation';
import { NotFoundError } from '../../utils/errors';
import { prisma } from '../../config/prisma';

export class SalesService {
  static async getChallans(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const { total, challans } = await SalesRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      challans,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await SalesRepository.findById(id);
    if (!challan) {
      throw new NotFoundError('Sales challan not found');
    }
    return challan;
  }

  static async createChallan(data: CreateSalesChallanInput, createdById: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundError('Selected customer does not exist');
    }
    return SalesRepository.createDraft({ ...data, createdById });
  }

  static async updateChallanStatus(id: string, status: ChallanStatus, userId: string) {
    return SalesRepository.updateStatus(id, status, userId);
  }
}
