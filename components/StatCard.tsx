"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  changePercent?: number | null;
  isLoading?: boolean;
  period?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  changePercent,
  isLoading,
  period,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
    const periods = [
    { value: "week", label: "week" },
    { value: "2weeks", label: "2 Weeks" },
    { value: "month", label: "1 Month" },
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "9months", label: "9 Months" },
    { value: "1year", label: "1 Year" },
  ];

  // Determine if change is positive, negative, or neutral
  const isPositive = changePercent !== null && changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== null && changePercent !== undefined && changePercent < 0;
  const hasChange = changePercent !== null && changePercent !== undefined && changePercent !== 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
          
          {/* Display change percent if available */}
          {hasChange && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600"
                }`}
              >
                {isPositive ? "↑" : isNegative ? "↓" : "−"} {Math.abs(changePercent!).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last {periods.find(p => p.value === period)?.label}</span>
            </div>
          )}
          
          {/* Fallback to trend if no changePercent but trend is provided */}
          {!hasChange && trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {icon}
      </div>
    </div>
  );
}
