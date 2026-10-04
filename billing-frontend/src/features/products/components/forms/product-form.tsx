"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductTypes,
  useCreateProductType,
  useProducts,
} from "@/features/products/hooks/use-products";
import { ProductCategory, Product } from "@/features/products/types";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  productTypeId: z.string().min(1, "Product type is required"),
  unit: z.string().min(1, "Unit of measurement is required (e.g. pcs, kg, hrs)"),
  rate: z.number().min(0, "Rate must be non-negative"),
  taxPercentage: z.number().min(0, "Tax percentage must be at least 0").max(100, "Tax cannot exceed 100%"),
  category: z.nativeEnum(ProductCategory),
  isBundle: z.boolean(),
  isActive: z.boolean(),
  bundleItems: z
    .array(
      z.object({
        productId: z.string().min(1, "Select a product"),
        quantity: z.number().min(0.001, "Quantity must be greater than 0"),
        rate: z.number().optional(),
      })
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (values: ProductFormValues, action: "save" | "saveAndCreateNew") => void;
  isSubmitting: boolean;
  title: string;
  isCreateMode?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
  isCreateMode = !initialData,
}: ProductFormProps) {
  const { data: productTypes, isLoading: typesLoading } = useProductTypes();
  const { data: existingProducts } = useProducts({ isBundle: false });
  const { mutate: addType, isPending: addingType } = useCreateProductType();

  const [newTypeName, setNewTypeName] = useState("");
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [submitAction, setSubmitAction] = useState<"save" | "saveAndCreateNew">("save");

  const productTypeItems = useMemo(
    () =>
      productTypes?.map((type) => ({
        label: type.name,
        value: type.id,
      })) ?? [],
    [productTypes]
  );

  const categoryItems = useMemo(
    () => [
      { label: "Physical Goods", value: ProductCategory.PHYSICAL_GOODS },
      { label: "Digital Goods", value: ProductCategory.DIGITAL_GOODS },
      { label: "Services", value: ProductCategory.SERVICES },
      { label: "Labor", value: ProductCategory.LABOR },
    ],
    []
  );

  const childProductItems = useMemo(
    () =>
      existingProducts
        ?.filter((p) => p.id !== initialData?.id)
        .map((p) => ({
          label: `${p.name} (${p.unit}) - $${Number(p.rate)}`,
          value: p.id,
        })) ?? [],
    [existingProducts, initialData?.id]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        productTypeId: initialData.productTypeId,
        unit: initialData.unit,
        rate: Number(initialData.rate),
        taxPercentage: Number(initialData.taxPercentage),
        category: initialData.category,
        isBundle: initialData.isBundle,
        isActive: initialData.isActive,
        bundleItems: initialData.bundleItems?.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          rate: item.rate ? Number(item.rate) : undefined,
        })),
      }
      : {
        name: "",
        productTypeId: "",
        unit: "pcs",
        rate: 0,
        taxPercentage: 0,
        category: ProductCategory.PHYSICAL_GOODS,
        isBundle: false,
        isActive: true,
        bundleItems: [],
      },
  });

  const isBundle = watch("isBundle");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bundleItems",
  });

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    addType(newTypeName.trim(), {
      onSuccess: () => {
        setNewTypeName("");
        setShowAddTypeModal(false);
      },
    });
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    const formattedData = {
      ...data,
      bundleItems: data.isBundle
        ? data.bundleItems?.filter((item) => Boolean(item.productId))
        : undefined,
    };
    onSubmit(formattedData, submitAction);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Core Product Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Wireless Ergonomic Mouse"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Product Type Dropdown + Add Type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-0 p-0">
                  <Label htmlFor="productTypeId">
                    Product Type <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className="cursor-pointer text-[0.7rem] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-600 hover:underline"
                    onClick={() => setShowAddTypeModal(true)}
                  >
                    + Add New Type
                  </span>
                </div>
                <Controller
                  name="productTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={productTypeItems}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Product Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {typesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading types...
                            </SelectItem>
                          ) : (
                            productTypeItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productTypeId && (
                  <p className="text-xs text-destructive">
                    {errors.productTypeId.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={categoryItems}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categoryItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <Label htmlFor="unit">
                  Unit of Measurement <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  {...register("unit")}
                  placeholder="pcs, kg, box, hrs"
                />
                {errors.unit && (
                  <p className="text-xs text-destructive">{errors.unit.message}</p>
                )}
              </div>

              {/* Rate */}
              <div className="space-y-1.5">
                <Label htmlFor="rate">
                  Rate / Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  {...register("rate", { valueAsNumber: true })}
                />
                {errors.rate && (
                  <p className="text-xs text-destructive">{errors.rate.message}</p>
                )}
              </div>

              {/* Tax Percentage */}
              <div className="space-y-1.5">
                <Label htmlFor="taxPercentage">Tax (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  step="0.01"
                  {...register("taxPercentage", { valueAsNumber: true })}
                />
                {errors.taxPercentage && (
                  <p className="text-xs text-destructive">
                    {errors.taxPercentage.message}
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox options */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Controller
                name="isBundle"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBundle"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isBundle" className="cursor-pointer">
                      Is Bundle &amp; Package Product
                    </Label>
                  </div>
                )}
              />

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active Product
                    </Label>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bundle Items Builder (Shown if isBundle is true) */}
        {isBundle && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Bundle Items Included
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1 })}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Bundle Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-500">
                  No items added yet. Click &quot;Add Bundle Item&quot; to bundle individual products together.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/50"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <Controller
                          name={`bundleItems.${index}.productId` as const}
                          control={control}
                          render={({ field: selectField }) => (
                            <Select
                              items={childProductItems}
                              value={selectField.value}
                              onValueChange={(val) => selectField.onChange(val ?? "")}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Child Product" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {childProductItems.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="w-28">
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Qty"
                          {...register(
                            `bundleItems.${index}.quantity` as const,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-neutral-400 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Actions as per AGENTS.md rules */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/products">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          {isCreateMode && (
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="outline"
              onClick={() => setSubmitAction("saveAndCreateNew")}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              {isSubmitting && submitAction === "saveAndCreateNew" ? "Saving..." : "Save & Create New"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitAction("save")}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {isSubmitting && submitAction === "save" ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>

      {/* ShadCN Dialog Modal for Creating Product Type */}
      <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="newTypeName">Product Type Name</Label>
              <Input
                id="newTypeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. Electronics, Hardware, Labor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddTypeModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={addingType || !newTypeName.trim()}
              onClick={handleAddType}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {addingType ? "Adding..." : "Add Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
