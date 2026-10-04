"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm, ProductFormValues } from "@/features/products/components/forms/product-form";
import { useCreateProduct } from "@/features/products/hooks/use-products";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleSubmit = (values: ProductFormValues, action: "save" | "saveAndCreateNew") => {
    createProduct(values, {
      onSuccess: () => {
        if (action === "save") {
          router.push("/products");
        } else {
          setFormKey((prev) => prev + 1);
          toast.info("Form reset. Enter the next product details.");
        }
      },
    });
  };

  return (
    <ProductForm
      key={formKey}
      title="Create New Product"
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isCreateMode={true}
    />
  );
}
