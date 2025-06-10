'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar/Calendar';
import BookingModal from './components/Booking/BookingModal';
import BookingDetailsModal from './components/Booking/BookingDetailsModal';
import { BookingWithEventDetails } from './lib/types';
import { BookingFormData, MultiDateBookingFormData } from './lib/utils/validationSchemas';
import { BookingAPI, EventAPI } from './lib/supabase';
import { formatDate } from './lib/utils/dateUtils';
import { useNotifications } from './components/UI/NotificationSystem';
import { getErrorMessage } from './lib/utils/errorHandling';
import { PageLoader, ErrorState } from './components/UI/LoadingStates';
import { logger } from './lib/utils/logger';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEventDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingWithEventDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const { success, error: showError } = useNotifications();

  // Helper function to generate month key
  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Helper function to merge bookings while avoiding duplicates
  const mergeBookings = (existingBookings: BookingWithEventDetails[], newBookings: BookingWithEventDetails[]) => {
    const bookingMap = new Map<string, BookingWithEventDetails>();
    
    // Add existing bookings
    existingBookings.forEach(booking => {
      bookingMap.set(booking.booking_id, booking);
    });
    
    // Add/update with new bookings
    newBookings.forEach(booking => {
      bookingMap.set(booking.booking_id, booking);
    });
    
    return Array.from(bookingMap.values()).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  };

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Load bookings when month changes
  useEffect(() => {
    const monthKey = getMonthKey(currentMonth);
    
    // Only load if we haven't loaded this month before
    if (!loadedMonths.has(monthKey)) {
      loadBookingsForMonth(currentMonth);
    }
  }, [currentMonth, loadedMonths]);

  const loadBookings = async () => {
    // Initial load - get all bookings to ensure we have comprehensive data
    try {
      setIsLoading(true);
      setError(null);
      logger.userAction('Loading all bookings on mount');
      
      const bookingsData = await BookingAPI.getAllBookings();
      setBookings(bookingsData);
      
      // Mark all months as loaded that have bookings
      const monthsWithBookings = new Set<string>();
      bookingsData.forEach(booking => {
        const bookingDate = new Date(booking.date);
        const monthKey = getMonthKey(bookingDate);
        monthsWithBookings.add(monthKey);
      });
      
      // Also mark current month as loaded
      const currentMonthKey = getMonthKey(new Date());
      monthsWithBookings.add(currentMonthKey);
      
      setLoadedMonths(monthsWithBookings);
      logger.info(`Loaded ${bookingsData.length} total bookings covering ${monthsWithBookings.size} months`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to load bookings', 'PAGE', err);
      setError(errorMessage);
      showError('Failed to Load Bookings', errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingsForMonth = async (date: Date) => {
    const monthKey = getMonthKey(date);
    
    try {
      setIsLoading(true);
      setError(null);
      logger.userAction(`Loading bookings for ${monthKey}`);
      
      let newBookingsData: BookingWithEventDetails[];
      
      try {
        // Try to get specific month bookings
        newBookingsData = await BookingAPI.getBookingsForMonth(
          date.getFullYear(),
          date.getMonth() + 1
        );
        logger.info(`Loaded ${newBookingsData.length} bookings for ${monthKey}`, 'PAGE');
      } catch (rpcError) {
        // Fallback to all bookings if RPC function not available
        logger.warn('RPC function not available, falling back to getAllBookings', 'PAGE');
        const allBookings = await BookingAPI.getAllBookings();
        
        // Filter to just this month's bookings from the full dataset
        newBookingsData = allBookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return getMonthKey(bookingDate) === monthKey;
        });
        
        logger.info(`Filtered ${newBookingsData.length} bookings for ${monthKey} from ${allBookings.length} total`, 'PAGE');
      }
      
      // Merge with existing bookings instead of replacing
      setBookings(prevBookings => mergeBookings(prevBookings, newBookingsData));
      
      // Mark this month as loaded
      setLoadedMonths(prev => new Set([...prev, monthKey]));
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error(`Failed to load bookings for ${monthKey}`, 'PAGE', err);
      showError('Failed to Load Bookings', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    logger.userAction('Month changed', { 
      year: date.getFullYear(), 
      month: date.getMonth() + 1 
    });
    setCurrentMonth(date);
  };

  const handleCreateBooking = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleMultiDateBooking = () => {
    setSelectedDate(undefined); // Clear selected date for multi-date mode
    setIsModalOpen(true);
  };

  const handleBookingClick = (booking: BookingWithEventDetails) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdate = async (bookingId: string, formData: BookingFormData) => {
    try {
      logger.userAction('Updating booking', { bookingId, formData });
      
      // Find the current booking to get the event ID
      const currentBooking = bookings.find(b => b.booking_id === bookingId);
      if (!currentBooking) {
        throw new Error('Booking not found');
      }
      
      // Update the event with new data
      await EventAPI.updateEvent(currentBooking.event_id, {
        room_id: formData.room_id,
        event_name: formData.event_name,
        poc_name: formData.poc_name,
        phone_number: formData.phone_number,
        start_time: formData.start_time,
        end_time: formData.end_time
      });
      
      // Update the booking's date if it changed
      if (formData.date !== currentBooking.date) {
        await BookingAPI.updateBooking(bookingId, { date: formData.date });
      }
      
      // Reload bookings to get updated data
      await loadBookings();
      
      success('Booking Updated', 'Your booking has been updated successfully.');
      logger.info(`Successfully updated booking: ${bookingId}`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error(`Failed to update booking ${bookingId}`, 'PAGE', err);
      showError('Update Failed', errorMessage);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleBookingDelete = async (bookingId: string) => {
    try {
      logger.userAction('Deleting booking', { bookingId });
      await BookingAPI.deleteBooking(bookingId);
      setBookings(prev => prev.filter(booking => booking.booking_id !== bookingId));
      
      success('Booking Deleted', 'Your booking has been deleted successfully.');
      logger.info(`Successfully deleted booking: ${bookingId}`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete booking', 'PAGE', err);
      showError('Delete Failed', errorMessage);
      throw err; // Re-throw to let the component handle the error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    try {
      logger.userAction('Creating booking', { formData });
      const { event, booking } = await BookingAPI.createBookingWithEvent(formData);
      
      // Convert to BookingWithEventDetails format for UI
      const bookingWithDetails: BookingWithEventDetails = {
        booking_id: booking.id,
        event_id: event.id,
        date: booking.date,
        booking_created_at: booking.created_at,
        booking_updated_at: booking.updated_at,
        event_name: event.event_name,
        poc_name: event.poc_name,
        phone_number: event.phone_number || undefined,
        start_time: event.start_time,
        end_time: event.end_time,
        color_hue: event.color_hue,
        event_created_at: event.created_at,
        event_updated_at: event.updated_at,
        time_range: `${event.start_time}-${event.end_time}`,
        room_id: event.room_id,
        room_name: event.room_id === '1-21' ? 'AES Learnet Room 1-21' : 'AES Learnet Room 1-17',
        room_base_hue: event.room_id === '1-21' ? 0 : 240
      };
      
      // Update bookings using merge to maintain cache
      setBookings(prev => mergeBookings(prev, [bookingWithDetails]));
      
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      success('Booking Created', `Your booking for ${formData.event_name} has been created successfully.`);
      logger.info(`Successfully created booking: ${booking.id}`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to create booking', 'PAGE', err);
      showError('Booking Failed', errorMessage);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleMultiDateBookingSubmit = async (formData: MultiDateBookingFormData) => {
    try {
      logger.userAction('Creating multi-date booking', { formData });
      const { event, bookings } = await BookingAPI.createMultiDateBooking(formData);
      
      // Convert to BookingWithEventDetails format for UI
      const bookingsWithDetails: BookingWithEventDetails[] = bookings.map(booking => ({
        booking_id: booking.id,
        event_id: event.id,
        date: booking.date,
        booking_created_at: booking.created_at,
        booking_updated_at: booking.updated_at,
        event_name: event.event_name,
        poc_name: event.poc_name,
        phone_number: event.phone_number || undefined,
        start_time: event.start_time,
        end_time: event.end_time,
        color_hue: event.color_hue,
        event_created_at: event.created_at,
        event_updated_at: event.updated_at,
        time_range: `${event.start_time}-${event.end_time}`,
        room_id: event.room_id,
        room_name: event.room_id === '1-21' ? 'AES Learnet Room 1-21' : 'AES Learnet Room 1-17',
        room_base_hue: event.room_id === '1-21' ? 0 : 240
      }));
      
      // Update bookings using merge to maintain cache
      setBookings(prev => mergeBookings(prev, bookingsWithDetails));
      
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      success('Multi-Date Booking Created', `${bookings.length} bookings created successfully for ${formData.event_name} across multiple dates.`);
      logger.info(`Successfully created ${bookings.length} multi-date bookings`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to create multi-date booking', 'PAGE', err);
      showError('Multi-Date Booking Failed', errorMessage);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const getBookingsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateString = formatDate(selectedDate);
    return bookings.filter(booking => booking.date === dateString);
  };

  if (isLoading && bookings.length === 0) {
    return <PageLoader message="Loading AES Learnet Room Booking..." />;
  }

  if (error && bookings.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Bookings"
        message={error}
        onRetry={loadBookings}
        retryText="Retry Loading"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-2 sm:px-4">
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookings={bookings}
        onCreateBooking={handleCreateBooking}
        onMultiDateBooking={handleMultiDateBooking}
        onBookingClick={handleBookingClick}
        onMonthChange={handleMonthChange}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        onSubmit={handleBookingSubmit}
        onMultiDateSubmit={handleMultiDateBookingSubmit}
        existingBookings={getBookingsForSelectedDate()}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedBooking}
        onUpdate={handleBookingUpdate}
        onDelete={handleBookingDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
