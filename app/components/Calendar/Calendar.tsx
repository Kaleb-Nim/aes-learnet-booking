'use client';

import { CalendarProps } from '../../lib/types';
import { useCalendar } from '../../hooks/useCalendar';
import { getNextMonth, getPreviousMonth } from '../../lib/utils/dateUtils';
import CalendarNavigation from './CalendarNavigation';
import CalendarGrid from './CalendarGrid';

export default function Calendar({
  selectedDate,
  onDateSelect,
  bookings = [],
  onCreateBooking,
  onMultiDateBooking,
  onBookingClick,
  onMonthChange
}: CalendarProps) {
  const {
    currentDate,
    selectedDate: internalSelectedDate,
    calendarDays,
    goToNextMonth,
    goToPreviousMonth,
    selectDate
  } = useCalendar(selectedDate, bookings);

  const handleDateClick = (date: Date) => {
    selectDate(date);
    onDateSelect?.(date);
    onCreateBooking?.(date);
  };

  const handleNextMonth = () => {
    goToNextMonth();
    onMonthChange?.(getNextMonth(currentDate));
  };

  const handlePreviousMonth = () => {
    goToPreviousMonth();
    onMonthChange?.(getPreviousMonth(currentDate));
  };

  const currentSelectedDate = selectedDate || internalSelectedDate;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Header with room name */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AES Learnet Room Booking
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
          Click on an available date to book the room • Click on existing bookings to view details
        </p>
        
        {/* Multi-Date Booking Button */}
        {onMultiDateBooking && (
          <button
            onClick={onMultiDateBooking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Date Range
          </button>
        )}
      </div>

      {/* Calendar Navigation */}
      <CalendarNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        days={calendarDays}
        onDateClick={handleDateClick}
        onBookingClick={onBookingClick}
        selectedDate={currentSelectedDate}
      />

      {/* Legend */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Booked</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Today</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-blue-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Selected</span>
        </div>
      </div>
    </div>
  );
}