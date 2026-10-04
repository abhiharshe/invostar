"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useSuppliers,
  useToggleSupplierActive,
} from "@/features/suppliers/hooks/use-suppliers";
import { formatCurrency } from "@/lib/formatters";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Truck,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function SuppliersListPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: suppliers, isLoading } = useSuppliers({
    search: search || undefined,
    isActive:
      selectedStatus === "active"
        ? true
        : selectedStatus === "inactive"
          ? false
          : undefined,
  });

  const { mutate: toggleActive } = useToggleSupplierActive();

  const filteredSuppliers = useMemo(() => suppliers ?? [], [suppliers]);
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header & Primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Suppliers
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your supplier directory, contact information, and account balances.
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button className="flex items-center gap-2 bg-indigo-600 font-medium text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Add Supplier
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
            placeholder="Search by name or mobile..."
            className="pl-9"
          />
        </div>

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

      {/* Table / Skeleton / Empty State */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : paginatedSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
            No suppliers found
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Try adjusting your search query or status filter, or add a new supplier.
          </p>
          <Link href="/suppliers/new" className="mt-4">
            <Button size="sm" className="bg-indigo-600 text-white">
              <Plus className="mr-1.5 h-4 w-4" /> Create Supplier
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3.5">Supplier Name</th>
                  <th className="px-6 py-3.5">Contact & Address</th>
                  <th className="px-6 py-3.5">Opening Balance</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {paginatedSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-neutral-50/80 transition-colors dark:hover:bg-neutral-800/40"
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950 dark:text-indigo-400">
                          {supplier.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {supplier.name}
                          </p>
                          {supplier._count && (
                            <p className="text-[10px] text-neutral-400">
                              {supplier._count.purchases} purchase{supplier._count.purchases !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-6 py-4 text-xs space-y-1">
                      {supplier.mobile && (
                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                          <Phone className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{supplier.mobile}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 truncate max-w-[250px]">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                      )}
                      {!supplier.mobile && !supplier.address && (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Opening Balance Column */}
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(Number(supplier.openingBalance))}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <Button
                        variant={supplier.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleActive(supplier.id)}
                        className={`h-6 rounded-full px-2.5 text-xs font-medium ${
                          supplier.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Button>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/suppliers/${supplier.id}`} title="View Details">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/suppliers/${supplier.id}/edit`} title="Edit Supplier">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
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
              Showing{" "}
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSuppliers.length)}{" "}
              to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSuppliers.length)} of{" "}
              {filteredSuppliers.length} entries
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
