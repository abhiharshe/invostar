"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SupplierForm } from "@/features/suppliers/components/forms/supplier-form";
import { useCreateSupplier } from "@/features/suppliers/hooks/use-suppliers";
import { CreateSupplierInput } from "@/features/suppliers/types";
import { toast } from "sonner";

export default function CreateSupplierPage() {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  const { mutate: createSupplier, isPending } = useCreateSupplier();

  const handleSubmit = (
    values: CreateSupplierInput,
    action: "save" | "saveAndCreateNew"
  ) => {
    createSupplier(values, {
      onSuccess: () => {
        if (action === "save") {
          router.push("/suppliers");
        } else {
          setFormKey((prev) => prev + 1);
          toast.info("Form reset. Enter the next supplier details.");
        }
      },
    });
  };

  return (
    <SupplierForm
      key={formKey}
      title="Create New Supplier"
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isCreateMode={true}
    />
  );
}
