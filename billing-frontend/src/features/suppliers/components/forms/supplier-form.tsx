"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Supplier, CreateSupplierInput } from "@/features/suppliers/types";
import { INDIAN_STATES } from "@/lib/gst-utils";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const addressSchema = z.object({
  line1: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required.")
    .min(2, "Supplier name must be at least 2 characters.")
    .max(100, "Supplier name cannot exceed 100 characters."),
  mobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "Mobile number must be a valid 10-digit number."
    ),
  openingBalance: z.number().min(0, "Opening balance cannot be negative."),
  isActive: z.boolean(),
  billingAddress: addressSchema,
  sameAsDelivery: z.boolean(),
  deliveryAddress: addressSchema,
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (values: CreateSupplierInput, action: "save" | "saveAndCreateNew") => void;
  isSubmitting: boolean;
  title: string;
  isCreateMode?: boolean;
}

export function SupplierForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
  isCreateMode = !initialData,
}: SupplierFormProps) {
  const [submitAction, setSubmitAction] = useState<"save" | "saveAndCreateNew">("save");

  const stateItems = useMemo(
    () => INDIAN_STATES.map((st) => ({ label: st, value: st })),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          mobile: initialData.mobile ?? "",
          openingBalance: Number(initialData.openingBalance),
          isActive: initialData.isActive,
          billingAddress: {
            line1: initialData.billingAddress?.line1 ?? "",
            locality: initialData.billingAddress?.locality ?? "",
            city: initialData.billingAddress?.city ?? "",
            state: initialData.billingAddress?.state ?? "",
            country: initialData.billingAddress?.country ?? "India",
            postalCode: initialData.billingAddress?.postalCode ?? "",
          },
          sameAsDelivery: false,
          deliveryAddress: {
            line1: initialData.deliveryAddress?.line1 ?? "",
            locality: initialData.deliveryAddress?.locality ?? "",
            city: initialData.deliveryAddress?.city ?? "",
            state: initialData.deliveryAddress?.state ?? "",
            country: initialData.deliveryAddress?.country ?? "India",
            postalCode: initialData.deliveryAddress?.postalCode ?? "",
          },
        }
      : {
          name: "",
          mobile: "",
          openingBalance: 0,
          isActive: true,
          billingAddress: {
            line1: "",
            locality: "",
            city: "",
            state: "",
            country: "India",
            postalCode: "",
          },
          sameAsDelivery: true,
          deliveryAddress: {
            line1: "",
            locality: "",
            city: "",
            state: "",
            country: "India",
            postalCode: "",
          },
        },
  });

  const sameAsDelivery = watch("sameAsDelivery");
  const billingAddress = watch("billingAddress");

  // Sync delivery address when sameAsDelivery is checked
  useEffect(() => {
    if (sameAsDelivery) {
      setValue("deliveryAddress", {
        line1: billingAddress?.line1 ?? "",
        locality: billingAddress?.locality ?? "",
        city: billingAddress?.city ?? "",
        state: billingAddress?.state ?? "",
        country: billingAddress?.country ?? "India",
        postalCode: billingAddress?.postalCode ?? "",
      });
    }
  }, [sameAsDelivery, billingAddress, setValue]);

  const handleInvalidForm = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstErrorMessage =
        formErrors[errorKeys[0]]?.message ||
        formErrors[errorKeys[0]]?.line1?.message;
      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      }
    }
  };

  const handleFormSubmit = (data: SupplierFormValues) => {
    const { sameAsDelivery: _same, ...rest } = data;
    const payload: CreateSupplierInput = {
      ...rest,
      deliveryAddress: _same ? rest.billingAddress : rest.deliveryAddress,
    };
    onSubmit(payload, submitAction);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link href="/suppliers">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Truck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit, handleInvalidForm)}
        className="space-y-6"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Supplier Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">
                  Supplier Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Global Distributors Pvt. Ltd."
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  {...register("mobile")}
                  placeholder="e.g. 9876543210"
                />
                {errors.mobile && (
                  <p className="text-xs text-destructive">{errors.mobile.message}</p>
                )}
              </div>

              {/* Opening Balance */}
              <div className="space-y-1.5">
                <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("openingBalance", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.openingBalance && (
                  <p className="text-xs text-destructive">
                    {errors.openingBalance.message}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="space-y-1.5 sm:col-span-2 flex items-center">
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
                        Active Supplier
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Billing Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="billingAddress.line1">Address Line 1</Label>
                <Input
                  id="billingAddress.line1"
                  {...register("billingAddress.line1")}
                  placeholder="Flat / Building / House No., Street"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billingAddress.locality">Area / Locality</Label>
                <Input
                  id="billingAddress.locality"
                  {...register("billingAddress.locality")}
                  placeholder="e.g. Andheri West"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billingAddress.city">City</Label>
                <Input
                  id="billingAddress.city"
                  {...register("billingAddress.city")}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billingAddress.state">State</Label>
                <Controller
                  name="billingAddress.state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {stateItems.map((item) => (
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

              <div className="space-y-1.5">
                <Label htmlFor="billingAddress.country">Country</Label>
                <Input
                  id="billingAddress.country"
                  {...register("billingAddress.country")}
                  placeholder="India"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="billingAddress.postalCode">Postal / Zip Code</Label>
                <Input
                  id="billingAddress.postalCode"
                  {...register("billingAddress.postalCode")}
                  placeholder="e.g. 400053"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Delivery Address</CardTitle>
            <Controller
              name="sameAsDelivery"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsDelivery"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="sameAsDelivery"
                    className="cursor-pointer text-xs font-normal text-neutral-600 dark:text-neutral-400"
                  >
                    Same as billing address
                  </Label>
                </div>
              )}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="deliveryAddress.line1">Address Line 1</Label>
                <Input
                  id="deliveryAddress.line1"
                  disabled={sameAsDelivery}
                  {...register("deliveryAddress.line1")}
                  placeholder="Flat / Building / House No., Street"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliveryAddress.locality">Area / Locality</Label>
                <Input
                  id="deliveryAddress.locality"
                  disabled={sameAsDelivery}
                  {...register("deliveryAddress.locality")}
                  placeholder="e.g. Andheri West"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliveryAddress.city">City</Label>
                <Input
                  id="deliveryAddress.city"
                  disabled={sameAsDelivery}
                  {...register("deliveryAddress.city")}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliveryAddress.state">State</Label>
                <Controller
                  name="deliveryAddress.state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      disabled={sameAsDelivery}
                      onValueChange={(val) => field.onChange(val ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {stateItems.map((item) => (
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

              <div className="space-y-1.5">
                <Label htmlFor="deliveryAddress.country">Country</Label>
                <Input
                  id="deliveryAddress.country"
                  disabled={sameAsDelivery}
                  {...register("deliveryAddress.country")}
                  placeholder="India"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="deliveryAddress.postalCode">Postal / Zip Code</Label>
                <Input
                  id="deliveryAddress.postalCode"
                  disabled={sameAsDelivery}
                  {...register("deliveryAddress.postalCode")}
                  placeholder="e.g. 400053"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/suppliers">
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
              {isSubmitting && submitAction === "saveAndCreateNew"
                ? "Saving..."
                : "Save & Create New"}
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
    </div>
  );
}
