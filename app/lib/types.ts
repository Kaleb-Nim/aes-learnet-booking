export interface Room {
  id: string; // '1-21', '1-17'
  name: string;
  description?: string;
  capacity?: number;
  color_base_hue: number; // Base hue for room's color spectrum
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  room_id: string; // References Room.id
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  color_hue: number; // HSL hue value (0-359) within room's spectrum
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  date: string; // YYYY-MM-DD format
  created_at: string;
  updated_at: string;
}

// Combined view for UI usage (from booking_details view)
export interface BookingWithEventDetails {
  booking_id: string;
  event_id: string;
  date: string;
  booking_created_at: string;
  booking_updated_at: string;
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string;
  end_time: string;
  color_hue: number;
  event_created_at: string;
  event_updated_at: string;
  time_range: string; // Formatted "HH:MM-HH:MM"
  // Room details
  room_id: string;
  room_name: string;
  room_description?: string;
  room_capacity?: number;
  room_base_hue: number;
}

export interface EventFormData {
  room_id: string; // Required room selection
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string;
  end_time: string;
  color_hue?: number; // Auto-generated if not provided
}

export interface BookingFormData {
  room_id: string; // Required room selection
  date: string;
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string;
  end_time: string;
  // For editing existing events
  event_id?: string;
  is_new_event?: boolean;
}

export interface MultiDateBookingFormData {
  room_id: string; // Required room selection
  dates: string[];
  start_date?: string; // For date range picker
  end_date?: string; // For date range picker
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string;
  end_time: string;
}

export interface CreateEventWithBookingsData {
  event: EventFormData;
  dates: string[];
}

// Room-specific interfaces
export interface RoomFormData {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  color_base_hue: number;
  is_active?: boolean;
}

export interface RoomUtilization {
  room_id: string;
  room_name: string;
  total_events: number;
  total_bookings: number;
  upcoming_bookings: number;
  first_booking_date?: string;
  last_booking_date?: string;
}

// For updating events with cascading to all bookings
export interface UpdateEventData {
  event_id: string;
  room_id?: string;
  event_name?: string;
  poc_name?: string;
  phone_number?: string;
  start_time?: string;
  end_time?: string;
  color_hue?: number;
}

// For deleting events (cascades to all bookings)
export interface DeleteEventData {
  event_id: string;
  event_name: string; // For confirmation
  room_id: string; // For context
}

// Room-specific availability checking
export interface RoomAvailabilityCheck {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  exclude_event_id?: string;
}

// Multi-room availability response
export interface MultiRoomAvailability {
  available_rooms: string[];
  unavailable_rooms: string[];
  conflicts: Record<string, BookingWithEventDetails[]>;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: BookingWithEventDetails[];
  isAvailable: boolean;
}

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  bookings?: BookingWithEventDetails[];
  selectedRoom?: string; // Filter by room
  onCreateBooking?: (date: Date, roomId?: string) => void;
  onBookingClick?: (booking: BookingWithEventDetails) => void;
  onMonthChange?: (date: Date) => void;
  onRoomChange?: (roomId: string) => void;
}

// Color utilities - imported from colorUtils
export type { EventColor, RoomColorScheme } from './utils/colorUtils';

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Room-specific API responses
export interface RoomBookingsResponse {
  room: Room;
  bookings: BookingWithEventDetails[];
  utilization: RoomUtilization;
}

export interface AllRoomsResponse {
  rooms: Room[];
  total_bookings: number;
  total_events: number;
}

export interface EventWithBookings extends Event {
  bookings: Booking[];
  booking_count: number;
  first_booking_date?: string;
  last_booking_date?: string;
  room?: Room; // Include room details
}

export interface RoomWithEvents extends Room {
  events: Event[];
  total_events: number;
  total_bookings: number;
  upcoming_bookings: number;
}

// Room filter options
export interface RoomFilter {
  room_id?: string;
  include_inactive?: boolean;
  sort_by?: 'id' | 'name' | 'capacity' | 'utilization';
  sort_order?: 'asc' | 'desc';
}

// Legacy type aliases for backward compatibility
export type LegacyBooking = BookingWithEventDetails;
export type LegacyBookingFormData = Omit<BookingFormData, 'room_id'> & { room_id?: string };