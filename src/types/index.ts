export type UserRole =
  | "admin"
  | "sales"
  | "warehouse"
  | "accountant"
  | "technician"
  | "delivery";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "rejected";

export type MaintenanceStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  locale: string;
  is_active: boolean;
}

export interface ProductListItem {
  id: string;
  slug: string;
  condition: "new" | "used";
  price_usd: string;
  stock_qty: number;
  is_featured: boolean;
  name: string;
  primaryImageUrl: string | null;
  brand: { id: string; slug: string; name: string } | null;
  category: { id: string; slug: string; name: string } | null;
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductAttribute {
  key: string;
  label: string;
  type: string;
  value: string;
}

export interface ProductDetail extends ProductListItem {
  stock_min: number;
  is_active: boolean;
  description: string | null;
  condition_report: string | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
  brand: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
  category: {
    id: string;
    slug: string;
    name: string;
    parent_id: string | null;
  } | null;
}

export interface OrderItem {
  id: string;
  product_name_snapshot: string;
  product_price_snapshot: string;
  quantity: number;
  total_usd: string;
}

export interface StatusLog {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  user: { first_name: string; last_name: string } | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_detail: string;
  notes: string | null;
  locale: string;
  status: OrderStatus;
  subtotal_usd: string;
  delivery_fee_usd: string;
  total_usd: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  governorate: { id: string; name: string; name_local: string | null };
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  items: OrderItem[];
  statusLogs: StatusLog[];
  invoice: {
    id: string;
    invoice_number: string;
    pdf_url: string;
  } | null;
}

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: string;
  description: string;
  images: string[];
  locale: string;
  status: MaintenanceStatus;
  visit_type: "home" | "office";
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  technician: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  statusLogs: StatusLog[];
}

export interface InventoryLog {
  id: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
  product: { id: string; slug: string; name: string };
  user: { first_name: string; last_name: string } | null;
}

export interface Governorate {
  id: string;
  name: string;
  name_local: string | null;
  delivery_fee_usd: string;
}

export interface Category {
  id: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  name: string;
  description: string | null;
  children: Category[];
}

export interface Brand {
  id: string;
  slug: string;
  logoUrl: string | null;
  name: string;
  description: string | null;
}

export interface Setting {
  key: string;
  value: string;
}

export interface SalesSummary {
  totalRevenue: string;
  totalOrders: number;
  avgOrderValue: string;
  deliveredOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
}

export interface DailyRevenue {
  date: string;
  revenue: string;
  orderCount: number;
}

export interface TopProduct {
  name: string;
  totalQuantitySold: number;
  totalRevenue: string;
}

export interface InventorySnapshot {
  id: string;
  name: string;
  category: string;
  stock_qty: number;
  stock_min: number;
  status: "ok" | "low" | "out";
}

export interface MaintenanceSummaryReport {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: string;
  byTechnician: {
    technicianId: string;
    technicianName: string;
    assigned: number;
    completed: number;
  }[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  pdf_url: string;
  created_at: string;
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    total_usd: string;
  };
}

export interface AttributeDefinition {
  id: string;
  key: string;
  type: string;
  is_required: boolean;
  sort_order: number;
  label: string;
}

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  condition?: "new" | "used";
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: "price" | "createdAt";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InventoryLogFilters {
  productId?: string;
  type?: "in" | "out" | "adjustment";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdjustStockDto {
  quantity: number;
  type: "in" | "adjustment";
  reason: "restock" | "damage" | "return" | "initial";
  note?: string;
}

export interface UpsertTranslationDto {
  locale: string;
  name: string;
  description?: string;
}

export interface UpsertProductTranslationDto {
  locale: string;
  name: string;
  description?: string;
  condition_report?: string;
}

export interface SetAttributeValuesDto {
  values: { attributeDefinitionId: string; value: string }[];
}

export interface CreateProductDto {
  condition: "new" | "used";
  price_usd: string;
  stock_qty: number;
  stock_min?: number;
  is_featured?: boolean;
  categoryId?: string;
  brandId?: string;
  translations: UpsertProductTranslationDto[];
}
