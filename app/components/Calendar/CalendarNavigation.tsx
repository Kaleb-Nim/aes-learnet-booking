'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDisplayDate } from '../../lib/utils/dateUtils';

interface CalendarNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarNavigation({
  currentDate,
  onPreviousMonth,
  onNextMonth
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <button
        onClick={onPreviousMonth}
        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 px-2">
        {formatDisplayDate(currentDate)}
      </h2>
      
      <button
        onClick={onNextMonth}
        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}