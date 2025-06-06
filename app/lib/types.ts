export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  event_name: string;
  poc_name: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  date: string;
  start_time: string;
  end_time: string;
  event_name: string;
  poc_name: string;
  phone_number?: string;
}

export interface MultiDateBookingFormData {
  dates: string[];
  start_time: string;
  end_time: string;
  event_name: string;
  poc_name: string;
  phone_number?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
  isAvailable: boolean;
}

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  bookings?: Booking[];
  onCreateBooking?: (date: Date) => void;
  onMultiDateBooking?: () => void;
  onBookingClick?: (booking: Booking) => void;
}