import { InventoryRepository } from './inventory.repository';
import { MovementType } from '@prisma/client';
import { CreateInventoryMovementInput } from './inventory.validation';

export class InventoryService {
  static async getMovements(params: {
    page: number;
    limit: number;
    productId?: string;
    movementType?: MovementType;
  }) {
    const { total, movements } = await InventoryRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      movements,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  static async recordMovement(
    data: CreateInventoryMovementInput,
    createdById: string
  ) {
    return InventoryRepository.recordMovement({ ...data, createdById });
  }
}
