"use client";

import { useMemo } from "react";
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

interface TransactionTimelineChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  isLoading?: boolean;
  period?: string;
}

export default function TransactionTimelineChart({
  data,
  isLoading,
  period,
}: TransactionTimelineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], counts: [] };

    // Data is already aggregated by day from backend
    const labels = data.map((item) => {
      const d = new Date(item.date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });
    
    const counts = data.map((item) => item.count);

    return { labels, counts };
  }, [data]);

  const totalTransactions = chartData.counts.reduce((sum, count) => sum + count, 0);
  const peakDay = Math.max(...chartData.counts, 0);
  
  // Determine if period is longer than 3 months
  const isLongPeriod = period && ['6months', '9months', '1year'].includes(period);

  const chartJsData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Transactions",
        data: chartData.counts,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(64, 157, 196, 0.3)");
          gradient.addColorStop(1, "rgba(64, 157, 196, 0)");
          return gradient;
        },
        borderColor: "#409dc4",
        borderWidth: 1,
        pointBackgroundColor: "#409dc4",
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
            return `Transactions: ${value.toLocaleString()}`;
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
            return num.toLocaleString();
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
          Transaction Timeline
        </h3>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-black">
            {totalTransactions.toLocaleString()}
          </p>
          <span className="text-sm text-gray-600">
            Peak: {peakDay.toLocaleString()} transactions/day
          </span>
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
