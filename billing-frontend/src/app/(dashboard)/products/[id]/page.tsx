"use client";

import { use } from "react";
import Link from "next/link";
import { useProduct, useToggleProductActive } from "@/features/products/hooks/use-products";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Package, Layers, CheckCircle2, XCircle } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const { mutate: toggleActive } = useToggleProductActive();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-neutral-500">
        Product not found or has been deleted.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {product.name}
              </h1>
              {product.isBundle && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <Layers className="h-3 w-3" /> Bundle
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Type: {product.productType?.name ?? "-"} | Added on {formatDate(product.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleActive(product.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${product.isActive
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
          >
            {product.isActive ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Active
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-neutral-400" /> Inactive
              </>
            )}
          </button>

          <Link href={`/products/${product.id}/edit`}>
            <Button className="flex items-center gap-1.5 bg-indigo-600 font-medium text-white hover:bg-indigo-500">
              <Edit className="h-3.5 w-3.5" /> Edit Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 pb-3 dark:border-neutral-800">
          Product Details
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="block text-xs font-medium text-neutral-400">Unit Rate / Price</span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(Number(product.rate))}
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-400">Unit of Measure</span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {product.unit}
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-400">Tax Percentage</span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {Number(product.taxPercentage)}%
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-400">Category</span>
            <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {product.category.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-400">Product Type</span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {product.productType?.name ?? "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Bundle Items (If applicable) */}
      {product.isBundle && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 pb-3 dark:border-neutral-800">
            Bundled Products Included ({product.bundleItems?.length ?? 0})
          </h2>

          {!product.bundleItems || product.bundleItems.length === 0 ? (
            <p className="text-xs text-neutral-500 py-2">No bundled items configured for this package.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {product.bundleItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {item.product?.name ?? "Child Product"}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Quantity: {Number(item.quantity)} {item.product?.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(Number(item.product?.rate ?? 0) * Number(item.quantity))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
