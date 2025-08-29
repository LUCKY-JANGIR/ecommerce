'use client';

import { useState } from 'react';
import { useAsync, useFormSubmit } from '@/hooks/useAsync';
import { productsAPI } from '@/components/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';


export default function ErrorHandlingExample() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Example 1: Data fetching with error handling
  const { data, loading, error, execute } = useAsync(
    () => productsAPI.getAll({ limit: 5 }),
    true // Execute immediately
  );

  // Example 2: Form submission with error handling
  const { handleSubmit, loading: submitLoading, error: submitError } = useFormSubmit(
    async (...args: unknown[]) => {
      const formData = args[0] as { shouldFail: boolean };
      // Simulate an API call that might fail
      if (formData.shouldFail) {
        throw new Error('This is a simulated error');
      }
      return { success: true, message: 'Form submitted successfully!' };
    },
    () => {
      alert('Form submitted successfully!');
    },
    () => {
      // Error handled silently
    }
  );

  // Example 3: Manual error throwing
  const throwError = () => {
    setShouldThrowError(true);
  };

  if (shouldThrowError) {
    throw new Error('This is a component error that will be caught by ErrorBoundary');
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">Error Handling Examples</h1>

      {/* Example 1: Data Fetching */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">1. Data Fetching with Error Handling</h2>
        
        {loading && (
          <div className="flex items-center space-x-2 text-gray-300">
            <LoadingSpinner size="sm" />
            <span>Loading products...</span>
          </div>
        )}

        {error && (
          <ErrorMessage 
            error={error} 
            showRetry={true} 
            onRetry={execute}
            className="mb-4"
          />
        )}

        {data && (
          <div className="text-green-400">
            <p>Successfully loaded {data.data?.products?.length || 0} products</p>
            <button
              onClick={execute}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Example 2: Form Submission */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">2. Form Submission with Error Handling</h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit({
            shouldFail: formData.get('shouldFail') === 'true'
          });
        }}>
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  name="shouldFail"
                  value="true"
                  className="mr-2"
                />
                Simulate error
              </label>
            </div>

            {submitError && (
              <ErrorMessage error={submitError} />
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Form'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Example 3: Component Error */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">3. Component Error (ErrorBoundary)</h2>
        <p className="text-gray-300 mb-4">
          Click the button below to throw an error that will be caught by the ErrorBoundary:
        </p>
        <button
          onClick={throwError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Throw Component Error
        </button>
      </div>

      {/* Example 4: Network Error Simulation */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">4. Network Error Simulation</h2>
        <p className="text-gray-300 mb-4">
          Test network error handling by calling a non-existent endpoint:
        </p>
        <button
          onClick={async () => {
            try {
              await fetch('/api/non-existent-endpoint');
            } catch (error) {
              console.error('Network error:', error);
              alert('Network error caught! Check console for details.');
            }
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Test Network Error
        </button>
      </div>
    </div>
  );
} 