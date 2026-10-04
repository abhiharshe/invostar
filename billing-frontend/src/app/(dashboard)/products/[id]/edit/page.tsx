"use client";

import { use } from "react";
import { useProduct, useUpdateProduct } from "@/features/products/hooks/use-products";
import { ProductForm, ProductFormValues } from "@/features/products/components/forms/product-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-neutral-500">
        Product not found or has been deleted.
      </div>
    );
  }

  const handleSubmit = (values: ProductFormValues) => {
    updateProduct(values);
  };

  return (
    <ProductForm
      title={`Edit Product: ${product.name}`}
      initialData={product}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isCreateMode={false}
    />
  );
}
