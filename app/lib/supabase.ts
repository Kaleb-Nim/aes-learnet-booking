import { createClient } from '@supabase/supabase-js';
import { 
  Event, 
  Booking, 
  BookingWithEventDetails,
  EventFormData,
  BookingFormData, 
  MultiDateBookingFormData,
  CreateEventWithBookingsData,
  UpdateEventData,
  DeleteEventData,
  EventWithBookings
} from './types';
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
      events: {
        Row: {
          id: string;
          event_name: string;
          poc_name: string;
          phone_number: string | null;
          start_time: string;
          end_time: string;
          color_hue: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          poc_name: string;
          phone_number?: string | null;
          start_time: string;
          end_time: string;
          color_hue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          poc_name?: string;
          phone_number?: string | null;
          start_time?: string;
          end_time?: string;
          color_hue?: number;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          event_id: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          date?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      booking_details: {
        Row: {
          booking_id: string;
          event_id: string;
          date: string;
          booking_created_at: string;
          booking_updated_at: string;
          event_name: string;
          poc_name: string;
          phone_number: string | null;
          start_time: string;
          end_time: string;
          color_hue: number;
          event_created_at: string;
          event_updated_at: string;
          time_range: string;
        };
      };
    };
    Functions: {
      get_bookings_for_month: {
        Args: { p_year: number; p_month: number };
        Returns: {
          booking_id: string;
          event_id: string;
          date: string;
          event_name: string;
          poc_name: string;
          phone_number: string | null;
          start_time: string;
          end_time: string;
          time_range: string;
          color_hue: number;
        }[];
      };
      check_booking_conflict: {
        Args: {
          p_date: string;
          p_start_time: string;
          p_end_time: string;
          p_exclude_event_id?: string;
        };
        Returns: boolean;
      };
      generate_event_color_hue: {
        Args: {};
        Returns: number;
      };
    };
  };
}

