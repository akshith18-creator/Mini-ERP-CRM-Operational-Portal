import { UsersRepository } from './users.repository';
import { Role } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export class UsersService {
  static async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
  }) {
    const { total, users } = await UsersRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      users,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  static async getUserById(id: string) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async updateUser(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    await this.getUserById(id);
    return UsersRepository.updateUser(id, data);
  }
}
