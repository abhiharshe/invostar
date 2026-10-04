import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { Purchase, QueryPurchaseParams, CreatePurchaseInput, UpdatePurchaseInput } from "../types";

export async function getPurchases(params?: QueryPurchaseParams): Promise<Purchase[]> {
  const response = await api.get<ApiResponse<Purchase[]>>("/purchases", { params });
  return response.data.data;
}

export async function getPurchaseById(id: string): Promise<Purchase> {
  const response = await api.get<ApiResponse<Purchase>>(`/purchases/${id}`);
  return response.data.data;
}

export async function createPurchase(data: CreatePurchaseInput): Promise<Purchase> {
  const response = await api.post<ApiResponse<Purchase>>("/purchases", data);
  return response.data.data;
}

export async function updatePurchase(
  id: string,
  data: UpdatePurchaseInput
): Promise<Purchase> {
  const response = await api.patch<ApiResponse<Purchase>>(`/purchases/${id}`, data);
  return response.data.data;
}

export async function deletePurchase(id: string): Promise<Purchase> {
  const response = await api.delete<ApiResponse<Purchase>>(`/purchases/${id}`);
  return response.data.data;
}