// API Functions for Events
export class EventAPI {
  /**
   * Create a new event
   */
  static async createEvent(eventData: EventFormData): Promise<Event> {
    return logApiCall(
      `createEvent(${eventData.event_name})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating new event', 'SUPABASE', { 
            eventName: eventData.event_name,
            timeSlot: `${eventData.start_time}-${eventData.end_time}`
          });
          
          // Generate color hue if not provided using room-specific color generation
          const color_hue = eventData.color_hue ?? await this.generateRoomColorHue(eventData.room_id);
          
          const { data, error } = await supabase
            .from('events')
            .insert([{
              room_id: eventData.room_id,
              event_name: eventData.event_name,
              poc_name: eventData.poc_name,
              phone_number: eventData.phone_number || null,
              start_time: eventData.start_time,
              end_time: eventData.end_time,
              color_hue
            }])
            .select()
            .single();

          if (error) {
            logger.error('Database error creating event', 'SUPABASE', error);
            throw createDatabaseError('create event', new Error(error.message));
          }

          logger.info(`Successfully created event with ID: ${data.id}`, 'SUPABASE');
          return data;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Update an existing event (cascades to all bookings)
   */
  static async updateEvent(eventId: string, updates: Partial<EventFormData>): Promise<Event> {
    return logApiCall(
      `updateEvent(${eventId})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Updating event ${eventId}`, 'SUPABASE', { updates });
          
          const { data, error } = await supabase
            .from('events')
            .update({
              ...updates,
              phone_number: updates.phone_number || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            .select()
            .single();

          if (error) {
            logger.error(`Database error updating event ${eventId}`, 'SUPABASE', error);
            
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
              throw createBookingNotFoundError(eventId);
            }
            
            throw createDatabaseError('update event', new Error(error.message));
          }

          logger.info(`Successfully updated event ${eventId}`, 'SUPABASE');
          return data;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Delete an event (cascades to all bookings)
   */
  static async deleteEvent(eventId: string): Promise<void> {
    return logApiCall(
      `deleteEvent(${eventId})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Deleting event ${eventId} (cascades to all bookings)`, 'SUPABASE');
          
          const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

          if (error) {
            logger.error(`Database error deleting event ${eventId}`, 'SUPABASE', error);
            
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
              throw createBookingNotFoundError(eventId);
            }
            
            throw createDatabaseError('delete event', new Error(error.message));
          }

          logger.info(`Successfully deleted event ${eventId}`, 'SUPABASE');
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Get all events with booking counts
   */
  static async getAllEvents(): Promise<EventWithBookings[]> {
    return logApiCall(
      'getAllEvents()',
      async () => {
        return withRetry(async () => {
          logger.info('Fetching all events with booking data', 'SUPABASE');
          
          const { data, error } = await supabase
            .from('events')
            .select(`
              *,
              bookings:bookings(id, date)
            `)
            .order('created_at', { ascending: true });

          if (error) {
            logger.error('Database error fetching events', 'SUPABASE', error);
            throw createDatabaseError('fetch all events', new Error(error.message));
          }

          // Transform data to include booking metadata
          const eventsWithBookings = data?.map(event => ({
            ...event,
            booking_count: event.bookings?.length || 0,
            first_booking_date: event.bookings?.length ? 
              new Date(Math.min(...event.bookings.map((b: any) => new Date(b.date).getTime()))).toISOString().split('T')[0] : undefined,
            last_booking_date: event.bookings?.length ? 
              new Date(Math.max(...event.bookings.map((b: any) => new Date(b.date).getTime()))).toISOString().split('T')[0] : undefined
          })) || [];

          logger.info(`Retrieved ${eventsWithBookings.length} events`, 'SUPABASE');
          return eventsWithBookings;
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Generate unique color hue for events within room's color spectrum
   */
  static async generateRoomColorHue(roomId: string): Promise<number> {
    return logApiCall(
      `generateRoomColorHue(${roomId})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Generating room-specific color hue for room ${roomId}`, 'SUPABASE');
          
          try {
            const { data, error } = await supabase
              .rpc('generate_room_event_color_hue', { p_room_id: roomId });

            if (error) {
              logger.warn('Room color hue RPC function not available, using fallback', 'SUPABASE', error);
              return this.generateRoomColorHueFallback(roomId);
            }

            logger.info(`Generated room color hue: ${data} for room ${roomId}`, 'SUPABASE');
            return data;
          } catch (error) {
            logger.warn('Room color hue generation failed, using fallback', 'SUPABASE', error);
            return this.generateRoomColorHueFallback(roomId);
          }
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Fallback room color hue generation using client-side logic
   */
  private static async generateRoomColorHueFallback(roomId: string): Promise<number> {
    // Get room's base hue
    const { data: room } = await supabase
      .from('rooms')
      .select('color_base_hue')
      .eq('id', roomId)
      .single();
    
    const baseHue = room?.color_base_hue ?? (roomId === '1-21' ? 0 : 240);
    
    // Get existing hues for this room
    const { data: events } = await supabase
      .from('events')
      .select('color_hue')
      .eq('room_id', roomId);
    
    const existingHues = events?.map(e => e.color_hue) || [];
    
    // Generate hue within room's spectrum (±30 degrees from base)
    const spectrumRange = 60;
    const hueStep = 15;
    
    for (let i = 0; i < 10; i++) {
      const offset = (i * hueStep) % spectrumRange - (spectrumRange / 2);
      let newHue = (baseHue + offset + 360) % 360;
      
      // Check if this hue is far enough from existing ones
      const tooClose = existingHues.some(existing => 
        Math.abs(newHue - existing) < 15 || Math.abs(newHue - existing) > 345
      );
      
      if (!tooClose) {
        return newHue;
      }
    }
    
    // Fallback: return base hue with small random offset
    return (baseHue + Math.floor(Math.random() * 40) - 20 + 360) % 360;
  }

  /**
   * Generate unique color hue for events (legacy function)
   */
  static async generateColorHue(): Promise<number> {
    return logApiCall(
      'generateColorHue()',
      async () => {
        return withRetry(async () => {
          logger.info('Generating unique color hue', 'SUPABASE');
          
          try {
            const { data, error } = await supabase
              .rpc('generate_event_color_hue');

            if (error) {
              logger.warn('RPC function not available, using fallback', 'SUPABASE', error);
              return this.generateColorHueFallback();
            }

            logger.info(`Generated color hue: ${data}`, 'SUPABASE');
            return data;
          } catch (error) {
            logger.warn('Color hue generation failed, using fallback', 'SUPABASE', error);
            return this.generateColorHueFallback();
          }
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Fallback color hue generation
   */
  private static async generateColorHueFallback(): Promise<number> {
    // Get existing hues
    const { data: events } = await supabase
      .from('events')
      .select('color_hue');
    
    const existingHues = events?.map(e => e.color_hue) || [];
    const hueStep = 137; // Golden angle
    
    let newHue = (existingHues.length * hueStep) % 360;
    
    // Ensure uniqueness
    while (existingHues.includes(newHue)) {
      newHue = (newHue + 17) % 360;
    }
    
    return newHue;
  }

  /**
   * Create event with bookings for multiple dates
   */
  static async createEventWithBookings(data: CreateEventWithBookingsData): Promise<{ event: Event; bookings: Booking[] }> {
    return logApiCall(
      `createEventWithBookings(${data.event.event_name}, ${data.dates.length} dates)`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating event with multiple bookings', 'SUPABASE', {
            eventName: data.event.event_name,
            dates: data.dates
          });

          // First create the event
          const event = await this.createEvent(data.event);

          // Then create bookings for all dates
          const bookings = await BookingAPI.createBookingsForEvent(event.id, data.dates);

          logger.info(`Successfully created event ${event.id} with ${bookings.length} bookings`, 'SUPABASE');
          return { event, bookings };
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }
}

// API Functions for booking operations
export class BookingAPI {
  
  /**
   * Get all bookings with event details for a specific month
   */
  static async getBookingsForMonth(year: number, month: number): Promise<BookingWithEventDetails[]> {
    return logApiCall(
      `getBookingsForMonth(${year}, ${month})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching bookings for ${year}-${month}`, 'SUPABASE');
          
          try {
            const { data, error } = await supabase
              .rpc('get_bookings_for_month', {
                p_year: year,
                p_month: month
              });

            if (error) {
              logger.warn('RPC function error, using fallback', 'SUPABASE', error);
              return this.getBookingsForMonthFallback(year, month);
            }

            logger.info(`Retrieved ${data?.length || 0} bookings`, 'SUPABASE');
            return data || [];
          } catch (error) {
            logger.warn('RPC call failed, using fallback', 'SUPABASE', error);
            return this.getBookingsForMonthFallback(year, month);
          }
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Fallback method to get bookings for month using view
   */
  private static async getBookingsForMonthFallback(year: number, month: number): Promise<BookingWithEventDetails[]> {
    const { data, error } = await supabase
      .from('booking_details')
      .select('*')
      .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      logger.error('Database error fetching bookings fallback', 'SUPABASE', error);
      throw createDatabaseError('fetch bookings for month fallback', new Error(error.message));
    }

    return data || [];
  }

  /**
   * Get all bookings with event details
   */
  static async getAllBookings(): Promise<BookingWithEventDetails[]> {
    return logApiCall(
      'getAllBookings()',
      async () => {
        return withRetry(async () => {
          logger.info('Fetching all bookings with event details', 'SUPABASE');
          
          const { data, error } = await supabase
            .from('booking_details')
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
   * Get bookings with event details for a specific date
   */
  static async getBookingsForDate(date: string): Promise<BookingWithEventDetails[]> {
    return logApiCall(
      `getBookingsForDate(${date})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching bookings for date: ${date}`, 'SUPABASE');
          
          const { data, error } = await supabase
            .from('booking_details')
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
    excludeEventId?: string,
    roomId?: string
  ): Promise<boolean> {
    return logApiCall(
      `isTimeSlotAvailable(${date}, ${startTime}, ${endTime}, ${excludeEventId || 'none'})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Checking availability for ${date} ${startTime}-${endTime}`, 'SUPABASE', { excludeEventId });
          
          try {
            // Use room-specific conflict checking if roomId is provided
            if (roomId) {
              const { data, error } = await supabase
                .rpc('check_room_booking_conflict', {
                  p_room_id: roomId,
                  p_date: date,
                  p_start_time: startTime,
                  p_end_time: endTime,
                  p_exclude_event_id: excludeEventId
                });

              if (error) {
                logger.warn('Room-specific RPC function not available, using fallback method', 'SUPABASE', error);
                return this.checkAvailabilityFallback(date, startTime, endTime, excludeEventId, roomId);
              }

              // Function returns true if conflict exists, so we invert
              const isAvailable = !data;
              logger.info(`Room ${roomId} time slot availability: ${isAvailable}`, 'SUPABASE');
              return isAvailable;
            } else {
              // Legacy: check all rooms
              const { data, error } = await supabase
                .rpc('check_booking_conflict', {
                  p_date: date,
                  p_start_time: startTime,
                  p_end_time: endTime,
                  p_exclude_event_id: excludeEventId
                });

              if (error) {
                logger.warn('RPC function not available, using fallback method', 'SUPABASE', error);
                return this.checkAvailabilityFallback(date, startTime, endTime, excludeEventId, roomId);
              }

              // Function returns true if conflict exists, so we invert
              const isAvailable = !data;
              logger.info(`Time slot availability: ${isAvailable}`, 'SUPABASE');
              return isAvailable;
            }
          } catch (error) {
            logger.warn('RPC availability check failed, using fallback', 'SUPABASE', error);
            // Fallback to manual checking
            return this.checkAvailabilityFallback(date, startTime, endTime, excludeEventId, roomId);
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
    excludeEventId?: string,
    roomId?: string
  ): Promise<boolean> {
    const existingBookings = await this.getBookingsForDate(date);
    
    const requestStart = new Date(`2000-01-01T${startTime}`);
    const requestEnd = new Date(`2000-01-01T${endTime}`);

    for (const booking of existingBookings) {
      if (excludeEventId && booking.event_id === excludeEventId) {
        continue; // Skip bookings from the event being updated
      }

      // Filter by room if roomId is specified
      if (roomId && booking.room_id !== roomId) {
        continue; // Skip bookings for other rooms
      }

      const bookingStart = new Date(`2000-01-01T${booking.start_time}`);
      const bookingEnd = new Date(`2000-01-01T${booking.end_time}`);

      // Check for overlap
      if (
        (requestStart < bookingEnd && requestEnd > bookingStart)
      ) {
        return false; // Conflict found
      }
    }

    return true; // No conflicts
  }

  /**
   * Create a new booking for an existing event
   */
  static async createBooking(eventId: string, date: string): Promise<Booking> {
    return logApiCall(
      `createBooking(${eventId}, ${date})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating new booking for existing event', 'SUPABASE', { 
            eventId,
            date
          });
          
