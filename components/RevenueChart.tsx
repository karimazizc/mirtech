"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  isLoading?: boolean;
  period?: string;
}

export default function RevenueChart({ data, isLoading, period }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], revenues: [] };

    // Data is already aggregated by day from backend
    const labels = data.map((item) => {
      const d = new Date(item.date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });
    
    const revenues = data.map((item) => item.revenue);

    return { labels, revenues };
  }, [data]);

  const totalRevenue = chartData.revenues.reduce((sum, rev) => sum + rev, 0);
  
  // Determine if period is longer than 3 months
  const isLongPeriod = period && ['6months', '9months', '1year'].includes(period);

  const chartJsData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue",
        data: chartData.revenues,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(26, 127, 175, 0.3)");
          gradient.addColorStop(1, "rgba(26, 127, 175, 0)");
          return gradient;
        },
        borderColor: "#1a7faf",
        borderWidth: 1,
        pointBackgroundColor: "#1a7faf",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: isLongPeriod ? 0 : 4,  // Hide points for long periods
        pointHoverRadius: isLongPeriod ? 0 : 6,  // Hide hover effect for long periods
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const value = context.parsed.y || 0;
            return `Revenue: ${value.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`;
          },
          title: function (context: TooltipItem<"line">[]) {
            return context[0].label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          callback: function (value: number | string) {
            const num = typeof value === "string" ? parseFloat(value) : value;
            if (num >= 1000) {
              return `$${(num / 1000).toFixed(0)}K`;
            }
            return `$${num}`;
          },
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isLongPeriod ? 10 : 7,  // More ticks for smoother long periods
        },
      },
    },
  };

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
          Revenue Overview
        </h3>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-black">
            {totalRevenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>

      <div className="relative h-64">
        <Line data={chartJsData} options={options} />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {chartData.labels[0]} - {chartData.labels[chartData.labels.length - 1]}
      </div>
    </div>
  );
}
