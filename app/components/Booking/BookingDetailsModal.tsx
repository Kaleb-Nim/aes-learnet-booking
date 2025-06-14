'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Edit3, 
  Save, 
  X,
  Trash2,
  Eye,
  Home
} from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { BookingWithEventDetails } from '../../lib/types';
import { BookingFormData, bookingFormSchema, commonTimeSlots } from '../../lib/utils/validationSchemas';
import { formatDisplayDate, formatTimeRange } from '../../lib/utils/dateUtils';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingWithEventDetails | null;
  onUpdate: (id: string, data: BookingFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onUpdate,
  onDelete,
  isLoading = false
}: BookingDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: booking ? {
      room_id: booking.room_id,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      event_name: booking.event_name,
      poc_name: booking.poc_name,
      phone_number: booking.phone_number || ''
    } : undefined
  });

  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');

  // Reset form when booking changes
  useEffect(() => {
    if (booking) {
      reset({
        room_id: booking.room_id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        event_name: booking.event_name,
        poc_name: booking.poc_name,
        phone_number: booking.phone_number || ''
      });
    }
  }, [booking, reset]);

  const handleQuickTimeSelect = (start: string, end: string) => {
    setValue('start_time', start);
    setValue('end_time', end);
  };

  // Find current time slot match using form values
  const getCurrentTimeSlot = () => {
    if (!watchedStartTime || !watchedEndTime) return null;
    return commonTimeSlots.find(slot => 
      slot.start === watchedStartTime && slot.end === watchedEndTime
    );
  };

  // Initialize form with current time slot when entering edit mode
  useEffect(() => {
    if (booking && isEditMode) {
      // Always ensure form has the current booking's time values to prevent validation errors
      setValue('start_time', booking.start_time);
      setValue('end_time', booking.end_time);
    }
  }, [booking, isEditMode, setValue]);

  const handleEditToggle = () => {
    if (isEditMode && booking) {
      // Reset form to original values if canceling edit
      reset({
        room_id: booking.room_id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        event_name: booking.event_name,
        poc_name: booking.poc_name,
        phone_number: booking.phone_number || ''
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    if (!booking) return;
    
    try {
      await onUpdate(booking.booking_id, data);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the booking "${booking.event_name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await onDelete(booking.booking_id);
        onClose();
      } catch (error) {
        console.error('Failed to delete booking:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isLoading && !isSubmitting && !isDeleting) {
      setIsEditMode(false);
      onClose();
    }
  };

  if (!booking) {
    return null;
  }

  const isFormLoading = isLoading || isSubmitting || isDeleting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Booking' : 'Booking Details'}
      size="lg"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Booking Header */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium text-lg">{booking.event_name}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
            <Home className="w-4 h-4" />
            <span className="font-medium">{booking.room_name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
            <span>{formatDisplayDate(new Date(booking.date))}</span>
            <span>{formatTimeRange(booking.start_time, booking.end_time)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            type="button"
            variant={isEditMode ? "secondary" : "outline"}
            size="sm"
            onClick={handleEditToggle}
            disabled={isFormLoading}
          >
            {isEditMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Details
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isFormLoading}
            loading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Booking
          </Button>
        </div>

        {/* Booking Details Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Selection
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                {...register('room_id')}
                disabled={!isEditMode || isFormLoading}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isEditMode ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : ''
                }`}
              >
                <option value="1-21">Room #1-21 (Main Conference Room)</option>
                <option value="1-17">Room #1-17 (Training Room)</option>
              </select>
            </div>
            {errors.room_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.room_id.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <Input
              label="Date"
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              disabled={!isEditMode || isFormLoading}
              error={errors.date?.message}
              {...register('date')}
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Time Slot
            </label>
            {!isEditMode ? (
              /* Display current time slot in view mode */
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  {formatTimeRange(booking.start_time, booking.end_time)}
                </span>
              </div>
            ) : (
              /* Time slot selection in edit mode */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {commonTimeSlots.map((slot) => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => handleQuickTimeSelect(slot.start, slot.end)}
                      disabled={isFormLoading}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                        watchedStartTime === slot.start && watchedEndTime === slot.end
                          ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                
                {/* Show current custom time if it doesn't match preset slots */}
                {!getCurrentTimeSlot() && watchedStartTime && watchedEndTime && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Current: {watchedStartTime} - {watchedEndTime}</span>
                    </div>
                    <div className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                      ⚠️ Custom time detected. Please select one of the standard time slots above to continue.
                    </div>
                  </div>
                )}
              </div>
            )}
            {(errors.start_time || errors.end_time) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.start_time?.message || errors.end_time?.message}
              </p>
            )}
            
            {/* Hidden inputs to maintain form validation */}
            <input type="hidden" {...register('start_time')} />
            <input type="hidden" {...register('end_time')} />
          </div>

          {/* Event Name */}
          <div>
            <Input
              label="Event Name"
              placeholder="e.g., ACP Training, Orientation Program"
              icon={<FileText className="w-4 h-4" />}
              disabled={!isEditMode || isFormLoading}
              error={errors.event_name?.message}
              {...register('event_name')}
            />
          </div>

          {/* Point of Contact */}
          <div>
            <Input
              label="Point of Contact (POC)"
              placeholder="e.g., ME3 Kok Wai Chung, CPL Kaleb Nim"
              icon={<User className="w-4 h-4" />}
              disabled={!isEditMode || isFormLoading}
              error={errors.poc_name?.message}
              helperText={!isEditMode ? undefined : "Include rank and full name"}
              {...register('poc_name')}
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g., 84953150"
              icon={<Phone className="w-4 h-4" />}
              disabled={!isEditMode || isFormLoading}
              error={errors.phone_number?.message}
              helperText={!isEditMode ? undefined : "Optional - 8 digits starting with 6, 8, or 9"}
              {...register('phone_number')}
            />
          </div>

          {/* Booking Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Booking Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Booking ID:</span>
                <div className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                  {booking.booking_id}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <div className="text-gray-700 dark:text-gray-300">
                  {new Date(booking.booking_created_at).toLocaleString()}
                </div>
              </div>
              {booking.booking_updated_at !== booking.booking_created_at && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <div className="text-gray-700 dark:text-gray-300">
                    {new Date(booking.booking_updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          {isEditMode && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleEditToggle}
                disabled={isFormLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isFormLoading}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Close Button for View Mode */}
          {!isEditMode && (
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isFormLoading}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}