'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar/Calendar';
import BookingModal from './components/Booking/BookingModal';
import BookingDetailsModal from './components/Booking/BookingDetailsModal';
import { Booking } from './lib/types';
import { BookingFormData, MultiDateBookingFormData } from './lib/utils/validationSchemas';
import { BookingAPI } from './lib/supabase';
import { formatDate } from './lib/utils/dateUtils';
import { useNotifications } from './components/UI/NotificationSystem';
import { getErrorMessage } from './lib/utils/errorHandling';
import { PageLoader, ErrorState } from './components/UI/LoadingStates';
import { logger } from './lib/utils/logger';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
  const mergeBookings = (existingBookings: Booking[], newBookings: Booking[]) => {
    const bookingMap = new Map<string, Booking>();
    
    // Add existing bookings
    existingBookings.forEach(booking => {
      bookingMap.set(booking.id, booking);
    });
    
    // Add/update with new bookings
    newBookings.forEach(booking => {
      bookingMap.set(booking.id, booking);
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
      
      // Fall back to mock data for development
      const mockBookings = [
        {
          id: '1',
          date: '2025-06-15',
          start_time: '08:00',
          end_time: '17:30',
          event_name: 'ACP Training',
          poc_name: 'ME3 Kok Wai Chung, CPL Kaleb Nim',
          phone_number: '84953150',
          created_at: '2025-06-06T02:20:41.879665+00:00',
          updated_at: '2025-06-06T02:20:41.879665+00:00'
        },
        {
          id: '2',
          date: '2025-06-20',
          start_time: '13:00',
          end_time: '17:30',
          event_name: 'AOP Session',
          poc_name: 'SGT John Doe',
          phone_number: '91234567',
          created_at: '2025-06-06T02:20:41.879665+00:00',
          updated_at: '2025-06-06T02:20:41.879665+00:00'
        }
      ];
      setBookings(mockBookings);
      setLoadedMonths(new Set(['2025-06']));
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
      
      let newBookingsData: Booking[];
      
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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdate = async (id: string, formData: BookingFormData) => {
    try {
      logger.userAction('Updating booking', { id, formData });
      const updatedBooking = await BookingAPI.updateBooking(id, formData);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      setSelectedBooking(updatedBooking);
      
      success('Booking Updated', 'Your booking has been updated successfully.');
      logger.info(`Successfully updated booking: ${id}`, 'PAGE');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to update booking', 'PAGE', err);
      showError('Update Failed', errorMessage);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleBookingDelete = async (id: string) => {
    try {
      logger.userAction('Deleting booking', { id });
      await BookingAPI.deleteBooking(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
      
      success('Booking Deleted', 'Your booking has been deleted successfully.');
      logger.info(`Successfully deleted booking: ${id}`, 'PAGE');
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
      const newBooking = await BookingAPI.createBooking(formData);
      
      // Update bookings using merge to maintain cache
      setBookings(prev => mergeBookings(prev, [newBooking]));
      
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      success('Booking Created', `Your booking for ${formData.event_name} has been created successfully.`);
      logger.info(`Successfully created booking: ${newBooking.id}`, 'PAGE');
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
      const newBookings = await BookingAPI.createMultiDateBooking(formData);
      
      // Update bookings using merge to maintain cache
      setBookings(prev => mergeBookings(prev, newBookings));
      
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      success('Multi-Date Booking Created', `${newBookings.length} bookings created successfully for ${formData.event_name} across multiple dates.`);
      logger.info(`Successfully created ${newBookings.length} multi-date bookings`, 'PAGE');
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
