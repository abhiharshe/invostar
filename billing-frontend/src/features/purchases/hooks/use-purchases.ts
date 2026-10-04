import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase } from "../api";
import { CreatePurchaseInput, UpdatePurchaseInput, QueryPurchaseParams } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const purchaseKeys = {
  all: ["purchases"] as const,
  lists: () => [...purchaseKeys.all, "list"] as const,
  list: (params?: QueryPurchaseParams) => [...purchaseKeys.lists(), params] as const,
  details: () => [...purchaseKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
};

export function usePurchases(params?: QueryPurchaseParams) {
  return useQuery({
    queryKey: purchaseKeys.list(params),
    queryFn: () => getPurchases(params),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchaseById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseInput) => createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create purchase.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useUpdatePurchase(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdatePurchaseInput) => updatePurchase(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      toast.success(`Purchase bill "${data.billNumber}" updated successfully!`);
      router.push("/purchases");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update purchase.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      toast.success(`Purchase bill "${data.billNumber}" deleted successfully.`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete purchase.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}
