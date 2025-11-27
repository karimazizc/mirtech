interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-black mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-[#1a7faf] text-white rounded-lg hover:bg-[#409dc4] transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
