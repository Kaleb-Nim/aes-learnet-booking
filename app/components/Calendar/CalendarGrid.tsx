'use client';

import { CalendarDay as CalendarDayType } from '../../lib/types';
import CalendarDay from './CalendarDay';

interface CalendarGridProps {
  days: CalendarDayType[];
  onDateClick: (date: Date) => void;
  onBookingClick?: (booking: any) => void;
  selectedDate?: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ days, onDateClick, onBookingClick, selectedDate }: CalendarGridProps) {
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <CalendarDay
            key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
            day={day}
            onDateClick={onDateClick}
            onBookingClick={onBookingClick}
            isSelected={isDateSelected(day.date)}
          />
        ))}
      </div>
    </div>
  );
}