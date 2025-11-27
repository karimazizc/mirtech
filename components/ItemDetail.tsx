"use client";

interface ItemDetailProps {
  item: any;
  onClose: () => void;
}

export default function ItemDetail({ item, onClose }: ItemDetailProps) {
  if (!item) return null;

  const fields = Object.entries(item).filter(
    ([key]) => !key.includes("_id") || key === "product_id" || key === "user_id"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#1a7faf]">
          <h2 className="text-2xl font-bold text-white">Item Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#409dc4] rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(([key, value]) => (
              <div
                key={key}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#1a7faf] transition-colors"
              >
                <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-base text-black wrap-break-word">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value ?? "N/A")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(item, null, 2));
              alert("Item data copied to clipboard!");
            }}
            className="px-6 py-2 bg-[#1a7faf] text-white rounded-lg hover:bg-[#409dc4] transition-colors font-medium"
          >
            Copy Data
          </button>
        </div>
      </div>
    </div>
  );
}
