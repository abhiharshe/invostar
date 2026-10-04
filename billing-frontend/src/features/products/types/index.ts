export enum ProductCategory {
  PHYSICAL_GOODS = "PHYSICAL_GOODS",
  DIGITAL_GOODS = "DIGITAL_GOODS",
  SERVICES = "SERVICES",
  LABOR = "LABOR",
}

export interface ProductType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleItem {
  id?: string;
  bundleProductId?: string;
  productId: string;
  quantity: number;
  rate?: number;
  product?: Product;
}

export interface Product {
  id: string;
  productTypeId: string;
  name: string;
  unit: string;
  rate: number;
  taxPercentage: number;
  category: ProductCategory;
  isBundle: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productType?: ProductType;
  bundleItems?: BundleItem[];
}

export interface CreateProductInput {
  productTypeId: string;
  name: string;
  unit: string;
  rate: number;
  taxPercentage?: number;
  category?: ProductCategory;
  isBundle?: boolean;
  isActive?: boolean;
  bundleItems?: { productId: string; quantity: number; rate?: number }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> { }

export interface QueryProductParams {
  search?: string;
  productTypeId?: string;
  category?: ProductCategory;
  isBundle?: boolean;
  isActive?: boolean;
}
