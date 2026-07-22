import { FollowUpsRepository } from './followups.repository';
import { CreateFollowUpInput, UpdateFollowUpInput } from './followups.validation';
import { NotFoundError } from '../../utils/errors';
import { prisma } from '../../config/prisma';

export class FollowUpsService {
  static async getFollowUpsByCustomer(customerId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return FollowUpsRepository.findByCustomer(customerId);
  }

  static async createFollowUp(data: CreateFollowUpInput, createdById: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return FollowUpsRepository.create({ ...data, createdById });
  }

  static async updateFollowUp(id: string, data: UpdateFollowUpInput) {
    const existing = await FollowUpsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Follow-up note not found');
    }
    return FollowUpsRepository.update(id, data);
  }

  static async deleteFollowUp(id: string) {
    const existing = await FollowUpsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Follow-up note not found');
    }
    return FollowUpsRepository.delete(id);
  }
}
