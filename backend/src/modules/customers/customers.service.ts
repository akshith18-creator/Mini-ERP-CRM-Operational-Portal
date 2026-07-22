import { CustomersRepository } from './customers.repository';
import { CustomerType, CustomerStatus } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.validation';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class CustomersService {
  static async getCustomers(params: {
    page: number;
    limit: number;
    search?: string;
    type?: CustomerType;
    status?: CustomerStatus;
  }) {
    const { total, customers } = await CustomersRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      customers,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await CustomersRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customer;
  }

  static async createCustomer(data: CreateCustomerInput, createdById: string) {
    const existing = await CustomersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A customer with this email already exists');
    }
    return CustomersRepository.create({ ...data, createdById });
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput) {
    await this.getCustomerById(id);

    if (data.email) {
      const existing = await CustomersRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('A customer with this email already exists');
      }
    }

    return CustomersRepository.update(id, data);
  }

  static async deleteCustomer(id: string) {
    await this.getCustomerById(id);
    return CustomersRepository.delete(id);
  }
}
