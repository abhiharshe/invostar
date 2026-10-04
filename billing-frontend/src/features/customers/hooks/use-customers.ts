import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
} from "../api";
import { CreateCustomerInput, UpdateCustomerInput, QueryCustomerParams } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params?: QueryCustomerParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params?: QueryCustomerParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomers(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCustomerInput) => createCustomer(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success(`Customer "${data.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create customer.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: UpdateCustomerInput) => updateCustomer(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      toast.success(`Customer "${data.name}" updated successfully!`);
      router.push("/customers");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update customer.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useToggleCustomerActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleCustomerActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(data.id) });
      toast.success(
        `Customer "${data.name}" marked as ${data.isActive ? "Active" : "Inactive"}.`
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update customer status.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}
