"use client";
import { Banknote, ArchiveRestore, BarChart, CheckCheckIcon, Settings,Users, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import ItemDetail from "@/components/ItemDetail";
import ErrorMessage from "@/components/ErrorMessage";
import RevenueChart from "@/components/RevenueChart";
import TransactionTimelineChart from "@/components/TransactionTimelineChart";
import PaymentMethodsChart from "@/components/PaymentMethodsChart";
import SuccessRateCard from "@/components/SuccessRateCard";

interface FactSalesData {
  fact_id: string;
  user_name: string;
  user_email: string;
  product_name: string;
  product_category: string;
  product_price: number;
  order_status: string;
  order_total_amount: number;
  order_created_at: string;
  transaction_payment_method: string;
  transaction_status: string;
  transaction_timestamp: string;
  order_item_quantity: number;
  product_id?: string;
}

interface ChartData {
  period: string;
  revenue_by_day: Array<{ date: string; revenue: number; orders: number }>;
  transactions_by_day: Array<{ date: string; count: number }>;
  payment_methods: Record<string, number>;
  order_statuses: Record<string, number>;
  transaction_statuses: Record<string, number>;
}

export default function HomePage() {
  const [data, setData] = useState<FactSalesData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    totalUsers: 0,
    changes: null as {
      revenue_change_percent?: number;
      orders_change_percent?: number;
      transactions_change_percent?: number;
      users_change_percent?: number;
      avg_order_value_change_percent?: number;
    } | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [timePeriod, setTimePeriod] = useState<string>("week");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Infinite scrolling state
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Product search state
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const periods = [
    { value: "week", label: "1 Week" },
    { value: "2weeks", label: "2 Weeks" },
    { value: "month", label: "1 Month" },
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "9months", label: "9 Months" },
    { value: "1year", label: "1 Year" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPeriodMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentOffset(0); // Reset offset
      setHasMore(true); // Reset hasMore

      // Fetch chart data, stats, and table data in parallel
      // Use aggregated chart endpoint instead of raw data for massive performance boost
      const [chartResponse, statsResponse, tableResponse] = await Promise.all([
        fetch(`http://localhost:8000/stats/charts?period=${timePeriod}`),
        fetch(`http://localhost:8000/stats/summary?period=${timePeriod}`),
        fetch(`http://localhost:8000/all?period=${timePeriod}&limit=1000&skip=0`) // Start from offset 0
      ]);
      
      if (!chartResponse.ok || !statsResponse.ok || !tableResponse.ok) {
        throw new Error(`HTTP error! status: ${chartResponse.status}`);
      }

      const [chartResult, summaryStats, tableResult] = await Promise.all([
        chartResponse.json(),
        statsResponse.json(),
        tableResponse.json()
      ]);
      
      setChartData(chartResult);
      setData(tableResult);
      
      // Check if there are more records to load
      setHasMore(tableResult.length === 1000);
      setCurrentOffset(1000);

      // Use server-calculated stats from summary endpoint
      // Count completed orders from chart data (more efficient)
      const completedOrders = chartResult.order_statuses?.['delivered'] || 0;

      setStats({
        totalSales: summaryStats.total_revenue,
        totalOrders: summaryStats.total_orders,
        avgOrderValue: summaryStats.avg_order_value,
        totalUsers: summaryStats.total_users,
        completedOrders,
        changes: summaryStats.changes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // Use product search endpoint if in search mode
      const endpoint = isSearchMode 
        ? `http://localhost:8000/products/search?query=${encodeURIComponent(productSearchQuery)}&skip=${currentOffset}`
        : `http://localhost:8000/all?period=${timePeriod}&limit=1000&skip=${currentOffset}`;
      
      const response = await fetch(endpoint);
      
      if (response.status === 404) {
        // Not found - no more data
        setHasMore(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newData = await response.json();
      
      // Append new data to existing data
      setData(prevData => [...prevData, ...newData]);
      
      // Check if there are more records
      setHasMore(newData.length === 1000);
      setCurrentOffset(prev => prev + newData.length);
    } catch (err) {
      console.error('Error loading more data:', err);
      // Don't show error to user for infinite scroll failures
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleProductSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // If search is cleared, reset to normal mode
      setIsSearchMode(false);
      setProductSearchQuery("");
      fetchData();
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setIsSearchMode(true);
      setProductSearchQuery(searchQuery);
      setCurrentOffset(0);
      setHasMore(true);
      
      const response = await fetch(
        `http://localhost:8000/products/search?query=${encodeURIComponent(searchQuery)}&limit=1000&skip=0`
      );
      
      if (response.status === 404) {
        // Not found - show empty results
        setData([]);
        setHasMore(false);
        setCurrentOffset(0);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const searchResults = await response.json();
      setData(searchResults);
      
      // Check if there are more records
      setHasMore(searchResults.length === 1000);
      setCurrentOffset(1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsSearchMode(false);
    setProductSearchQuery("");
    fetchData();
  }, [timePeriod]);

  // Prefetch longer time periods in the background on initial load
  useEffect(() => {
    const prefetchLongerPeriods = async () => {
      const periodsToPreload = ['6months', '9months', '1year'];
      
      for (const period of periodsToPreload) {
        // Skip if this is the current period (already fetching)
        if (period === timePeriod) continue;
        
        try {
          // Prefetch aggregated chart data (fire and forget)
          fetch(`http://localhost:8000/stats/charts?period=${period}`).catch(() => {});
          // Prefetch stats endpoint (fire and forget)
          fetch(`http://localhost:8000/stats/summary?period=${period}`).catch(() => {});
          // Prefetch limited table data (fire and forget)
          fetch(`http://localhost:8000/all?period=${period}&limit=1000`).catch(() => {});
        } catch (err) {
          // Silent fail - this is just prefetching
        }
      }
    };
    
    // Delay prefetch slightly to not interfere with initial page load
    const timeoutId = setTimeout(prefetchLongerPeriods, 1000);
    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount
  const username = "Karim"
  const columns = [
    { key: "product_name", label: "Product", sortable: true, width: "200px" },
    { key: "product_category", label: "Category", sortable: true, width: "150px" },
    { key: "user_name", label: "Customer", sortable: true, width: "180px" },
    { key: "product_price", label: "Price", sortable: true, width: "120px" },
    { key: "order_item_quantity", label: "Qty", sortable: true, width: "80px" },
    { key: "order_total_amount", label: "Total", sortable: true, width: "120px" },
    { key: "order_status", label: "Status", sortable: true, width: "120px" },
    { key: "transaction_payment_method", label: "Payment", sortable: true, width: "120px" },
  ];

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
   
      
      <main className="flex-1 ml-5 p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back {username}
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings size={20} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                {periods.find(p => p.value === timePeriod)?.label}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {showPeriodMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {periods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => {
                      setTimePeriod(period.value);
                      setShowPeriodMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      timePeriod === period.value ? "bg-gray-100 font-medium text-[#1a7faf]" : "text-gray-700"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total New Users"
            value={`${stats.totalUsers.toLocaleString()}`}
            icon={<Users/>}
            changePercent={stats.changes?.users_change_percent}
            isLoading={isLoading}
            period = {timePeriod}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={<ArchiveRestore/>}
            changePercent={stats.changes?.orders_change_percent}
            isLoading={isLoading}
            period = {timePeriod}
          />
          <StatCard
            title="Avg Order Value"
            value={`$${stats.avgOrderValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<BarChart/>}
            changePercent={stats.changes?.avg_order_value_change_percent}
            isLoading={isLoading}
            period = {timePeriod}
          />
          
        
        <StatCard
            title="Completed Orders"
            value={stats.completedOrders.toLocaleString()}
            icon={<CheckCheckIcon/>}
            isLoading={isLoading}
            period = {timePeriod}
        />
        
        </div>
        

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart 
          data={chartData?.revenue_by_day || []} 
          isLoading={isLoading}
          period={timePeriod} 
          />
          <TransactionTimelineChart 
          data={chartData?.transactions_by_day || []} 
          isLoading={isLoading}
          period={timePeriod}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PaymentMethodsChart data={chartData?.payment_methods || {}} isLoading={isLoading} />
          <SuccessRateCard data={chartData?.order_statuses || {}} isLoading={isLoading} />
        </div>
        {/* Data Table */}
        <DataTable
        data={data}
        columns={columns}
        onRowClick={setSelectedItem}
        isLoading={isLoading}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onProductSearch={handleProductSearch}
        isSearchMode={isSearchMode}
        />
        

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </main>
    
  );
}
