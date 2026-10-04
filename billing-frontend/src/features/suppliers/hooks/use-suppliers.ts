import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  toggleSupplierActive,
} from "../api";
import { CreateSupplierInput, UpdateSupplierInput, QuerySupplierParams } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: QuerySupplierParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export function useSuppliers(params?: QuerySupplierParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => getSuppliers(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => getSupplierById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSupplierInput) => createSupplier(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success(`Supplier "${data.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create supplier.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: UpdateSupplierInput) => updateSupplier(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      toast.success(`Supplier "${data.name}" updated successfully!`);
      router.push("/suppliers");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update supplier.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useToggleSupplierActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleSupplierActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(data.id) });
      toast.success(
        `Supplier "${data.name}" marked as ${data.isActive ? "Active" : "Inactive"}.`
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update supplier status.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}
