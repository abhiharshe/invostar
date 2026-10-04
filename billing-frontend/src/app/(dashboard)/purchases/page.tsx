"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePurchases, useDeletePurchase } from "@/features/purchases/hooks/use-purchases";
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers";
import { NewPurchaseModal } from "@/features/purchases/components/modals/new-purchase-modal";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Edit,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ChevronsUpDown,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DocumentStatus, Purchase } from "@/features/purchases/types";

const ITEMS_PER_PAGE = 10;

/* ─── Status Badge ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "Draft", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  QUOTATION: { label: "Quotation", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  CONVERTED: { label: "Converted", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  UNPAID: { label: "Unpaid", className: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  PARTIALLY_PAID: { label: "Partial", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  VOIDED: { label: "Voided", className: "bg-neutral-200 text-neutral-500 line-through dark:bg-neutral-800 dark:text-neutral-500" },
};

function StatusBadge({ status }: { status: DocumentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNPAID;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Supplier Combobox ─────────────────────────────────────────────────── */
interface SupplierComboboxProps {
  value: string;
  onChange: (id: string) => void;
}

function SupplierCombobox({ value, onChange }: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data: suppliers = [] } = useSuppliers({ isActive: true });

  const filtered = useMemo(
    () =>
      suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [suppliers, search]
  );

  const selected = suppliers.find((s) => s.id === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative min-w-55">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-700 dark:bg-neutral-900"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.name : "All Suppliers"}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-full min-w-60 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {/* Search */}
          <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
            <Input
              autoFocus
              placeholder="Search supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto">
            {/* All Suppliers option */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Check className={`h-4 w-4 ${!value ? "text-indigo-600" : "invisible"}`} />
              <span className="text-muted-foreground">All Suppliers</span>
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-neutral-400">
                No suppliers found
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setSearch(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${value === s.id ? "text-indigo-600" : "invisible"}`}
                  />
                  <span className="truncate font-medium text-neutral-900 dark:text-white">
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

/* ─── Bill Number Combobox ──────────────────────────────────────────────── */
interface BillNoComboboxProps {
  value: string;
  onChange: (billNo: string) => void;
  options: string[];
}

function BillNoCombobox({ value, onChange, options }: BillNoComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => options.filter((b) => b.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative min-w-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-700 dark:bg-neutral-900"
      >
        <span className={value ? "font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"}>
          {value || "All Bill No."}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-55 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
            <Input
              autoFocus
              placeholder="Search bill no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 font-mono text-sm"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Check className={`h-4 w-4 ${!value ? "text-indigo-600" : "invisible"}`} />
              <span className="text-muted-foreground">All Bill No.</span>
            </button>
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-neutral-400">No bills found</p>
            ) : (
              filtered.map((billNo) => (
                <button
                  key={billNo}
                  type="button"
                  onClick={() => { onChange(billNo); setOpen(false); setSearch(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Check className={`h-4 w-4 shrink-0 ${value === billNo ? "text-indigo-600" : "invisible"}`} />
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                    {billNo}
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

/* ─── Delete Confirm Dialog ─────────────────────────────────────────────── */
function DeleteDialog({
  purchase,
  open,
  onClose,
}: {
  purchase: Purchase | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: deletePurchase, isPending } = useDeletePurchase();

  const handleConfirm = () => {
    if (!purchase) return;
    deletePurchase(purchase.id, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Purchase
          </DialogTitle>
          <DialogDescription className="pt-1">
            Are you sure you want to delete purchase bill{" "}
            <span className="font-semibold text-neutral-900 dark:text-white font-mono">
              {purchase?.billNumber}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-rose-600 text-white hover:bg-rose-500"
          >
            {isPending ? "Deleting…" : "Yes, Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function PurchasesListPage() {
  const [supplierId, setSupplierId] = useState("");
  const [selectedBillNo, setSelectedBillNo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);

  const hasFilters = Boolean(supplierId || selectedBillNo || fromDate || toDate);

  const clearFilters = () => {
    setSupplierId("");
    setSelectedBillNo("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const { data: purchases, isLoading } = usePurchases({
    supplierId: supplierId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const allPurchases = useMemo(() => purchases ?? [], [purchases]);

  // Unique bill numbers derived from the fetched (server-filtered) list
  const billNoOptions = useMemo(
    () => allPurchases.map((p) => p.billNumber),
    [allPurchases]
  );

  // Client-side bill number filter on top of server-side filters
  const filteredPurchases = useMemo(
    () =>
      selectedBillNo
        ? allPurchases.filter((p) => p.billNumber === selectedBillNo)
        : allPurchases,
    [allPurchases, selectedBillNo]
  );

  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPurchases, currentPage]);

  const handlePrint = (id: string) => {
    window.open(`/purchases/${id}?print=true`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Purchases
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            View and manage all purchase bills from your suppliers.
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-indigo-600 font-medium text-white hover:bg-indigo-500"
          onClick={() => setNewPurchaseOpen(true)}
        >
          <Plus className="h-4 w-4" /> New Purchase
        </Button>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* Supplier combobox */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Supplier
          </label>
          <SupplierCombobox value={supplierId} onChange={(id) => { setSupplierId(id); setSelectedBillNo(""); setCurrentPage(1); }} />
        </div>

        {/* Bill No combobox */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Bill No.
          </label>
          <BillNoCombobox
            value={selectedBillNo}
            onChange={(b) => { setSelectedBillNo(b); setCurrentPage(1); }}
            options={billNoOptions}
          />
        </div>

        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            From Date
          </label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
            className="w-[160px]"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            To Date
          </label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
            className="w-[160px]"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1.5 self-end text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}

        {/* Record count */}
        {!isLoading && (
          <span className="ml-auto self-end text-xs text-neutral-400 dark:text-neutral-500">
            {filteredPurchases.length} record{filteredPurchases.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Table / Skeleton / Empty ── */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={9} />
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
            No purchases found
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {hasFilters
              ? "Try adjusting the supplier or date range filter."
              : "Record your first purchase bill to get started."}
          </p>
          {!hasFilters && (
            <Link href="/purchases/new" className="mt-4">
              <Button size="sm" className="bg-indigo-600 text-white">
                <Plus className="mr-1.5 h-4 w-4" /> New Purchase
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                <tr>
                  <th className="px-5 py-3.5">Bill #</th>
                  <th className="px-5 py-3.5">Supplier</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-center">Items</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Paid</th>
                  <th className="px-5 py-3.5 text-right">Balance</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {paginated.map((purchase) => {
                  const totalPaid = purchase.paymentAllocations.reduce(
                    (sum, pa) => sum + Number(pa.amount),
                    0
                  );
                  const balance = Number(purchase.totalAmount) - totalPaid;
                  const isVoided = purchase.status === "VOIDED";

                  return (
                    <tr
                      key={purchase.id}
                      className={`transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 ${isVoided ? "opacity-60" : ""}`}
                    >
                      {/* Bill # */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {purchase.billNumber}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            {purchase.supplier.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {purchase.supplier.name}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(purchase.purchaseDate)}
                      </td>

                      {/* Items count */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          {purchase.items.length}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 text-right font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(Number(purchase.totalAmount))}
                      </td>

                      {/* Paid */}
                      <td className="px-5 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalPaid)}
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-4 text-right font-semibold">
                        <span className={balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-400"}>
                          {formatCurrency(balance)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={purchase.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Link href={`/purchases/${purchase.id}`} title="View Details">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Print */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Print"
                            className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            onClick={() => handlePrint(purchase.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>

                          {/* Edit */}
                          <Link href={`/purchases/${purchase.id}/edit`} title="Edit">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            disabled={isVoided}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 dark:text-rose-400 disabled:opacity-30"
                            onClick={() => setDeleteTarget(purchase)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            <span>
              Showing{" "}
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, allPurchases.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, allPurchases.length)} of{" "}
              {allPurchases.length} entries
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

      {/* ── Delete Confirmation Dialog ── */}
      <DeleteDialog
        purchase={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {/* ── New Purchase Modal ── */}
      <NewPurchaseModal
        open={newPurchaseOpen}
        onClose={() => setNewPurchaseOpen(false)}
      />
    </div>
  );
}
