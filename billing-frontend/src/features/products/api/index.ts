import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  Product,
  ProductType,
  CreateProductInput,
  UpdateProductInput,
  QueryProductParams,
} from "../types";

export async function getProducts(params?: QueryProductParams): Promise<Product[]> {
  const response = await api.get<ApiResponse<Product[]>>("/products", { params });
  return response.data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
}

export async function createProduct(dto: CreateProductInput): Promise<Product> {
  const response = await api.post<ApiResponse<Product>>("/products", dto);
  return response.data.data;
}

export async function updateProduct(id: string, dto: UpdateProductInput): Promise<Product> {
  const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, dto);
  return response.data.data;
}

export async function toggleProductActive(id: string): Promise<Product> {
  const response = await api.patch<ApiResponse<Product>>(`/products/${id}/toggle-active`);
  return response.data.data;
}

export async function getProductTypes(): Promise<ProductType[]> {
  const response = await api.get<ApiResponse<ProductType[]>>("/products/types");
  return response.data.data;
}

export async function createProductType(name: string): Promise<ProductType> {
  const response = await api.post<ApiResponse<ProductType>>("/products/types", { name });
  return response.data.data;
}
