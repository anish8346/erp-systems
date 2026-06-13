
export type UserRole = 'ADMIN' | 'SALES' | 'PURCHASE' | 'MFG' | 'INVENTORY' | 'OWNER';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProcurementType = 'MTS' | 'MTO';
export type SupplyMethod = 'MANUFACTURE' | 'PURCHASE';

export interface CreateProductData {
  name: string;
  salesPrice: number;
  costPrice: number;
  procurementType: ProcurementType;
  supplyMethod: SupplyMethod;
  vendorId?: string | null;
  bomId?: string | null;
  qtyOnHand?: number;
}

export interface UpdateProductData {
  name?: string;
  salesPrice?: number;
  costPrice?: number;
  procurementType?: ProcurementType;
  supplyMethod?: SupplyMethod;
  vendorId?: string | null;
}

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
  createdAt: Date;
  updatedAt: Date;
  vendor?: Vendor | null;
}

export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrder {
  id: string;
  customerName: string;
  customerAddress?: string | null;
  salesPersonId?: string | null;
  status: SalesOrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  orderLines?: SalesOrderLine[];
  salesPerson?: User | null;
}

export interface CreateSalesOrderLine {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateSalesOrderData {
  customerName: string;
  customerAddress?: string;
  salesPersonId?: string;
  orderLines: CreateSalesOrderLine[];
}

export interface DeliverItem {
  lineId: string;
  quantity: number;
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
  createdAt: Date;
  updatedAt: Date;
  orderLines?: PurchaseOrderLine[];
  vendor?: Vendor | null;
}

export interface BoMLine {
  id: string;
  bomId: string;
  componentId: string;
  quantity: number;
  component?: Product;
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
  bomLines?: BoMLine[];
  operations?: Operation[];
}

export interface WorkCenter {
  id: string;
  name: string;
}

export type MOStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface MOComponentData {
  productId: string;
  toConsume: number;
  consumed?: number;
}

export interface MOWorkOrderData {
  operationId?: string;
  operationName?: string;
  workCenterId: string;
  expectedDuration: number;
  realDuration?: number;
}

export interface CreateMOData {
  productId: string;
  quantity: number;
  status: MOStatus;
  bomId: string;
  assigneeId?: string;
  components?: MOComponentData[];
  workOrders?: MOWorkOrderData[];
}

export interface ManufacturingOrder {
  id: string;
  productId: string;
  quantity: number;
  status: MOStatus;
  bomId: string;
  assigneeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  bom?: BoM;
  WorkOrders?: WorkOrder[];
  components?: MOComponent[];
  assignee?: User | null;
}

export interface MOComponent {
  id: string;
  moId: string;
  productId: string;
  toConsume: number;
  consumed: number;
  product?: Product;
}

export type WOStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface WorkOrder {
  id: string;
  moId: string;
  operationId?: string | null;
  operationName?: string | null;
  workCenterId?: string | null;
  status: WOStatus;
  expectedDuration: number;
  realDuration: number;
  operation?: Operation | null;
  workCenter?: WorkCenter | null;
}

export type StockLedgerType = 'INITIAL' | 'SALE' | 'PURCHASE' | 'MFG_CONSUME' | 'MFG_PRODUCE' | 'ADJUSTMENT';

export interface StockLedger {
  id: string;
  productId: string;
  quantityChange: number;
  type: StockLedgerType;
  referenceId: string;
  createdAt: Date;
  product?: Product;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: Date;
  user?: User;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}
