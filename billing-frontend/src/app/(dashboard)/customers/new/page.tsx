"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerForm } from "@/features/customers/components/forms/customer-form";
import { useCreateCustomer } from "@/features/customers/hooks/use-customers";
import { CreateCustomerInput } from "@/features/customers/types";
import { toast } from "sonner";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  const { mutate: createCustomer, isPending } = useCreateCustomer();

  const handleSubmit = (values: CreateCustomerInput, action: "save" | "saveAndCreateNew") => {
    createCustomer(values, {
      onSuccess: () => {
        if (action === "save") {
          router.push("/customers");
        } else {
          setFormKey((prev) => prev + 1);
          toast.info("Form reset. Enter the next customer details.");
        }
      },
    });
  };

  return (
    <CustomerForm
      key={formKey}
      title="Create New Customer"
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isCreateMode={true}
    />
  );
}
