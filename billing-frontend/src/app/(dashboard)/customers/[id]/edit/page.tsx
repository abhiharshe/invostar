"use client";

import { use } from "react";
import { useCustomer, useUpdateCustomer } from "@/features/customers/hooks/use-customers";
import { CustomerForm } from "@/features/customers/components/forms/customer-form";
import { CreateCustomerInput } from "@/features/customers/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customer, isLoading } = useCustomer(id);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer(id);

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

  if (!customer) {
    return (
      <div className="py-12 text-center text-neutral-500">
        Customer not found or has been removed.
      </div>
    );
  }

  const handleSubmit = (values: CreateCustomerInput) => {
    updateCustomer(values);
  };

  return (
    <CustomerForm
      title={`Edit Customer: ${customer.name}`}
      initialData={customer}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isCreateMode={false}
    />
  );
}
