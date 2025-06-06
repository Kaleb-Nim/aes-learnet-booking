import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  isSameDay,
  parseISO
} from 'date-fns';
import { Booking, CalendarDay } from '../types';

export const formatDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString);
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const formatTime = (time: string): string => {
  return format(new Date(`2000-01-01T${time}`), 'h:mm a');
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getCalendarDays = (currentDate: Date, bookings: Booking[] = []): CalendarDay[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map(date => {
    const dateString = formatDate(date);
    const dayBookings = bookings.filter(booking => booking.date === dateString);
    
    return {
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      bookings: dayBookings,
      isAvailable: dayBookings.length === 0 && date >= new Date()
    };
  });
};

export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseBookingDate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const isSameDateAs = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};

export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};