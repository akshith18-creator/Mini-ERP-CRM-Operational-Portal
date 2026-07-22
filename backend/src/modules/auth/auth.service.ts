import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginInput, RegisterInput } from './auth.validation';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { env } from '../../config/env';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await AuthRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.email, user.role, user.name);

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await AuthRepository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive. Please contact system admin.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.name);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async getCurrentUser(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private static generateToken(userId: string, email: string, role: string, name: string): string {
    return jwt.sign({ userId, email, role, name }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }
}
