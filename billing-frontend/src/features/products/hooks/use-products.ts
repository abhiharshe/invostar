import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductActive,
  getProductTypes,
  createProductType,
} from "../api";
import { CreateProductInput, UpdateProductInput, QueryProductParams } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: QueryProductParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  types: () => [...productKeys.all, "types"] as const,
};

export function useProducts(params?: QueryProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });
}

export function useProductTypes() {
  return useQuery({
    queryKey: productKeys.types(),
    queryFn: getProductTypes,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductInput) => createProduct(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(`Product "${data.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create product.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: UpdateProductInput) => updateProduct(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success(`Product "${data.name}" updated successfully!`);
      router.push("/products");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update product.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useToggleProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleProductActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) });
      toast.success(
        `Product "${data.name}" is now ${data.isActive ? "Active" : "Inactive"}`
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to toggle product status.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createProductType(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.types() });
      toast.success(`Product Type "${data.name}" added successfully!`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add product type.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}
