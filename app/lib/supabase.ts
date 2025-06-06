import { createClient } from '@supabase/supabase-js';
import { Booking, BookingFormData, MultiDateBookingFormData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          event_name: string;
          poc_name: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          event_name: string;
          poc_name: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          event_name?: string;
          poc_name?: string;
          phone_number?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

// API Functions for booking operations
export class BookingAPI {
  
  /**
   * Get all bookings for a specific month
   */
  static async getBookingsForMonth(year: number, month: number): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_bookings_for_month', {
          target_year: year,
          target_month: month
        });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error(`Failed to fetch bookings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings (fallback if RPC function not available)
   */
  static async getAllBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching all bookings:', error);
        throw new Error(`Failed to fetch bookings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific date
   */
  static async getBookingsForDate(date: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching bookings for date:', error);
        throw new Error(`Failed to fetch bookings for date: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get bookings for date error:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available
   */
  static async isTimeSlotAvailable(
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    try {
      // Try using the database function first
      const { data, error } = await supabase
        .rpc('is_time_slot_available', {
          booking_date: date,
          booking_start_time: startTime,
          booking_end_time: endTime
        });

      if (error) {
        // Fallback to manual checking
        console.warn('RPC function not available, using fallback method');
        return this.checkAvailabilityFallback(date, startTime, endTime, excludeBookingId);
      }

      return data;
    } catch (error) {
      console.error('Availability check error:', error);
      // Fallback to manual checking
      return this.checkAvailabilityFallback(date, startTime, endTime, excludeBookingId);
    }
  }

  /**
   * Fallback method to check availability
   */
  private static async checkAvailabilityFallback(
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    const existingBookings = await this.getBookingsForDate(date);
    
    const requestStart = new Date(`2000-01-01T${startTime}`);
    const requestEnd = new Date(`2000-01-01T${endTime}`);

    for (const booking of existingBookings) {
      if (excludeBookingId && booking.id === excludeBookingId) {
        continue; // Skip the booking being updated
      }

      const bookingStart = new Date(`2000-01-01T${booking.start_time}`);
      const bookingEnd = new Date(`2000-01-01T${booking.end_time}`);

      // Check for overlap
      if (
        (requestStart <= bookingStart && requestEnd > bookingStart) ||
        (requestStart < bookingEnd && requestEnd >= bookingEnd) ||
        (requestStart >= bookingStart && requestEnd <= bookingEnd)
      ) {
        return false; // Conflict found
      }
    }

    return true; // No conflicts
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingFormData): Promise<Booking> {
    try {
      // First check availability
      const isAvailable = await this.isTimeSlotAvailable(
        bookingData.date,
        bookingData.start_time,
        bookingData.end_time
      );

      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          date: bookingData.date,
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          event_name: bookingData.event_name,
          poc_name: bookingData.poc_name,
          phone_number: bookingData.phone_number || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error(`Failed to create booking: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  static async updateBooking(id: string, updates: Partial<BookingFormData>): Promise<Booking> {
    try {
      // Check availability if time/date is being updated
      if (updates.date || updates.start_time || updates.end_time) {
        const currentBooking = await this.getBookingById(id);
        const isAvailable = await this.isTimeSlotAvailable(
          updates.date || currentBooking.date,
          updates.start_time || currentBooking.start_time,
          updates.end_time || currentBooking.end_time,
          id
        );

        if (!isAvailable) {
          throw new Error('The selected time slot is not available');
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          phone_number: updates.phone_number || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw new Error(`Failed to update booking: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        throw new Error(`Failed to delete booking: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      throw error;
    }
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(id: string): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        throw new Error(`Failed to fetch booking: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Create multiple bookings for the same event across different dates
   */
  static async createMultiDateBooking(bookingData: MultiDateBookingFormData): Promise<Booking[]> {
    try {
      // Check availability for all dates
      const availabilityChecks = await Promise.all(
        bookingData.dates.map(date => 
          this.isTimeSlotAvailable(date, bookingData.start_time, bookingData.end_time)
        )
      );

      const unavailableDates = bookingData.dates.filter((_, index) => !availabilityChecks[index]);
      
      if (unavailableDates.length > 0) {
        throw new Error(`The following dates are not available: ${unavailableDates.join(', ')}`);
      }

      // Create booking records for all dates
      const bookingRecords = bookingData.dates.map(date => ({
        date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        event_name: bookingData.event_name,
        poc_name: bookingData.poc_name,
        phone_number: bookingData.phone_number || null
      }));

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingRecords)
        .select();

      if (error) {
        console.error('Error creating multi-date booking:', error);
        throw new Error(`Failed to create multi-date booking: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Create multi-date booking error:', error);
      throw error;
    }
  }

  /**
   * Check availability for multiple dates
   */
  static async checkMultiDateAvailability(
    dates: string[],
    startTime: string,
    endTime: string
  ): Promise<{ available: string[]; unavailable: string[] }> {
    try {
      const availabilityChecks = await Promise.all(
        dates.map(async (date) => ({
          date,
          available: await this.isTimeSlotAvailable(date, startTime, endTime)
        }))
      );

      const available = availabilityChecks
        .filter(check => check.available)
        .map(check => check.date);

      const unavailable = availabilityChecks
        .filter(check => !check.available)
        .map(check => check.date);

      return { available, unavailable };
    } catch (error) {
      console.error('Multi-date availability check error:', error);
      throw error;
    }
  }
}