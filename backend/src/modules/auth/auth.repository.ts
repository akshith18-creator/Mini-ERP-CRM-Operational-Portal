import { prisma } from '../../config/prisma';
import { RegisterInput } from './auth.validation';

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }

  static async createUser(data: RegisterInput & { password: string }) {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }
}