          // Get event details to check availability
          const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

          if (eventError) {
            throw createBookingNotFoundError(eventId);
          }

          // Check availability
          const isAvailable = await this.isTimeSlotAvailable(
            date,
            event.start_time,
            event.end_time,
            eventId,
            event.room_id
          );

          if (!isAvailable) {
            throw createBookingConflictError([date]);
          }

          const { data, error } = await supabase
            .from('bookings')
            .insert([{
              event_id: eventId,
              date
            }])
            .select()
            .single();

          if (error) {
            logger.error('Database error creating booking', 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
              throw createBookingConflictError([date]);
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
   * Create bookings for an event across multiple dates
   */
  static async createBookingsForEvent(eventId: string, dates: string[]): Promise<Booking[]> {
    return logApiCall(
      `createBookingsForEvent(${eventId}, ${dates.length} dates)`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating bookings for event', 'SUPABASE', { 
            eventId,
            dates
          });
          
          // Create booking records for all dates
          const bookingRecords = dates.map(date => ({
            event_id: eventId,
            date
          }));

          const { data, error } = await supabase
            .from('bookings')
            .insert(bookingRecords)
            .select();

          if (error) {
            logger.error('Database error creating multiple bookings', 'SUPABASE', error);
            
            // Handle specific error codes
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
              throw createBookingConflictError(dates);
            }
            
            throw createDatabaseError('create multiple bookings', new Error(error.message));
          }

          logger.info(`Successfully created ${data?.length || 0} bookings for event ${eventId}`, 'SUPABASE');
          return data || [];
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Create a new booking with new event (legacy single booking)
   */
  static async createBookingWithEvent(bookingData: BookingFormData): Promise<{ event: Event; booking: Booking }> {
    return logApiCall(
      `createBookingWithEvent(${bookingData.date}, ${bookingData.start_time}-${bookingData.end_time})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating new booking with event', 'SUPABASE', bookingData);
          
          // First check availability
          const isAvailable = await this.isTimeSlotAvailable(
            bookingData.date,
            bookingData.start_time,
            bookingData.end_time,
            undefined,
            bookingData.room_id
          );

          if (!isAvailable) {
            throw createBookingConflictError([bookingData.date]);
          }

          // Create event first
          const event = await EventAPI.createEvent({
            room_id: bookingData.room_id,
            event_name: bookingData.event_name,
            poc_name: bookingData.poc_name,
            phone_number: bookingData.phone_number,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time
          });

          // Then create booking
          const booking = await this.createBooking(event.id, bookingData.date);

          logger.info(`Successfully created event ${event.id} with booking ${booking.id}`, 'SUPABASE');
          return { event, booking };
        }, 3, 1000, 'SUPABASE');
      },
      'SUPABASE'
    );
  }

  /**
   * Update a booking's date
   */
  static async updateBooking(id: string, updates: { date?: string }): Promise<Booking> {
    return logApiCall(
      `updateBooking(${id})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Updating booking ${id}`, 'SUPABASE', { updates });
          
          const { data, error } = await supabase
            .from('bookings')
            .update({
              ...updates,
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
   * Get a single booking with event details by ID
   */
  static async getBookingById(id: string): Promise<BookingWithEventDetails> {
    return logApiCall(
      `getBookingById(${id})`,
      async () => {
        return withRetry(async () => {
          logger.info(`Fetching booking by ID: ${id}`, 'SUPABASE');
          
          const { data, error } = await supabase
            .from('booking_details')
            .select('*')
            .eq('booking_id', id)
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
   * Create multiple bookings for a new event across different dates
   */
  static async createMultiDateBooking(bookingData: MultiDateBookingFormData): Promise<{ event: Event; bookings: Booking[] }> {
    return logApiCall(
      `createMultiDateBooking(${bookingData.dates.length} dates, ${bookingData.start_time}-${bookingData.end_time})`,
      async () => {
        return withRetry(async () => {
          logger.info('Creating multi-date booking with new event', 'SUPABASE', { 
            dates: bookingData.dates,
            timeSlot: `${bookingData.start_time}-${bookingData.end_time}`,
            eventName: bookingData.event_name 
          });
          
          // Check availability for all dates
          const availabilityChecks = await Promise.all(
            bookingData.dates.map(date => 
              this.isTimeSlotAvailable(date, bookingData.start_time, bookingData.end_time, undefined, bookingData.room_id)
            )
          );

          const unavailableDates = bookingData.dates.filter((_, index) => !availabilityChecks[index]);
          
          if (unavailableDates.length > 0) {
            throw createBookingConflictError(unavailableDates);
          }

          // Create event first
          const event = await EventAPI.createEvent({
            room_id: bookingData.room_id,
            event_name: bookingData.event_name,
            poc_name: bookingData.poc_name,
            phone_number: bookingData.phone_number,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time
          });

          // Create bookings for all dates
          const bookings = await this.createBookingsForEvent(event.id, bookingData.dates);

          logger.info(`Successfully created event ${event.id} with ${bookings.length} bookings`, 'SUPABASE');
          return { event, bookings };
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
    endTime: string,
    excludeEventId?: string,
    roomId?: string
  ): Promise<{ available: string[]; unavailable: string[] }> {
    return logApiCall(
      `checkMultiDateAvailability(${dates.length} dates, ${startTime}-${endTime})`,
      async () => {
        return withRetry(async () => {
          logger.info('Checking multi-date availability', 'SUPABASE', { 
            dates,
            timeSlot: `${startTime}-${endTime}`,
            excludeEventId
          });
          
          const availabilityChecks = await Promise.all(
            dates.map(async (date) => ({
              date,
              available: await this.isTimeSlotAvailable(date, startTime, endTime, excludeEventId, roomId)
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

// Combined API for backward compatibility and convenience
export const API = {
  ...BookingAPI,
  ...EventAPI,
  
  // Legacy method names for backward compatibility
  createBooking: BookingAPI.createBookingWithEvent,
  updateBooking: EventAPI.updateEvent,
  deleteBooking: EventAPI.deleteEvent,
  createMultiDateBooking: BookingAPI.createMultiDateBooking
};

// Legacy exports for backward compatibility
export { BookingAPI as BookingAPIClass };