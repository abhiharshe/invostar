"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useProducts,
  useProductTypes,
  useToggleProductActive,
} from "@/features/products/hooks/use-products";
import { ProductCategory } from "@/features/products/types";
import { formatCurrency } from "@/lib/formatters";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function ProductsListPage() {
  // Filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Queries & Mutations
  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    productTypeId: selectedType !== "ALL" ? selectedType : undefined,
    category: selectedCategory !== "ALL" ? (selectedCategory as ProductCategory) : undefined,
    isActive:
      selectedStatus === "active"
        ? true
        : selectedStatus === "inactive"
          ? false
          : undefined,
  });

  const { data: productTypes } = useProductTypes();
  const { mutate: toggleActive } = useToggleProductActive();

  // Pagination logic
  const filteredProducts = useMemo(() => products ?? [], [products]);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header & Primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Products &amp; Inventory
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your physical items, digital goods, services, and bundle packages.
          </p>
        </div>
        <Link href="/products/new">
          <Button className="flex items-center gap-2 bg-indigo-600 font-medium text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product name..."
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val ?? "ALL");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value={ProductCategory.PHYSICAL_GOODS}>Physical Goods</SelectItem>
            <SelectItem value={ProductCategory.DIGITAL_GOODS}>Digital Goods</SelectItem>
            <SelectItem value={ProductCategory.SERVICES}>Services</SelectItem>
            <SelectItem value={ProductCategory.LABOR}>Labor</SelectItem>
          </SelectContent>
        </Select>

        {/* Product Type Filter */}
        <Select
          value={selectedType}
          onValueChange={(val) => {
            setSelectedType(val ?? "ALL");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Product Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {productTypes?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={selectedStatus}
          onValueChange={(val) => {
            setSelectedStatus(val ?? "ALL");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table / Skeleton Content */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : paginatedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
            No products found
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Try adjusting your search query or filters, or add a new product.
          </p>
          <Link href="/products/new" className="mt-4">
            <Button size="sm" className="bg-indigo-600 text-white">
              <Plus className="mr-1.5 h-4 w-4" /> Create Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Rate / Price</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50/80 transition-colors dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {product.isBundle ? (
                          <span
                            title="Bundle Package"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          >
                            <Layers className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <Package className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-neutral-400">
                            Unit: {product.unit} | Tax: {Number(product.taxPercentage)}%
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {product.productType?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <Badge variant="secondary">
                        {product.category.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(Number(product.rate))}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant={product.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleActive(product.id)}
                        className={`h-6 rounded-full px-2.5 text-xs font-medium ${product.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`} title="View Details">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/products/${product.id}/edit`} title="Edit Product">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            <span>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
