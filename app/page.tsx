'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar/Calendar';
import BookingModal from './components/Booking/BookingModal';
import BookingDetailsModal from './components/Booking/BookingDetailsModal';
import { Booking } from './lib/types';
import { BookingFormData, MultiDateBookingFormData } from './lib/utils/validationSchemas';
import { BookingAPI } from './lib/supabase';
import { formatDate } from './lib/utils/dateUtils';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Try to get current month bookings, fallback to all bookings
      const currentDate = new Date();
      let bookingsData: Booking[];
      
      try {
        bookingsData = await BookingAPI.getBookingsForMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
      } catch (rpcError) {
        console.warn('RPC function not available, falling back to getAllBookings');
        bookingsData = await BookingAPI.getAllBookings();
      }
      
      setBookings(bookingsData);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load bookings. Please check your connection and try again.');
      // Fall back to mock data for development
      setBookings([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
      const updatedBooking = await BookingAPI.updateBooking(id, formData);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      setSelectedBooking(updatedBooking);
      
      // Show success message
      alert('Booking updated successfully!');
    } catch (err) {
      console.error('Failed to update booking:', err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleBookingDelete = async (id: string) => {
    try {
      await BookingAPI.deleteBooking(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
      
      // Show success message
      alert('Booking deleted successfully!');
    } catch (err) {
      console.error('Failed to delete booking:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    try {
      const newBooking = await BookingAPI.createBooking(formData);
      setBookings(prev => [...prev, newBooking]);
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      // Show success message (you can replace with a proper toast notification)
      alert('Booking created successfully!');
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleMultiDateBookingSubmit = async (formData: MultiDateBookingFormData) => {
    try {
      const newBookings = await BookingAPI.createMultiDateBooking(formData);
      setBookings(prev => [...prev, ...newBookings]);
      setIsModalOpen(false);
      setSelectedDate(undefined);
      
      // Show success message
      alert(`${newBookings.length} bookings created successfully across multiple dates!`);
    } catch (err) {
      console.error('Failed to create multi-date booking:', err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const getBookingsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateString = formatDate(selectedDate);
    return bookings.filter(booking => booking.date === dateString);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-2 sm:px-4">
      {isLoading && (
        <div className="fixed top-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg">
          Loading bookings...
        </div>
      )}
      
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookings={bookings}
        onCreateBooking={handleCreateBooking}
        onMultiDateBooking={handleMultiDateBooking}
        onBookingClick={handleBookingClick}
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
