"use client";

import { use } from "react";
import { usePurchase, useUpdatePurchase } from "@/features/purchases/hooks/use-purchases";
import { PurchaseForm } from "@/features/purchases/components/forms/purchase-form";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdatePurchaseInput } from "@/features/purchases/types";

export default function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: purchase, isLoading } = usePurchase(id);
  const { mutate: updatePurchase, isPending } = useUpdatePurchase(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
        <Skeleton className="h-80 w-full rounded-none" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="py-12 text-center text-xs text-neutral-500">
        Purchase bill not found or has been removed.
      </div>
    );
  }

  const handleSubmit = (values: UpdatePurchaseInput) => {
    updatePurchase(values);
  };

  return (
    <PurchaseForm
      initialData={purchase}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
