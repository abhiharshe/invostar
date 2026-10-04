"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useSuppliers, useCreateSupplier } from "@/features/suppliers/hooks/use-suppliers";
import { useCreatePurchase } from "@/features/purchases/hooks/use-purchases";
import { INDIAN_STATES } from "@/lib/gst-utils";
import { ChevronsUpDown, Check, ShoppingCart, Plus, Loader2, Building2, Truck } from "lucide-react";

/* ─── Schemas ────────────────────────────────────────────────────────────── */
const addressSchema = z.object({
  line1: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const schema = z
  .object({
    isNewSupplier: z.boolean(),
    supplierId: z.string().optional(),
    supplierName: z.string().optional(),
    supplierMobile: z.string().optional(),
    billingAddress: addressSchema.optional(),
    sameAsDelivery: z.boolean(),
    deliveryAddress: addressSchema.optional(),
    purchaseDate: z.string().min(1, "Purchase date is required."),
    purchaseOrderNo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isNewSupplier && !data.supplierId) {
      ctx.addIssue({
        code: "custom",
        path: ["supplierId"],
        message: "Please select a supplier.",
      });
    }
    if (data.isNewSupplier) {
      if (!data.supplierName || data.supplierName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["supplierName"],
          message: "Supplier name must be at least 2 characters.",
        });
      }
      if (
        data.supplierMobile &&
        !/^[0-9]{10}$/.test(data.supplierMobile)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["supplierMobile"],
          message: "Mobile must be a valid 10-digit number.",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

/* ─── Inline Supplier Combobox ───────────────────────────────────────────── */
function SupplierSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data: suppliers = [] } = useSuppliers({ isActive: true });

  const filtered = useMemo(
    () => suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [suppliers, search]
  );
  const selected = suppliers.find((s) => s.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input dark:border-neutral-700 dark:bg-neutral-900"
          }`}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.name : "Select supplier…"}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-60 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
            <Input
              autoFocus
              placeholder="Search supplier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-neutral-400">No suppliers found</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setSearch(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Check className={`h-4 w-4 shrink-0 ${value === s.id ? "text-indigo-600" : "invisible"}`} />
                  <span className="truncate font-medium text-neutral-900 dark:text-white">{s.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Address Fields Block ───────────────────────────────────────────────── */
function AddressFields({
  prefix,
  register,
  control,
  disabled = false,
}: {
  prefix: "billingAddress" | "deliveryAddress";
  register: any;
  control: any;
  disabled?: boolean;
}) {
  const stateItems = useMemo(() => INDIAN_STATES.map((st) => ({ label: st, value: st })), []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs">Address Line 1</Label>
        <Input disabled={disabled} {...register(`${prefix}.line1`)} placeholder="Building / Street" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Area / Locality</Label>
        <Input disabled={disabled} {...register(`${prefix}.locality`)} placeholder="Locality" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">City</Label>
        <Input disabled={disabled} {...register(`${prefix}.city`)} placeholder="City" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">State</Label>
        <Controller
          name={`${prefix}.state`}
          control={control}
          render={({ field }) => (
            <Select disabled={disabled} value={field.value} onValueChange={(v) => field.onChange(v ?? "")}>
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {stateItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Postal Code</Label>
        <Input disabled={disabled} {...register(`${prefix}.postalCode`)} placeholder="e.g. 400053" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Country</Label>
        <Input disabled={disabled} {...register(`${prefix}.country`)} placeholder="India" className="h-8 text-sm" />
      </div>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
interface NewPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewPurchaseModal({ open, onClose }: NewPurchaseModalProps) {
  const router = useRouter();
  const { mutateAsync: createSupplierAsync } = useCreateSupplier();
  const { mutateAsync: createPurchaseAsync, isPending } = useCreatePurchase();

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isNewSupplier: false,
      supplierId: "",
      supplierName: "",
      supplierMobile: "",
      billingAddress: { line1: "", locality: "", city: "", state: "", country: "India", postalCode: "" },
      sameAsDelivery: true,
      deliveryAddress: { line1: "", locality: "", city: "", state: "", country: "India", postalCode: "" },
      purchaseDate: today,
      purchaseOrderNo: "",
    },
  });

  const isNewSupplier = watch("isNewSupplier");
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

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      let supplierId = data.supplierId!;

      // Step 1 — create new supplier if needed
      if (data.isNewSupplier) {
        const newSupplier = await createSupplierAsync({
          name: data.supplierName!.trim(),
          mobile: data.supplierMobile?.trim() || undefined,
          billingAddress: data.billingAddress,
          deliveryAddress: data.sameAsDelivery ? data.billingAddress : data.deliveryAddress,
        });
        supplierId = newSupplier.id;
        toast.success(`Supplier "${newSupplier.name}" created.`);
      }

      // Step 2 — create purchase shell
      const purchase = await createPurchaseAsync({
        supplierId,
        purchaseDate: data.purchaseDate,
        billNumber: data.purchaseOrderNo?.trim() || undefined,
        items: [],
      });

      toast.success(`Purchase ${purchase.billNumber} created. Add your items below.`);
      handleClose();
      router.push(`/purchases/${purchase.id}/edit`);
    } catch {
      // errors handled in hook / createSupplierAsync
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto p-0 sm:max-w-4xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
                New Purchase
              </DialogTitle>
              <DialogDescription className="text-xs">
                Start a purchase bill. Add line items after creation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-4">

          {/* ── Purchase Details ── */}
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-semibold">Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Purchase Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="purchaseDate">
                    Purchase Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register("purchaseDate")}
                    className="w-full"
                  />
                  {errors.purchaseDate && (
                    <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>
                  )}
                </div>

                {/* Purchase Order No */}
                <div className="space-y-1.5">
                  <Label htmlFor="purchaseOrderNo">
                    Purchase Order No.{" "}
                    <span className="text-xs font-normal text-neutral-400">(optional)</span>
                  </Label>
                  <Input
                    id="purchaseOrderNo"
                    {...register("purchaseOrderNo")}
                    placeholder="e.g. PO-2024-001 (auto-generated if blank)"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Supplier ── */}
          <Card>
            <CardHeader className="py-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Supplier</CardTitle>
                <Controller
                  name="isNewSupplier"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isNewSupplier"
                        checked={field.value}
                        onCheckedChange={(v) => {
                          field.onChange(v);
                          setValue("supplierId", "");
                          setValue("supplierName", "");
                        }}
                      />
                      <Label htmlFor="isNewSupplier" className="cursor-pointer text-xs font-normal">
                        This is a new supplier
                      </Label>
                    </div>
                  )}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isNewSupplier ? (
                /* Existing supplier combobox */
                <div className="space-y-1.5">
                  <Label>
                    Select Supplier <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <SupplierSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={errors.supplierId?.message}
                      />
                    )}
                  />
                </div>
              ) : (
                /* New supplier fields */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="supplierName">
                        Supplier Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="supplierName"
                        {...register("supplierName")}
                        placeholder="e.g. Global Distributors Pvt. Ltd."
                      />
                      {errors.supplierName && (
                        <p className="text-xs text-destructive">{errors.supplierName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="supplierMobile">Mobile</Label>
                      <Input
                        id="supplierMobile"
                        type="tel"
                        maxLength={10}
                        {...register("supplierMobile")}
                        placeholder="10-digit mobile"
                      />
                      {errors.supplierMobile && (
                        <p className="text-xs text-destructive">{errors.supplierMobile.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Billing Address</span>
                    </div>
                    <AddressFields prefix="billingAddress" register={register} control={control} />
                  </div>

                  {/* Delivery Address */}
                  <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Delivery Address</span>
                      </div>
                      <Controller
                        name="sameAsDelivery"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="sameAsDelivery"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="sameAsDelivery" className="cursor-pointer text-xs font-normal text-neutral-500">
                              Same as billing
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                    <AddressFields prefix="deliveryAddress" register={register} control={control} disabled={sameAsDelivery} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px] bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create & Add Items
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
