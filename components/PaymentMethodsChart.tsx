"use client";

import { useMemo } from "react";

interface PaymentMethodsChartProps {
  data: Record<string, number>;
  isLoading?: boolean;
}

export default function PaymentMethodsChart({
  data,
  isLoading,
}: PaymentMethodsChartProps) {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    // Data is already aggregated from backend
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    const colors = ["#1a7faf", "#409dc4", "#6cb3d1", "#98c9de", "#c4dfeb"];

    return Object.entries(data)
      .map(([method, count]: [string, number]) => ({
        method,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
      .map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
  }, [data]);

  const totalTransactions = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Payment Methods
        </h3>
        <p className="text-3xl font-bold text-black">
          {totalTransactions.toLocaleString()}
        </p>
        <span className="text-sm text-gray-600">Total Transactions</span>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.method}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-black">
                  {item.percentage}%
                </span>{" "}
                ({item.count.toLocaleString()})
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Most Popular</span>
            <span className="font-semibold text-black capitalize">
              {chartData[0].method} ({chartData[0].percentage}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
