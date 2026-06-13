
export type UserRole = 'ADMIN' | 'SALES' | 'PURCHASE' | 'MFG' | 'INVENTORY' | 'OWNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export type ProcurementType = 'MTS' | 'MTO';
export type SupplyMethod = 'MANUFACTURE' | 'PURCHASE';

export interface Product {
  id: string;
  name: string;
  salesPrice: number;
  costPrice: number;
  qtyOnHand: number;
  qtyReserved: number;
  procurementType: ProcurementType;
  supplyMethod: SupplyMethod;
  vendorId?: string | null;
  bomId?: string | null;
  vendor?: Vendor | null;
}

export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderLine {
  id: string;
  salesOrderId: string;
  productId: string;
  quantity: number;
  deliveredQty: number;
  price: number;
  product?: Product;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  customerAddress?: string | null;
  salesPersonId?: string | null;
  status: SalesOrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderLines: SalesOrderLine[];
  salesPerson?: User | null;
}

export type PurchaseOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED';

export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  receivedQty: number;
  price: number;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  vendorId?: string | null;
  vendorName: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderLines: PurchaseOrderLine[];
}

export interface BoMLine {
  id: string;
  bomId: string;
  componentId: string;
  quantity: number;
  component?: Product;
}

export interface WorkCenter {
  id: string;
  name: string;
}

export interface Operation {
  id: string;
  name: string;
  duration: number;
  workCenterId: string;
  bomId?: string | null;
  workCenter?: WorkCenter;
}

export interface BoM {
  id: string;
  productId: string;
  name: string;
  product?: Product;
  bomLines: BoMLine[];
  operations?: Operation[];
}

export type MOStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface WorkOrder {
  id: string;
  moId: string;
  operationId?: string | null;
  operationName?: string | null;
  workCenterId?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  expectedDuration: number;
  realDuration: number;
  operation?: Operation | null;
  workCenter?: WorkCenter | null;
}

export interface MOComponent {
  id: string;
  moId: string;
  productId: string;
  toConsume: number;
  consumed: number;
  product?: Product;
}

export interface ManufacturingOrder {
  id: string;
  productId: string;
  quantity: number;
  status: MOStatus;
  bomId: string;
  assigneeId?: string | null;
  createdAt: string;
  product?: Product;
  bom?: BoM;
  WorkOrders: WorkOrder[];
  components: MOComponent[];
  assignee?: User | null;
}

export interface StockLedger {
  id: string;
  productId: string;
  quantityChange: number;
  type: string;
  referenceId: string;
  createdAt: string;
  product?: Product;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
  user?: User;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}
