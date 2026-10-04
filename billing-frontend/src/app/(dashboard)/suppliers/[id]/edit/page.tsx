"use client";

import { use } from "react";
import { useSupplier, useUpdateSupplier } from "@/features/suppliers/hooks/use-suppliers";
import { SupplierForm } from "@/features/suppliers/components/forms/supplier-form";
import { UpdateSupplierInput } from "@/features/suppliers/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: supplier, isLoading } = useSupplier(id);
  const { mutate: updateSupplier, isPending } = useUpdateSupplier(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-8 w-56 rounded" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="py-12 text-center text-neutral-500">
        Supplier not found or has been removed.
      </div>
    );
  }

  const handleSubmit = (values: UpdateSupplierInput) => {
    updateSupplier(values);
  };

  return (
    <SupplierForm
      initialData={supplier}
      title={`Edit Supplier — ${supplier.name}`}
      onSubmit={(values) => handleSubmit(values)}
      isSubmitting={isPending}
      isCreateMode={false}
    />
  );
}
