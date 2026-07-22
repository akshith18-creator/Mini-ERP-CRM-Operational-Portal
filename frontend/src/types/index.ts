export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  type: CustomerType;
  status: CustomerStatus;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  _count?: { followUps: number; salesChallans: number };
  followUps?: FollowUp[];
  salesChallans?: SalesChallan[];
}

export interface FollowUp {
  id: string;
  customerId: string;
  notes: string;
  followUpDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string; category?: string };
  movementType: MovementType;
  quantity: number;
  reason: string;
  referenceNumber?: string;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string };
  createdAt: string;
}

export interface SalesItem {
  id: string;
  challanId: string;
  productId: string;
  product?: { id: string; name: string; sku: string; stockQuantity: number };
  skuSnapshot: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: { id: string; name: string; company?: string; email?: string; phone?: string; address?: string };
  status: ChallanStatus;
  totalAmount: number;
  notes?: string;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string };
  confirmedById?: string;
  confirmedBy?: { id: string; name: string; email?: string };
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: SalesItem[];
  _count?: { items: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface DashboardStats {
  customers: {
    total: number;
    leads: number;
    active: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  sales: {
    confirmedCount: number;
    draftCount: number;
    totalRevenue: number;
  };
  recentMovements: InventoryMovement[];
  recentChallans: SalesChallan[];
}
