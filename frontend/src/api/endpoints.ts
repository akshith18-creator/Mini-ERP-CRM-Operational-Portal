import api from './client';
import {
  ApiResponse,
  User,
  Customer,
  FollowUp,
  Product,
  InventoryMovement,
  SalesChallan,
  DashboardStats,
  CustomerType,
  CustomerStatus,
  MovementType,
  ChallanStatus,
  Role,
} from '../types';

export const authApi = {
  login: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),
  register: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
};

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: Role }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.patch<ApiResponse<User>>(`/users/${id}`, data),
};

export const customersApi = {
  getCustomers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: CustomerType;
    status?: CustomerStatus;
  }) => api.get<ApiResponse<Customer[]>>('/customers', { params }),
  getCustomerById: (id: string) => api.get<ApiResponse<Customer>>(`/customers/${id}`),
  createCustomer: (data: any) => api.post<ApiResponse<Customer>>('/customers', data),
  updateCustomer: (id: string, data: any) => api.patch<ApiResponse<Customer>>(`/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete<ApiResponse<null>>(`/customers/${id}`),
};

export const followUpsApi = {
  getByCustomer: (customerId: string) =>
    api.get<ApiResponse<FollowUp[]>>(`/followups/customer/${customerId}`),
  createFollowUp: (data: any) => api.post<ApiResponse<FollowUp>>('/followups', data),
  updateFollowUp: (id: string, data: any) => api.patch<ApiResponse<FollowUp>>(`/followups/${id}`, data),
  deleteFollowUp: (id: string) => api.delete<ApiResponse<null>>(`/followups/${id}`),
};

export const productsApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) => api.get<ApiResponse<Product[]>>('/products', { params }),
  getProductById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),
  createProduct: (data: any) => api.post<ApiResponse<Product>>('/products', data),
  updateProduct: (id: string, data: any) => api.patch<ApiResponse<Product>>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<ApiResponse<null>>(`/products/${id}`),
  getCategories: () => api.get<ApiResponse<string[]>>('/products/categories'),
};

export const inventoryApi = {
  getMovements: (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    movementType?: MovementType;
  }) => api.get<ApiResponse<InventoryMovement[]>>('/inventory', { params }),
  recordMovement: (data: any) => api.post<ApiResponse<{ movement: InventoryMovement; updatedStock: number }>>('/inventory', data),
};

export const salesApi = {
  getChallans: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) => api.get<ApiResponse<SalesChallan[]>>('/sales', { params }),
  getChallanById: (id: string) => api.get<ApiResponse<SalesChallan>>(`/sales/${id}`),
  createChallan: (data: any) => api.post<ApiResponse<SalesChallan>>('/sales', data),
  updateStatus: (id: string, status: ChallanStatus) =>
    api.patch<ApiResponse<SalesChallan>>(`/sales/${id}/status`, { status }),
};

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
