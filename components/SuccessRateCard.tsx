"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface SuccessRateCardProps {
  data: Record<string, number>;
  isLoading?: boolean;
}

export default function SuccessRateCard({
  data,
  isLoading,
}: SuccessRateCardProps) {
  const stats = useMemo(() => {
    if (!data || Object.keys(data).length === 0)
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        successRate: 0,
      };

    // Data is already aggregated from backend (order statuses)
    const completed = data['delivered'] || 0;
    const failed = data['cancelled'] || 0;
    const pending = (data['pending'] || 0) + (data['processing'] || 0) + (data['shipped'] || 0);
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    return {
      total,
      completed,
      failed,
      pending,
      successRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-4">Success Rate</h3>

      {/* Main success rate display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-5xl font-bold text-black">
            {stats.successRate.toFixed(2)}
            <span className="text-2xl">%</span>
          </p>
          {stats.successRate >= 90 && (
            <span className="text-sm text-green-600 font-medium">
              Excellent
            </span>
          )}
          {stats.successRate >= 75 && stats.successRate < 90 && (
            <span className="text-sm text-blue-600 font-medium">Good</span>
          )}
          {stats.successRate < 75 && (
            <span className="text-sm text-orange-600 font-medium">
              Needs attention
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {stats.completed.toLocaleString()} of{" "}
          {stats.total.toLocaleString()} transactions successful
        </p>
      </div>

      {/* Visual progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-[#1a7faf] rounded-full transition-all duration-500"
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Completed
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.completed.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Failed</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.failed.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Pending</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.pending.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
