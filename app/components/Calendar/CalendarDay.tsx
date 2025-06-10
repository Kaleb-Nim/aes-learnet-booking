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
  
  // Style classes based on day state
  const baseClasses = "min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 dark:border-gray-700 transition-all duration-200";
  
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
      {/* Day number */}
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className={`text-xs sm:text-sm font-medium ${
          isToday 
            ? 'text-blue-600 dark:text-blue-400' 
            : isCurrentMonth 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-400'
        }`}>
          {dayNumber}
        </span>
        
        {/* Availability indicator - hide on mobile for space */}
        {isCurrentMonth && (
          <div className="hidden sm:flex items-center">
            {isAvailable ? (
              <Calendar className="w-3 h-3 text-green-500" />
            ) : bookings.length > 0 ? (
              <Clock className="w-3 h-3 text-red-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Bookings list */}
      {isCurrentMonth && bookings.length > 0 && (
        <div className="space-y-0.5 sm:space-y-1">
          {/* Mobile: Show only 1 booking, Desktop: Show 2 */}
          <div className="block sm:hidden">
            {bookings.slice(0, 1).map((booking) => {
              const colors = getBookingColors(booking);
              return (
                <div
                  key={booking.booking_id}
                  className={`text-[10px] p-0.5 ${colors.background} ${colors.text} rounded truncate cursor-pointer ${colors.hover} transition-colors`}
                  title={`${booking.event_name} - ${formatTimeRange(booking.start_time, booking.end_time)} - ${booking.room_name || `Room ${booking.room_id}`}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick?.(booking);
                  }}
                >
                  <div className="font-medium truncate">{booking.event_name}</div>
                  <div className="text-[8px] opacity-75 truncate">{booking.room_id}</div>
                </div>
              );
            })}
            {bookings.length > 1 && (
              <div 
                className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookingClick?.(bookings[1]); // Show second booking
                }}
              >
                +{bookings.length - 1} more
              </div>
            )}
          </div>
          
          {/* Desktop: Show 2 bookings with time */}
          <div className="hidden sm:block">
            {bookings.slice(0, 2).map((booking) => {
              const colors = getBookingColors(booking);
              return (
                <div
                  key={booking.booking_id}
                  className={`text-xs p-1 ${colors.background} ${colors.text} rounded truncate mb-1 cursor-pointer ${colors.hover} transition-colors`}
                  title={`${booking.event_name} - ${formatTimeRange(booking.start_time, booking.end_time)} - ${booking.room_name || `Room ${booking.room_id}`}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick?.(booking);
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-medium truncate flex-1">{booking.event_name}</div>
                    <div className="text-[10px] opacity-75 flex-shrink-0">{booking.room_id}</div>
                  </div>
                  <div className={colors.timeText}>
                    {formatTimeRange(booking.start_time, booking.end_time)}
                  </div>
                </div>
              );
            })}
            {bookings.length > 2 && (
              <div 
                className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookingClick?.(bookings[2]); // Show third booking
                }}
              >
                +{bookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available slot indicator */}
      {isAvailable && isCurrentMonth && (
        <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
          <span className="hidden sm:inline">Available</span>
          <span className="sm:hidden">•</span>
        </div>
      )}
      
      {/* Room status indicator when there are bookings */}
      {isCurrentMonth && bookings.length > 0 && (
        <div className="mt-1 text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">
          {(() => {
            const bookedRooms = [...new Set(bookings.map(b => b.room_id))];
            const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
            
            if (availableRooms.length > 0) {
              return (
                <span className="text-green-600 dark:text-green-400">
                  {availableRooms.join(', ')} free
                </span>
              );
            } else {
              return (
                <span className="text-red-600 dark:text-red-400">
                  All rooms booked
                </span>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}