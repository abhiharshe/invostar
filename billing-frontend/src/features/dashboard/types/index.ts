export interface DashboardMetrics {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netRevenue: number;
  salesCount: number;
  purchasesCount: number;
  lowStockItemsCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'purchase' | 'expense';
  description: string;
  amount: number;
  createdAt: string;
}
