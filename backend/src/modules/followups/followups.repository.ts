import { prisma } from '../../config/prisma';
import { CreateFollowUpInput, UpdateFollowUpInput } from './followups.validation';

export class FollowUpsRepository {
  static async findByCustomer(customerId: string) {
    return prisma.followUp.findMany({
      where: { customerId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.followUp.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  static async create(data: CreateFollowUpInput & { createdById: string }) {
    return prisma.followUp.create({
      data: {
        customerId: data.customerId,
        notes: data.notes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        status: data.status,
        createdById: data.createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  static async update(id: string, data: UpdateFollowUpInput) {
    return prisma.followUp.update({
      where: { id },
      data: {
        ...(data.notes && { notes: data.notes }),
        ...(data.followUpDate && { followUpDate: new Date(data.followUpDate) }),
        ...(data.status && { status: data.status }),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  static async delete(id: string) {
    return prisma.followUp.delete({ where: { id } });
  }
}
