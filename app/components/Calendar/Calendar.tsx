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
          Click on any date to book an available room • Click on existing bookings to view details
        </p>
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
          <span className="text-gray-700 dark:text-gray-300">Available Rooms</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Room 1-21</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Room 1-17</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded ring-2 ring-blue-500"></div>
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