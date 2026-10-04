"use client";

import { use } from "react";
import Link from "next/link";
import {
  useSupplier,
  useToggleSupplierActive,
} from "@/features/suppliers/hooks/use-suppliers";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  Receipt,
  CreditCard,
  Building2,
  Truck,
} from "lucide-react";

export default function SupplierDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: supplier, isLoading } = useSupplier(id);
  const { mutate: toggleActive } = useToggleSupplierActive();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="py-12 text-center text-neutral-500">
        Supplier not found or has been removed.
      </div>
    );
  }

  const formatAddress = (addr?: any) => {
    if (!addr) return null;
    const parts = [
      addr.line1,
      addr.locality,
      addr.city,
      addr.state,
      addr.country,
      addr.postalCode ? `Pincode: ${addr.postalCode}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const billingAddrFormatted = formatAddress(supplier.billingAddress) || supplier.address;
  const deliveryAddrFormatted = formatAddress(supplier.deliveryAddress);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/suppliers">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {supplier.name}
              </h1>
              <Badge variant={supplier.isActive ? "default" : "secondary"}>
                {supplier.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">Supplier ID: {supplier.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleActive(supplier.id)}
          >
            {supplier.isActive ? "Mark Inactive" : "Mark Active"}
          </Button>
          <Link href={`/suppliers/${supplier.id}/edit`}>
            <Button
              size="sm"
              className="bg-indigo-600 font-medium text-white hover:bg-indigo-500"
            >
              <Edit className="mr-1.5 h-4 w-4" /> Edit Supplier
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Contact & Address Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contact & Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Mobile */}
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500">Mobile Phone</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {supplier.mobile || "Not specified"}
                </p>
              </div>
            </div>

            {/* Billing Address */}
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500">Billing Address</p>
                <p className="font-medium text-neutral-900 dark:text-white text-xs leading-relaxed">
                  {billingAddrFormatted || "Not specified"}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500">Delivery Address</p>
                <p className="font-medium text-neutral-900 dark:text-white text-xs leading-relaxed">
                  {deliveryAddrFormatted || billingAddrFormatted || "Same as Billing Address"}
                </p>
              </div>
            </div>

            {/* Opening Balance */}
            <div className="flex items-start gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Wallet className="h-4 w-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500">Opening Balance</p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(Number(supplier.openingBalance))}
                </p>
              </div>
            </div>

            {/* Supplier Since */}
            <div className="flex items-start gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Calendar className="h-4 w-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500">Supplier Since</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                  {formatDate(supplier.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recent Purchases */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Recent Purchases
                </h3>
              </div>
              {!supplier.purchases || supplier.purchases.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 italic">
                  No purchases recorded for this supplier yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="p-2.5">Purchase ID</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Total Amount</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {supplier.purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="p-2.5 font-medium text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                            {purchase.id.slice(0, 8)}…
                          </td>
                          <td className="p-2.5 text-neutral-600 dark:text-neutral-400">
                            {formatDate(purchase.purchaseDate)}
                          </td>
                          <td className="p-2.5 font-semibold text-neutral-900 dark:text-white">
                            {formatCurrency(Number(purchase.totalAmount))}
                          </td>
                          <td className="p-2.5">
                            <Badge variant="outline" className="text-[10px]">
                              {purchase.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Recent Payments Made
                </h3>
              </div>
              {!supplier.payments || supplier.payments.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 italic">
                  No payment records for this supplier yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Mode</th>
                        <th className="p-2.5">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {supplier.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="p-2.5 text-neutral-600 dark:text-neutral-400">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="p-2.5">
                            <Badge variant="secondary" className="text-[10px]">
                              {payment.paymentMode}
                            </Badge>
                          </td>
                          <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
