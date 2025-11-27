    "use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (item: any) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onProductSearch?: (searchQuery: string) => void;
  isSearchMode?: boolean;
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  minQty: string;
  maxQty: string;
  minTotal: string;
  maxTotal: string;
  status: string;
  paymentMethod: string;
}

export default function DataTable({
  data,
  columns,
  onRowClick,
  isLoading,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onProductSearch,
  isSearchMode = false,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    minQty: "",
    maxQty: "",
    minTotal: "",
    maxTotal: "",
    status: "",
    paymentMethod: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = 60;
  const BUFFER_SIZE = 10;

  // Get unique values for dropdowns
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(data.map(item => item.order_status).filter(Boolean)));
  }, [data]);

  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(data.map(item => item.transaction_payment_method).filter(Boolean)));
  }, [data]);

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      minQty: "",
      maxQty: "",
      minTotal: "",
      maxTotal: "",
      status: "",
      paymentMethod: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Handle product search
  const handleSearch = () => {
    if (onProductSearch) {
      if (searchInput.trim().length > 2) {
        onProductSearch(searchInput.trim());
      } else if (searchInput.trim().length === 0) {
        onProductSearch("");
      }
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = data;

    // Don't apply client-side search filter when in search mode (backend handles it)
    // Only use searchTerm for local filtering when NOT in product search mode
    if (searchTerm && !isSearchMode) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply price range filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter((item) => parseFloat(item.product_price) >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter((item) => parseFloat(item.product_price) <= maxPrice);
    }

    // Apply quantity range filter
    if (filters.minQty) {
      const minQty = parseInt(filters.minQty);
      result = result.filter((item) => parseInt(item.order_item_quantity) >= minQty);
    }
    if (filters.maxQty) {
      const maxQty = parseInt(filters.maxQty);
      result = result.filter((item) => parseInt(item.order_item_quantity) <= maxQty);
    }

    // Apply total range filter
    if (filters.minTotal) {
      const minTotal = parseFloat(filters.minTotal);
      result = result.filter((item) => parseFloat(item.order_total_amount) >= minTotal);
    }
    if (filters.maxTotal) {
      const maxTotal = parseFloat(filters.maxTotal);
      result = result.filter((item) => parseFloat(item.order_total_amount) <= maxTotal);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((item) => item.order_status === filters.status);
    }

    // Apply payment method filter
    if (filters.paymentMethod) {
      result = result.filter((item) => item.transaction_payment_method === filters.paymentMethod);
    }

    return result;
  }, [data, searchTerm, filters]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Virtual scrolling handler with infinite scroll detection
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      sortedData.length,
      start + Math.ceil(containerRef.current.clientHeight / ROW_HEIGHT) + BUFFER_SIZE * 2
    );

    setVisibleRange({ start, end });
    
    // Infinite scroll: load more when user is near bottom
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 300;
    if (scrolledToBottom && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [sortedData.length, hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const visibleData = sortedData.slice(visibleRange.start, visibleRange.end);
  const totalHeight = sortedData.length * ROW_HEIGHT;
  const offsetY = visibleRange.start * ROW_HEIGHT;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7faf]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar and Filter Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-3 items-center mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products by name across all records..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7faf] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {isSearchMode && (
              <div className="absolute right-3 top-2.5">
                <span className="text-xs bg-[#1a7faf] text-white px-2 py-1 rounded-full">
                  Product Search Active
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1a7faf] text-white rounded-lg hover:bg-[#409dc4] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              hasActiveFilters
                ? "bg-[#1a7faf] text-white border-[#1a7faf]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-[#1a7faf] text-xs font-bold px-2 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v !== "").length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter Options</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#1a7faf] hover:text-[#409dc4] flex items-center gap-1"
                >
                  <X size={16} />
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                </div>
              </div>

              {/* Quantity Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minQty}
                    onChange={(e) => setFilters({ ...filters, minQty: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxQty}
                    onChange={(e) => setFilters({ ...filters, maxQty: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                </div>
              </div>

              {/* Total Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minTotal}
                    onChange={(e) => setFilters({ ...filters, minTotal: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxTotal}
                    onChange={(e) => setFilters({ ...filters, maxTotal: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf]"
                >
                  <option value="">All Methods</option>
                  {uniquePaymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <p className="mt-3 text-sm text-gray-500">
          {isSearchMode 
            ? `Found ${sortedData.length} matching products` 
            : `Showing ${sortedData.length} of ${data.length} items`}
        </p>
      </div>

      {/* Table */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-auto"
        style={{ height: "calc(100vh - 300px)" }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <table className="w-full" style={{ transform: `translateY(${offsetY}px)` }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-[#1a7faf]">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleData.map((item, index) => {
                const handleRowClick = () => {
                  // Check if item has product_id and redirect to product detail page
                  if (item.product_id) {
                    window.location.href = `/home/product/${item.product_id}`;
                  } else {
                    onRowClick?.(item);
                  }
                };
                
                return (
                  <tr
                    key={visibleRange.start + index}
                    onClick={handleRowClick}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {typeof item[column.key] === "object"
                          ? JSON.stringify(item[column.key])
                          : String(item[column.key] ?? "-").substring(0, 50)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Infinite scroll loading indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a7faf]"></div>
              <span className="ml-3 text-gray-600">Loading more records...</span>
            </div>
          )}
          
          {/* End of data message */}
          {!hasMore && data.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No more records to load
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
