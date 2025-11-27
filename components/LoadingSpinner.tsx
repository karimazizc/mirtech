export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer ring */}
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#1a7faf]"></div>
        {/* Inner ring */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#64b5f6]" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-[#1a7faf] rounded-full"></div>
      </div>
      <p className="absolute mt-32 text-gray-600 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
