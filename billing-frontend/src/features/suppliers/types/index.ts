export interface AddressDetails {
  line1?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Supplier {
  id: string;
  name: string;
  mobile?: string | null;
  billingAddress?: AddressDetails | null;
  deliveryAddress?: AddressDetails | null;
  address?: string | null;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  purchases?: {
    id: string;
    purchaseDate: string;
    totalAmount: number;
    status: string;
  }[];
  payments?: {
    id: string;
    paymentDate: string;
    amount: number;
    paymentMode: string;
  }[];
  _count?: {
    purchases: number;
    payments: number;
  };
}

export interface CreateSupplierInput {
  name: string;
  mobile?: string;
  billingAddress?: AddressDetails;
  deliveryAddress?: AddressDetails;
  address?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface QuerySupplierParams {
  search?: string;
  isActive?: boolean;
}
