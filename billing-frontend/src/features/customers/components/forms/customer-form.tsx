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
import { Customer, CreateCustomerInput } from "@/features/customers/types";
import { GSTIN_REGEX, INDIAN_STATES, getStateFromGSTIN } from "@/lib/gst-utils";
import { ArrowLeft } from "lucide-react";
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

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required.")
    .min(2, "Customer name must be at least 2 characters.")
    .max(100, "Customer name cannot exceed 100 characters."),
  mobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "Mobile number must be a valid 10-digit number."
    ),
  gstin: z
    .string()
    .optional()
    .refine(
      (val) => !val || GSTIN_REGEX.test(val.trim().toUpperCase()),
      "GSTIN must be a valid 15-character GST number (e.g. 27AAAAA0000A1Z5)."
    ),
  openingBalance: z.number().min(0, "Opening balance cannot be negative."),
  isActive: z.boolean(),
  billingAddress: addressSchema,
  sameAsBilling: z.boolean(),
  shippingAddress: addressSchema,
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (values: CreateCustomerInput, action: "save" | "saveAndCreateNew") => void;
  isSubmitting: boolean;
  title: string;
  isCreateMode?: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
  isCreateMode = !initialData,
}: CustomerFormProps) {
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
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        mobile: initialData.mobile ?? "",
        gstin: initialData.gstin ?? "",
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
        sameAsBilling: false,
        shippingAddress: {
          line1: initialData.shippingAddress?.line1 ?? "",
          locality: initialData.shippingAddress?.locality ?? "",
          city: initialData.shippingAddress?.city ?? "",
          state: initialData.shippingAddress?.state ?? "",
          country: initialData.shippingAddress?.country ?? "India",
          postalCode: initialData.shippingAddress?.postalCode ?? "",
        },
      }
      : {
        name: "",
        mobile: "",
        gstin: "",
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
        sameAsBilling: true,
        shippingAddress: {
          line1: "",
          locality: "",
          city: "",
          state: "",
          country: "India",
          postalCode: "",
        },
      },
  });

  const gstinValue = watch("gstin");
  const sameAsBilling = watch("sameAsBilling");
  const billingAddress = watch("billingAddress");

  // Auto-set state based on GSTIN code
  useEffect(() => {
    if (gstinValue) {
      const derivedState = getStateFromGSTIN(gstinValue);
      if (derivedState) {
        setValue("billingAddress.state", derivedState);
      }
    }
  }, [gstinValue, setValue]);

  // Sync shipping address when sameAsBilling is checked
  useEffect(() => {
    if (sameAsBilling) {
      setValue("shippingAddress", {
        line1: billingAddress?.line1 ?? "",
        locality: billingAddress?.locality ?? "",
        city: billingAddress?.city ?? "",
        state: billingAddress?.state ?? "",
        country: billingAddress?.country ?? "India",
        postalCode: billingAddress?.postalCode ?? "",
      });
    }
  }, [sameAsBilling, billingAddress, setValue]);

  const handleInvalidForm = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstErrorMessage = formErrors[errorKeys[0]]?.message || formErrors[errorKeys[0]]?.line1?.message;
      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      }
    }
  };

  const handleFormSubmit = (data: CustomerFormValues) => {
    const { sameAsBilling, ...rest } = data;
    const formattedData = {
      ...rest,
      gstin: rest.gstin ? rest.gstin.trim().toUpperCase() : undefined,
      shippingAddress: sameAsBilling ? rest.billingAddress : rest.shippingAddress,
    };
    onSubmit(formattedData, submitAction);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit, handleInvalidForm)}
        className="space-y-8"
      >
        {/* Core Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Customer Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Acme Traders / John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Mobile Number */}
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

              {/* GST Number */}
              <div className="space-y-1.5">
                <Label htmlFor="gstin">GSTIN / Tax ID (Optional)</Label>
                <Input
                  id="gstin"
                  maxLength={15}
                  {...register("gstin")}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register("gstin").onChange(e);
                  }}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="uppercase tracking-wider font-mono text-xs"
                />
                {errors.gstin && (
                  <p className="text-xs text-destructive">{errors.gstin.message}</p>
                )}
              </div>

              {/* Opening Balance */}
              <div className="space-y-1.5">
                <Label htmlFor="openingBalance">Opening Balance ($)</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  {...register("openingBalance", { valueAsNumber: true })}
                />
                {errors.openingBalance && (
                  <p className="text-xs text-destructive">
                    {errors.openingBalance.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5 flex items-center pt-6">
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
                        Active Customer
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
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
                      items={stateItems}
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

        {/* Shipping Address Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Shipping Address</CardTitle>
            <Controller
              name="sameAsBilling"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsBilling"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="sameAsBilling" className="cursor-pointer text-xs font-normal text-neutral-600 dark:text-neutral-400">
                    Same as billing address
                  </Label>
                </div>
              )}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shippingAddress.line1">Address Line 1</Label>
                <Input
                  id="shippingAddress.line1"
                  disabled={sameAsBilling}
                  {...register("shippingAddress.line1")}
                  placeholder="Flat / Building / House No., Street"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress.locality">Area / Locality</Label>
                <Input
                  id="shippingAddress.locality"
                  disabled={sameAsBilling}
                  {...register("shippingAddress.locality")}
                  placeholder="e.g. Andheri West"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress.city">City</Label>
                <Input
                  id="shippingAddress.city"
                  disabled={sameAsBilling}
                  {...register("shippingAddress.city")}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress.state">State</Label>
                <Controller
                  name="shippingAddress.state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={stateItems}
                      value={field.value}
                      disabled={sameAsBilling}
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
                <Label htmlFor="shippingAddress.country">Country</Label>
                <Input
                  id="shippingAddress.country"
                  disabled={sameAsBilling}
                  {...register("shippingAddress.country")}
                  placeholder="India"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shippingAddress.postalCode">Postal / Zip Code</Label>
                <Input
                  id="shippingAddress.postalCode"
                  disabled={sameAsBilling}
                  {...register("shippingAddress.postalCode")}
                  placeholder="e.g. 400053"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions as per AGENTS.md rules */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/customers">
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
    </div>
  );
}
