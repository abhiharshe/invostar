export interface AddressDetails {
  line1?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile?: string | null;
  gstin?: string | null;
  billingAddress?: AddressDetails | null;
  shippingAddress?: AddressDetails | null;
  address?: string | null;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sales?: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    status: string;
  }[];
  payments?: {
    id: string;
    paymentDate: string;
    amount: number;
    paymentMode: string;
  }[];
}

export interface CreateCustomerInput {
  name: string;
  mobile?: string;
  gstin?: string;
  billingAddress?: AddressDetails;
  shippingAddress?: AddressDetails;
  address?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface QueryCustomerParams {
  search?: string;
  isActive?: boolean;
}
