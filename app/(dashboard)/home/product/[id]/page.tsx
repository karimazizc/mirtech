"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft, Package, DollarSign, ShoppingCart, TrendingUp, CreditCard, CheckCircle2 } from "lucide-react";

interface Product {
  product_id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

interface Analytics {
  total_revenue: number;
  total_orders: number;
  total_transactions: number;
  total_quantity_sold: number;
  avg_order_value: number;
  payment_methods: Record<string, number>;
  order_statuses: Record<string, number>;
  transaction_statuses: Record<string, number>;
}

interface ProductData {
  product: Product;
  analytics: Analytics;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [data, setData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/product/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProductData} />;
  }

  if (isLoading || !data) {
    return (
        <main className="flex-1 ml-5 p-8">
          <LoadingSpinner />
        </main>
    );
  }

  const { product, analytics } = data;

  // Calculate payment method percentages
  const totalPayments = Object.values(analytics.payment_methods).reduce((a, b) => a + b, 0);
  const paymentMethodsArray = Object.entries(analytics.payment_methods).map(([method, count]) => ({
    method,
    count,
    percentage: (count / totalPayments) * 100
  }));

  // Get completion rate
  const completedOrders = analytics.order_statuses['delivered'] || 0;
  const completionRate = (completedOrders / analytics.total_orders) * 100;

  return (
      
      <main className="flex-1 ml-5 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1a7faf] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className="flex items-center gap-1">
                  <Package size={16} />
                  Stock: {product.stock}
                </span>
                
                <span className={product.rating >= 3 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  Rating: {product.rating?.toFixed(1) || 'N/A'}/5
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-3xl font-bold text-[#1a7faf]">
                ${product.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${analytics.total_revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign size={32} className="text-[#1a7faf]" />}
            isLoading={false}
          />
          <StatCard
            title="Total Orders"
            value={analytics.total_orders.toLocaleString()}
            icon={<ShoppingCart size={32} className="text-[#1a7faf]" />}
            isLoading={false}
          />
          <StatCard
            title="Units Sold"
            value={analytics.total_quantity_sold.toLocaleString()}
            icon={<Package size={32} className="text-[#1a7faf]" />}
            isLoading={false}
          />
          <StatCard
            title="Avg Order Value"
            value={`$${analytics.avg_order_value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<TrendingUp size={32} className="text-[#1a7faf]" />}
            isLoading={false}
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <CreditCard size={24} className="text-[#1a7faf]" />
              Payment Methods
            </h2>
            <div className="space-y-4">
              {paymentMethodsArray.map((pm, index) => (
                <div key={pm.method}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {pm.method}
                    </span>
                    <span className="text-sm text-gray-600">
                      {pm.count} ({pm.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${pm.percentage}%`,
                        backgroundColor: ['#1a7faf', '#409dc4', '#6cb3d1', '#98c9de', '#c4dfeb'][index % 5]
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-[#1a7faf]" />
              Order Status Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.order_statuses).map(([status, count]) => {
                const percentage = (count / analytics.total_orders) * 100;
                const statusColors: Record<string, string> = {
                  'delivered': 'bg-green-100 text-green-800',
                  'pending': 'bg-yellow-100 text-yellow-800',
                  'processing': 'bg-blue-100 text-blue-800',
                  'shipped': 'bg-purple-100 text-purple-800',
                  'cancelled': 'bg-red-100 text-red-800'
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        statusColors[status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-4">Transaction Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.transaction_statuses).map(([status, count]) => {
              const percentage = (count / analytics.total_transactions) * 100;
              const statusConfig: Record<string, { color: string; icon: string }> = {
                'completed': { color: 'text-green-600', icon: '✓' },
                'pending': { color: 'text-yellow-600', icon: 'o' },
                'failed': { color: 'text-red-600', icon: '✗' }
              };
              const config = statusConfig[status] || { color: 'text-gray-600', icon: '•' };
              
              return (
                <div key={status} className="border border-gray-200 rounded-lg p-4">
                  <div className={`text-sm font-medium mb-2 capitalize ${config.color}`}>
                    {config.icon} {status}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of transactions
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 bg-linear-to-r from-[#1a7faf] to-[#409dc4] rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-90">Completion Rate</div>
              <div className="text-3xl font-bold">{completionRate.toFixed(1)}%</div>
              <div className="text-xs opacity-75 mt-1">
                {completedOrders} of {analytics.total_orders} orders delivered
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">Total Transactions</div>
              <div className="text-3xl font-bold">{analytics.total_transactions}</div>
              <div className="text-xs opacity-75 mt-1">
                Across {analytics.total_orders} orders
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">Product ID</div>
              <div className="text-sm font-mono mt-2 bg-white/20 px-3 py-2 rounded">
                {product.product_id}
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}