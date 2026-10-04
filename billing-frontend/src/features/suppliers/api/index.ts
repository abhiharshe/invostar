import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  QuerySupplierParams,
} from "../types";

export async function getSuppliers(params?: QuerySupplierParams): Promise<Supplier[]> {
  const response = await api.get<ApiResponse<Supplier[]>>("/suppliers", { params });
  return response.data.data;
}

export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  return response.data.data;
}

export async function createSupplier(data: CreateSupplierInput): Promise<Supplier> {
  const response = await api.post<ApiResponse<Supplier>>("/suppliers", data);
  return response.data.data;
}

export async function updateSupplier(
  id: string,
  data: UpdateSupplierInput
): Promise<Supplier> {
  const response = await api.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
  return response.data.data;
}

export async function toggleSupplierActive(id: string): Promise<Supplier> {
  const response = await api.patch<ApiResponse<Supplier>>(`/suppliers/${id}/toggle-active`);
  return response.data.data;
}
