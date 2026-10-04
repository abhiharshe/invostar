"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers";
import { useProducts } from "@/features/products/hooks/use-products";
import { Purchase, UpdatePurchaseInput } from "@/features/purchases/types";
import { formatCurrency } from "@/lib/formatters";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronsUpDown,
  Check,
  ShoppingCart,
  Save,
  Building2,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Zod Validation Schema ─────────────────────────────────────────────── */
const itemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.number().min(0.001, "Quantity must be greater than 0."),
  rate: z.number().min(0, "Rate cannot be negative."),
  taxPercentage: z.number().min(0, "Tax percentage cannot be negative."),
});

const purchaseFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required."),
  purchaseDate: z.string().min(1, "Purchase date is required."),
  billNumber: z.string().min(1, "Bill / PO number is required."),
  remarks: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required in the purchase bill."),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormProps {
  initialData: Purchase;
  onSubmit: (values: UpdatePurchaseInput) => void;
  isSubmitting: boolean;
}

/* ─── Searchable Product Combobox Component ────────────────────────────── */
function ProductSelect({
  value,
  onChange,
  onSelectProduct,
  error,
}: {
  value: string;
  onChange: (id: string) => void;
  onSelectProduct: (product: any) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useProducts({ isActive: true });

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center justify-between gap-2 border bg-background px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-none ${
          error ? "border-destructive" : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900"
        }`}
      >
        <span className={selected ? "font-medium text-neutral-900 dark:text-white truncate" : "text-neutral-400"}>
          {selected ? `${selected.name} (${selected.unit})` : "Select a product…"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
      </button>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[60] w-full min-w-[260px] overflow-hidden border border-neutral-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900 rounded-none">
          <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
            <Input
              autoFocus
              placeholder="Search product by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs rounded-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-neutral-400">
                No active products found
              </p>
            ) : (
              filtered.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    onChange(prod.id);
                    onSelectProduct(prod);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${value === prod.id ? "text-indigo-600" : "invisible"}`}
                    />
                    <span className="font-medium text-neutral-900 dark:text-white truncate">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 shrink-0 ml-2">
                    ₹{prod.rate} | GST {prod.taxPercentage}%
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Searchable Supplier Combobox Component ────────────────────────────── */
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
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center justify-between gap-2 border bg-background px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-none ${
          error ? "border-destructive" : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900"
        }`}
      >
        <span className={selected ? "font-medium text-neutral-900 dark:text-white truncate" : "text-neutral-400"}>
          {selected ? selected.name : "Select supplier…"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
      </button>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[60] w-full min-w-[240px] overflow-hidden border border-neutral-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900 rounded-none">
          <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
            <Input
              autoFocus
              placeholder="Search supplier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs rounded-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-neutral-400">
                No suppliers found
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${value === s.id ? "text-indigo-600" : "invisible"}`}
                  />
                  <span className="font-medium text-neutral-900 dark:text-white truncate">
                    {s.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Purchase Form Component ─────────────────────────────────────── */
export function PurchaseForm({
  initialData,
  onSubmit,
  isSubmitting,
}: PurchaseFormProps) {
  const router = useRouter();

  const formattedInitialDate = useMemo(() => {
    if (!initialData.purchaseDate) return new Date().toISOString().split("T")[0];
    return new Date(initialData.purchaseDate).toISOString().split("T")[0];
  }, [initialData.purchaseDate]);

  const defaultItems = useMemo(() => {
    if (!initialData.items || initialData.items.length === 0) {
      return [
        {
          productId: "",
          quantity: 1,
          rate: 0,
          taxPercentage: 0,
        },
      ];
    }
    return initialData.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      taxPercentage: Number(item.taxPercentage),
    }));
  }, [initialData.items]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierId: initialData.supplierId || "",
      purchaseDate: formattedInitialDate,
      billNumber: initialData.billNumber || "",
      remarks: initialData.remarks || "",
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Reactive calculations watching items
  const watchedItems = useWatch({ control, name: "items" });

  const summary = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    (watchedItems || []).forEach((item) => {
      const qty = Number(item?.quantity) || 0;
      const rate = Number(item?.rate) || 0;
      const taxPct = Number(item?.taxPercentage) || 0;

      const lineSubtotal = qty * rate;
      const lineTax = lineSubtotal * (taxPct / 100);

      subtotal += lineSubtotal;
      totalTax += lineTax;
    });

    const grandTotal = subtotal + totalTax;

    return { subtotal, totalTax, grandTotal };
  }, [watchedItems]);

  const handleFormSubmit = (values: PurchaseFormValues) => {
    const payload: UpdatePurchaseInput = {
      supplierId: values.supplierId,
      billNumber: values.billNumber.trim(),
      purchaseDate: values.purchaseDate,
      remarks: values.remarks?.trim() || undefined,
      items: values.items.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        rate: Number(i.rate),
        taxPercentage: Number(i.taxPercentage),
      })),
    };
    onSubmit(payload);
  };

  const handleInvalid = (formErrors: any) => {
    if (formErrors.items) {
      if (typeof formErrors.items.message === "string") {
        toast.error(formErrors.items.message);
      } else if (Array.isArray(formErrors.items)) {
        toast.error("Please fill in all item details correctly.");
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalid)} className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/purchases">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-none">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-none">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Edit Purchase Bill
              </h1>
              <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                {initialData.billNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/purchases">
            <Button type="button" variant="outline" disabled={isSubmitting} className="rounded-none">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 font-medium text-white hover:bg-indigo-500 rounded-none min-w-[130px]"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save Purchase"}
          </Button>
        </div>
      </div>

      {/* Header Info Card */}
      <Card className="rounded-none border-neutral-200 dark:border-neutral-800">
        <CardHeader className="py-3 border-b border-neutral-100 dark:border-neutral-800">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-neutral-500" />
            Bill & Supplier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Supplier */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Supplier <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <SupplierSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.supplierId?.message}
                  />
                )}
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <Label htmlFor="purchaseDate" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Purchase Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate")}
                className="h-9 text-xs rounded-none"
              />
              {errors.purchaseDate && (
                <p className="text-[11px] text-destructive">{errors.purchaseDate.message}</p>
              )}
            </div>

            {/* Bill / PO Number */}
            <div className="space-y-1.5">
              <Label htmlFor="billNumber" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Bill / PO Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billNumber"
                {...register("billNumber")}
                placeholder="e.g. PUR-2026-0001"
                className="h-9 text-xs font-mono rounded-none"
              />
              {errors.billNumber && (
                <p className="text-[11px] text-destructive">{errors.billNumber.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Repeater Card */}
      <Card className="rounded-none border-neutral-200 dark:border-neutral-800">
        <CardHeader className="py-3 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
            Purchase Items
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                productId: "",
                quantity: 1,
                rate: 0,
                taxPercentage: 0,
              })
            }
            className="h-8 rounded-none border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Product Item
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[240px]">Product *</th>
                  <th className="py-3 px-3 w-28 text-right">Qty *</th>
                  <th className="py-3 px-3 w-32 text-right">Rate (₹) *</th>
                  <th className="py-3 px-3 w-28 text-right">Tax %</th>
                  <th className="py-3 px-3 w-32 text-right">Tax Amount</th>
                  <th className="py-3 px-3 w-36 text-right">Total Amount</th>
                  <th className="py-3 px-3 w-14 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {fields.map((fieldItem, index) => {
                  const currentQty = Number(watchedItems?.[index]?.quantity) || 0;
                  const currentRate = Number(watchedItems?.[index]?.rate) || 0;
                  const currentTaxPct = Number(watchedItems?.[index]?.taxPercentage) || 0;

                  const lineSubtotal = currentQty * currentRate;
                  const lineTax = lineSubtotal * (currentTaxPct / 100);
                  const lineTotal = lineSubtotal + lineTax;

                  const rowError = errors.items?.[index];

                  return (
                    <tr key={fieldItem.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      {/* Row # */}
                      <td className="py-3 px-3 text-center text-neutral-400 font-medium align-top pt-4">
                        {index + 1}
                      </td>

                      {/* Product Selector */}
                      <td className="py-3 px-3 align-top">
                        <Controller
                          name={`items.${index}.productId`}
                          control={control}
                          render={({ field }) => (
                            <ProductSelect
                              value={field.value}
                              onChange={field.onChange}
                              onSelectProduct={(product) => {
                                if (product) {
                                  setValue(`items.${index}.rate`, Number(product.rate));
                                  setValue(`items.${index}.taxPercentage`, Number(product.taxPercentage));
                                }
                              }}
                              error={rowError?.productId?.message}
                            />
                          )}
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 align-top">
                        <Input
                          type="number"
                          step="0.001"
                          min="0.001"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="h-9 text-xs text-right rounded-none"
                        />
                        {rowError?.quantity && (
                          <p className="text-[11px] text-destructive mt-1">{rowError.quantity.message}</p>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-3 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                          className="h-9 text-xs text-right rounded-none"
                        />
                        {rowError?.rate && (
                          <p className="text-[11px] text-destructive mt-1">{rowError.rate.message}</p>
                        )}
                      </td>

                      {/* Tax % */}
                      <td className="py-3 px-3 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.taxPercentage`, { valueAsNumber: true })}
                          className="h-9 text-xs text-right rounded-none"
                        />
                        {rowError?.taxPercentage && (
                          <p className="text-[11px] text-destructive mt-1">{rowError.taxPercentage.message}</p>
                        )}
                      </td>

                      {/* Line Tax (Calculated) */}
                      <td className="py-3 px-3 align-top pt-4 text-right font-medium text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(lineTax)}
                      </td>

                      {/* Line Total (Calculated) */}
                      <td className="py-3 px-3 align-top pt-4 text-right font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(lineTotal)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-center pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-neutral-400 hover:text-rose-600 disabled:opacity-30 rounded-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Row Footer */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  productId: "",
                  quantity: 1,
                  rate: 0,
                  taxPercentage: 0,
                })
              }
              className="h-8 text-xs rounded-none border-dashed border-neutral-300 text-neutral-700 hover:bg-white dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Plus className="mr-1 h-3.5 w-3.5 text-indigo-600" /> Add Another Line Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Remarks & Calculations Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Remarks */}
        <div className="lg:col-span-2">
          <Card className="rounded-none border-neutral-200 dark:border-neutral-800 h-full">
            <CardHeader className="py-3 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-sm font-semibold">Remarks / Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                {...register("remarks")}
                placeholder="Enter any additional purchase notes, invoice references or terms..."
                className="min-h-[110px] text-xs rounded-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary Card */}
        <div className="lg:col-span-1">
          <Card className="rounded-none border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <CardHeader className="py-3 border-b border-neutral-200 dark:border-neutral-800">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-600" />
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                <span>SubTotal (Tax excluded):</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>

              {/* Total Tax */}
              <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                <span>Total Tax Amount:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatCurrency(summary.totalTax)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 my-2 pt-2">
                <div className="flex justify-between items-center text-sm font-bold text-neutral-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-base font-mono">
                    {formatCurrency(summary.grandTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
