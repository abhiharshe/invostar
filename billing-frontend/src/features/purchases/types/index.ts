export type DocumentStatus =
  | "DRAFT"
  | "QUOTATION"
  | "CONVERTED"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOIDED";

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  rate: number;
  taxPercentage: number;
  taxAmount: number;
  amount: number;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  purchaseId: string | null;
  amount: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  billNumber: string;
  purchaseDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: DocumentStatus;
  remarks?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  voidedAt?: string | null;
  voidedReason?: string | null;
  deletedAt?: string | null;
  supplier: {
    id: string;
    name: string;
    mobile?: string | null;
  };
  createdBy: {
    id: string;
    name: string;
  };
  items: PurchaseItem[];
  paymentAllocations: PaymentAllocation[];
}

export interface QueryPurchaseParams {
  search?: string;
  supplierId?: string;
  status?: DocumentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  rate?: number;
  taxPercentage?: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  billNumber?: string;
  purchaseDate: string;
  remarks?: string;
  items?: CreatePurchaseItemInput[];
}

export interface UpdatePurchaseInput extends Partial<CreatePurchaseInput> {}

