import { createClient } from '@supabase/supabase-js';
import { Booking, BookingFormData, MultiDateBookingFormData } from './types';
import { logger, logApiCall } from './utils/logger';
import { 
  BookingError, 
  ErrorCode, 
  classifyError, 
  withRetry,
  createDatabaseError,
  createBookingConflictError,
  createBookingNotFoundError,
  createApiError
} from './utils/errorHandling';

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
    return logApiCall(
      `getBookingsForMonth(${year}, ${month})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching bookings for ${year}-${month}`, 'SUPABASE');
          
          const { data, error } = await supabase
            .rpc('get_bookings_for_month', {
              target_year: year,
              target_month: month
            });

          if (error) {
            logger.error('RPC function error', 'SUPABASE', error);
            throw createDatabaseError('get_bookings_for_month RPC call', new Error(error.message));
          }

          logger.info(`Retrieved ${data?.length || 0} bookings`, 'SUPABASE');
          return data || [];
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Get all bookings (fallback if RPC function not available)
   */
  static async getAllBookings(): Promise<Booking[]> {
    return logApiCall(
      'getAllBookings()',
      async () => {
        return withRetry(async () => {
          logger.info('Fetching all bookings', 'SUPABASE');
          
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

          if (error) {
            logger.error('Database error fetching all bookings', 'SUPABASE', error);
            throw createDatabaseError('fetch all bookings', new Error(error.message));
          }

          logger.info(`Retrieved ${data?.length || 0} bookings`, 'SUPABASE');
          return data || [];
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Get bookings for a specific date
   */
  static async getBookingsForDate(date: string): Promise<Booking[]> {
    return logApiCall(
      `getBookingsForDate(${date})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching bookings for date: ${date}`, 'SUPABASE');
          
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', date)
            .order('start_time', { ascending: true });

          if (error) {
            logger.error(`Database error fetching bookings for date: ${date}`, 'SUPABASE', error);
            throw createDatabaseError('fetch bookings for date', new Error(error.message));
          }

          logger.info(`Retrieved ${data?.length || 0} bookings for ${date}`, 'SUPABASE');
          return data || [];
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
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
    return logApiCall(
      `isTimeSlotAvailable(${date}, ${startTime}, ${endTime}, ${excludeBookingId || 'none'})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Checking availability for ${date} ${startTime}-${endTime}`, 'SUPABASE', { excludeBookingId });
          
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
              logger.warn('RPC function not available, using fallback method', 'SUPABASE', error);
              return this.checkAvailabilityFallback(date, startTime, endTime, excludeBookingId);
            }

            logger.info(`Time slot availability: ${data}`, 'SUPABASE');
            return data;
          } catch (error) {
            logger.warn('RPC availability check failed, using fallback', 'SUPABASE', error);
            // Fallback to manual checking
            return this.checkAvailabilityFallback(date, startTime, endTime, excludeBookingId);
          }
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
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
    return logApiCall(
      `createBooking(${bookingData.date}, ${bookingData.start_time}-${bookingData.end_time})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating new booking', 'SUPABASE', { 
            date: bookingData.date, 
            timeSlot: `${bookingData.start_time}-${bookingData.end_time}`,
            eventName: bookingData.event_name 
          });
          
          // First check availability
          const isAvailable = await this.isTimeSlotAvailable(
            bookingData.date,
            bookingData.start_time,
            bookingData.end_time
          );

          if (!isAvailable) {
            throw createBookingConflictError([bookingData.date]);
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
            logger.error('Database error creating booking', 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
              throw createBookingConflictError([bookingData.date]);
            }
            
            throw createDatabaseError('create booking', new Error(error.message));
          }

          logger.info(`Successfully created booking with ID: ${data.id}`, 'SUPABASE');
          return data;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Update an existing booking
   */
  static async updateBooking(id: string, updates: Partial<BookingFormData>): Promise<Booking> {
    return logApiCall(
      `updateBooking(${id})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Updating booking ${id}`, 'SUPABASE', { updates });
          
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
              throw createBookingConflictError([updates.date || currentBooking.date]);
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
            logger.error(`Database error updating booking ${id}`, 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
              throw createBookingNotFoundError(id);
            }
            
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
              throw createBookingConflictError([updates.date || 'unknown']);
            }
            
            throw createDatabaseError('update booking', new Error(error.message));
          }

          logger.info(`Successfully updated booking ${id}`, 'SUPABASE');
          return data;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(id: string): Promise<void> {
    return logApiCall(
      `deleteBooking(${id})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Deleting booking ${id}`, 'SUPABASE');
          
          const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

          if (error) {
            logger.error(`Database error deleting booking ${id}`, 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
              throw createBookingNotFoundError(id);
            }
            
            throw createDatabaseError('delete booking', new Error(error.message));
          }

          logger.info(`Successfully deleted booking ${id}`, 'SUPABASE');
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(id: string): Promise<Booking> {
    return logApiCall(
      `getBookingById(${id})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching booking by ID: ${id}`, 'SUPABASE');
          
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            logger.error(`Database error fetching booking ${id}`, 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
              throw createBookingNotFoundError(id);
            }
            
            throw createDatabaseError('fetch booking by ID', new Error(error.message));
          }

          logger.info(`Successfully retrieved booking ${id}`, 'SUPABASE');
          return data;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Create multiple bookings for the same event across different dates
   */
  static async createMultiDateBooking(bookingData: MultiDateBookingFormData): Promise<Booking[]> {
    return logApiCall(
      `createMultiDateBooking(${bookingData.dates.length} dates, ${bookingData.start_time}-${bookingData.end_time})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating multi-date booking', 'SUPABASE', { 
            dates: bookingData.dates,
            timeSlot: `${bookingData.start_time}-${bookingData.end_time}`,
            eventName: bookingData.event_name 
          });
          
          // Check availability for all dates
          const availabilityChecks = await Promise.all(
            bookingData.dates.map(date => 
              this.isTimeSlotAvailable(date, bookingData.start_time, bookingData.end_time)
            )
          );

          const unavailableDates = bookingData.dates.filter((_, index) => !availabilityChecks[index]);
          
          if (unavailableDates.length > 0) {
            throw createBookingConflictError(unavailableDates);
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
            logger.error('Database error creating multi-date booking', 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
              throw createBookingConflictError(bookingData.dates);
            }
            
            throw createDatabaseError('create multi-date booking', new Error(error.message));
          }

          logger.info(`Successfully created ${data?.length || 0} multi-date bookings`, 'SUPABASE');
          return data || [];
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Check availability for multiple dates
   */
  static async checkMultiDateAvailability(
    dates: string[],
    startTime: string,
    endTime: string
  ): Promise<{ available: string[]; unavailable: string[] }> {
    return logApiCall(
      `checkMultiDateAvailability(${dates.length} dates, ${startTime}-${endTime})`,
      async () => {
        return withRetry(async () => {
          logger.info('Checking multi-date availability', 'SUPABASE', { 
            dates,
            timeSlot: `${startTime}-${endTime}` 
          });
          
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

          logger.info(`Multi-date availability check complete`, 'SUPABASE', {
            totalDates: dates.length,
            availableDates: available.length,
            unavailableDates: unavailable.length
          });

          return { available, unavailable };
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }
}