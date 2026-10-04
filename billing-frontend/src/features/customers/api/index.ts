import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  QueryCustomerParams,
} from "../types";

export async function getCustomers(params?: QueryCustomerParams): Promise<Customer[]> {
  const response = await api.get<ApiResponse<Customer[]>>("/customers", { params });
  return response.data.data;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
  return response.data.data;
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  const response = await api.post<ApiResponse<Customer>>("/customers", data);
  return response.data.data;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerInput
): Promise<Customer> {
  const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
  return response.data.data;
}

export async function toggleCustomerActive(id: string): Promise<Customer> {
  const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}/toggle-active`);
  return response.data.data;
}
