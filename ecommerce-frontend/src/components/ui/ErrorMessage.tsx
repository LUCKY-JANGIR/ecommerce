import { CustomError } from '@/lib/errorHandler';

interface ErrorMessageProps {
  error: CustomError | Error | string | null;
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  error, 
  className = '', 
  showRetry = false, 
  onRetry 
}: ErrorMessageProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {message}
          </h3>
          {showRetry && onRetry && (
            <div className="mt-2">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-800 hover:text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 