'use client';

import { Loader2, Calendar, Clock } from 'lucide-react';

// Basic spinner component
export const Spinner = ({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
      aria-label="Loading"
    />
  );
};

// Loading overlay for components
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = 'Loading...',
  className = ''
}: {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Full page loading screen
export const PageLoader = ({ message = 'Loading AES Learnet Room Booking...' }: { 
  message?: string; 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <Spinner 
              size="lg" 
              className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400" 
            />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {message}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load your booking information...
        </p>
      </div>
    </div>
  );
};

// Calendar skeleton loader
export const CalendarSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-80 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-96 mx-auto mb-3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 mx-auto"></div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-32"></div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-2 sm:p-3 text-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-6 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-6 mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking form skeleton
export const BookingFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>

      {/* Time slots */}
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Form fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
      </div>
    </div>
  );
};

// Inline loading states
export const InlineLoader = ({ 
  text = 'Loading...', 
  size = 'sm' 
}: { 
  text?: string; 
  size?: 'sm' | 'md'; 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
};

// Button loading state
export const ButtonLoader = ({ 
  isLoading, 
  children, 
  loadingText 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        {loadingText && <span>{loadingText}</span>}
      </div>
    );
  }
  return <>{children}</>;
};

// Error state component
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  retryText = 'Try Again'
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}) => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  title = 'No bookings found',
  message = 'There are no bookings to display.',
  action,
  actionText = 'Create Booking'
}: {
  title?: string;
  message?: string;
  action?: () => void;
  actionText?: string;
}) => {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};