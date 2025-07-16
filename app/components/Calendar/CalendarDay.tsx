'use client';

import { CalendarDay as CalendarDayType } from '../../lib/types';
import { formatTimeRange } from '../../lib/utils/dateUtils';
import { getRoomScheme } from '../../lib/utils/colorUtils';
import { Calendar, Clock } from 'lucide-react';

interface CalendarDayProps {
  day: CalendarDayType;
  onDateClick: (date: Date) => void;
  onBookingClick?: (booking: any) => void;
  isSelected?: boolean;
}

export default function CalendarDay({ day, onDateClick, onBookingClick, isSelected }: CalendarDayProps) {
  const { date, isCurrentMonth, isToday, bookings, isAvailable } = day;
  
  const handleClick = () => {
    if (isAvailable && isCurrentMonth) {
      onDateClick(date);
    }
  };

  const dayNumber = date.getDate();
  
  // Get room-based colors for bookings
  const getBookingColors = (booking: any) => {
    const roomScheme = getRoomScheme(booking.room_id);
    
    if (!roomScheme) {
      // Fallback to neutral colors for unknown rooms
      return {
        background: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        hover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
        timeText: 'text-gray-600 dark:text-gray-300'
      };
    }
    
    if (roomScheme.roomId === '1-21') {
      // Room 1-21 (Red spectrum)
      return {
        background: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-200',
        hover: 'hover:bg-red-200 dark:hover:bg-red-800/40',
        timeText: 'text-red-600 dark:text-red-300'
      };
    } else if (roomScheme.roomId === '1-17') {
      // Room 1-17 (Blue spectrum)
      return {
        background: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-200',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/40',
        timeText: 'text-blue-600 dark:text-blue-300'
      };
    }
    
    // Fallback
    return {
      background: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      hover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      timeText: 'text-gray-600 dark:text-gray-300'
    };
  };
  
  // Style classes based on day state - optimized for 70% content allocation
  const baseClasses = "min-h-[90px] sm:min-h-[100px] p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 transition-all duration-200 relative flex flex-col";
  
  let dayClasses = baseClasses;
  
  if (!isCurrentMonth) {
    dayClasses += " bg-gray-50 dark:bg-gray-900 text-gray-400";
  } else if (isToday) {
    dayClasses += " bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700";
  } else {
    dayClasses += " bg-white dark:bg-gray-800";
  }
  
  if (isSelected) {
    dayClasses += " ring-2 ring-blue-500 dark:ring-blue-400";
  }
  
  if (isAvailable && isCurrentMonth) {
    dayClasses += " cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-600 active:bg-blue-100 dark:active:bg-blue-900/20 touch-manipulation";
  } else if (!isAvailable && isCurrentMonth) {
    dayClasses += " bg-red-50 dark:bg-red-900/20";
  }

  return (
    <div className={dayClasses} onClick={handleClick}>
      {/* Compact header - 15% of space */}
      <div className="flex items-center justify-between mb-1 h-[14px] sm:h-[15px]">
        <span className={`text-xs font-medium ${
          isToday 
            ? 'text-blue-600 dark:text-blue-400' 
            : isCurrentMonth 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-400'
        }`}>
          {dayNumber}
        </span>
        
        {/* Minimal availability indicator */}
        {isCurrentMonth && bookings.length === 0 && (
          <Calendar className="w-3 h-3 text-green-500" />
        )}
      </div>

      {/* Bookings content area - 70% of space, optimized for mobile */}
      {isCurrentMonth && bookings.length > 0 && (
        <div className="flex-1 min-h-[60px] sm:min-h-[65px] flex flex-col justify-start">
          {/* Always show all bookings up to 2 - mobile optimized */}
          <div className="space-y-0.5 flex-1">
            {bookings.slice(0, 2).map((booking, index) => {
              const colors = getBookingColors(booking);
              // Use more compact layout on mobile when 2 bookings present
              const isCompactMobile = bookings.length === 2;
              return (
                <div
                  key={booking.booking_id}
                  className={`${
                    isCompactMobile 
                      ? 'text-[9px] sm:text-xs p-0.5 sm:p-1.5' 
                      : 'text-[10px] sm:text-xs p-1 sm:p-1.5'
                  } ${colors.background} ${colors.text} rounded cursor-pointer ${colors.hover} transition-colors`}
                  title={`${booking.event_name} - ${formatTimeRange(booking.start_time, booking.end_time)} - ${booking.room_name || `Room ${booking.room_id}`}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick?.(booking);
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className={`font-medium truncate flex-1 ${
                      isCompactMobile ? 'text-[9px] sm:text-xs' : 'text-[10px] sm:text-xs'
                    }`}>
                      {booking.event_name}
                    </div>
                    <div className={`opacity-75 flex-shrink-0 font-medium ${
                      isCompactMobile ? 'text-[8px] sm:text-[10px]' : 'text-[8px] sm:text-[10px]'
                    }`}>
                      {booking.room_id}
                    </div>
                  </div>
                  <div className={`${colors.timeText} leading-tight ${
                    isCompactMobile ? 'text-[7px] sm:text-[10px]' : 'text-[8px] sm:text-[10px]'
                  }`}>
                    {formatTimeRange(booking.start_time, booking.end_time)}
                  </div>
                </div>
              );
            })}
            {bookings.length > 2 && (
              <div 
                className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 text-center py-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookingClick?.(bookings[2]);
                }}
              >
                +{bookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact availability indicator - 15% of space */}
      {isCurrentMonth && (
        <div className="mt-auto">
          {(() => {
            if (bookings.length === 0) {
              // No bookings - show compact "Available" button
              return (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-1 rounded text-[9px] sm:text-[10px] font-medium text-center border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                  <span className="sm:hidden">Tap to Book</span>
                  <span className="hidden sm:inline">Available</span>
                </div>
              );
            } else {
              // Has bookings - show available room indicator (simplified)
              const bookedRooms = [...new Set(bookings.map(b => b.room_id))];
              const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
              
              if (availableRooms.length > 0) {
                return (
                  <div className="text-green-700 dark:text-green-300 px-1.5 py-1 rounded text-[9px] sm:text-[10px] font-medium text-center border border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
                    {availableRooms[0]}
                  </div>
                );
              }
              // If both rooms booked, no bottom indicator needed
              return null;
            }
          })()}
        </div>
      )}
    </div>
  );
}