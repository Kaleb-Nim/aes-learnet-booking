'use client';

import { useState } from 'react';
import Modal from '../UI/Modal';
import BookingForm from './BookingForm';
import MultiDateBookingForm from './MultiDateBookingForm';
import Button from '../UI/Button';
import { BookingFormData, MultiDateBookingFormData } from '../../lib/utils/validationSchemas';
import { formatDisplayDate } from '../../lib/utils/dateUtils';
import { Calendar, CalendarDays } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onMultiDateSubmit: (data: MultiDateBookingFormData) => Promise<void>;
  existingBookings?: any[];
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedDate,
  onSubmit,
  onMultiDateSubmit,
  existingBookings = []
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState<'single' | 'multi'>('single');

  const handleSingleDateSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiDateSubmit = async (data: MultiDateBookingFormData) => {
    setIsLoading(true);
    try {
      await onMultiDateSubmit(data);
      onClose();
    } catch (error) {
      console.error('Multi-date booking submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setBookingMode('single');
      onClose();
    }
  };

  const getModalTitle = () => {
    if (bookingMode === 'multi') {
      return 'Book AES Learnet Room - Multiple Dates';
    }
    
    if (selectedDate && existingBookings.length > 0) {
      const bookedRooms = [...new Set(existingBookings.map(b => b.room_id))];
      const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
      
      if (availableRooms.length > 0) {
        return `Book Room ${availableRooms[0]} - ${formatDisplayDate(selectedDate)}`;
      }
    }
    
    return selectedDate 
      ? `Book AES Learnet Room - ${formatDisplayDate(selectedDate)}`
      : 'Book AES Learnet Room';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
    >
      <div className="max-h-[75vh] overflow-y-auto">
        {/* Booking Mode Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant={bookingMode === 'single' ? 'primary' : 'outline'}
            onClick={() => setBookingMode('single')}
            disabled={isLoading}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Single Date
          </Button>
          <Button
            type="button"
            variant={bookingMode === 'multi' ? 'primary' : 'outline'}
            onClick={() => setBookingMode('multi')}
            disabled={isLoading}
            className="flex-1"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Multiple Dates
          </Button>
        </div>

        {/* Existing bookings info for single date - encouraging tone */}
        {bookingMode === 'single' && selectedDate && existingBookings.length > 0 && (() => {
          const bookedRooms = [...new Set(existingBookings.map(b => b.room_id))];
          const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
          
          if (availableRooms.length > 0) {
            return (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                  🎉 Good News! Room {availableRooms.join(' and ')} Available
                </h4>
                <div className="text-sm text-green-700 dark:text-green-300 mb-3">
                  <p className="font-medium mb-1">Current bookings on this date:</p>
                  <ul className="space-y-1">
                    {existingBookings.map((booking, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        {booking.event_name} - Room {booking.room_id} ({booking.start_time} - {booking.end_time})
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  ✅ <strong>You can book Room {availableRooms[0]}</strong> - The form below is already set to the available room.
                </p>
              </div>
            );
          } else {
            return (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  All Rooms Booked on This Date
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {existingBookings.map((booking, index) => (
                    <li key={index}>
                      • {booking.event_name} - Room {booking.room_id} ({booking.start_time} - {booking.end_time})
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Both rooms are already booked. Please select a different date or time.
                </p>
              </div>
            );
          }
        })()}

        {/* Forms */}
        {bookingMode === 'single' && selectedDate ? (
          <BookingForm
            selectedDate={selectedDate}
            onSubmit={handleSingleDateSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            existingBookings={existingBookings}
          />
        ) : bookingMode === 'multi' ? (
          <MultiDateBookingForm
            onSubmit={handleMultiDateSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            existingBookings={existingBookings}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Please select a booking mode to continue.
          </div>
        )}
      </div>
    </Modal>
  );
}