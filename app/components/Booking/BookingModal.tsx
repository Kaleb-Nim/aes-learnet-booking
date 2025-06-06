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

        {/* Existing bookings warning for single date */}
        {bookingMode === 'single' && selectedDate && existingBookings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Existing Bookings on This Date:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {existingBookings.map((booking, index) => (
                <li key={index}>
                  • {booking.event_name} ({booking.start_time} - {booking.end_time})
                </li>
              ))}
            </ul>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              Please ensure your booking time doesn't conflict with existing bookings.
            </p>
          </div>
        )}

        {/* Forms */}
        {bookingMode === 'single' && selectedDate ? (
          <BookingForm
            selectedDate={selectedDate}
            onSubmit={handleSingleDateSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
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