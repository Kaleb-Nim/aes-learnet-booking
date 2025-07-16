'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, User, Phone, FileText, Home } from 'lucide-react';
import { bookingFormSchema, BookingFormData, commonTimeSlots } from '../../lib/utils/validationSchemas';
import { formatDate, formatDisplayDate } from '../../lib/utils/dateUtils';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface BookingFormProps {
  selectedDate: Date;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingBookings?: any[];
}

export default function BookingForm({ 
  selectedDate, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  existingBookings = []
}: BookingFormProps) {
  
  // Determine the best available room
  const getDefaultRoom = () => {
    if (existingBookings.length === 0) {
      return '1-21'; // Default to main conference room if no bookings
    }
    
    const bookedRooms = [...new Set(existingBookings.map(b => b.room_id))];
    const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
    
    // Return the first available room, or '1-21' as fallback
    return availableRooms.length > 0 ? availableRooms[0] : '1-21';
  };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      room_id: getDefaultRoom(),
      date: formatDate(selectedDate),
      start_time: '08:00',
      end_time: '12:00',
      event_name: '',
      poc_name: '',
      phone_number: ''
    }
  });

  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');

  const handleQuickTimeSelect = (start: string, end: string) => {
    setValue('start_time', start);
    setValue('end_time', end);
  };

  const onFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Room Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Room Selection
          {existingBookings.length > 0 && (() => {
            const bookedRooms = [...new Set(existingBookings.map(b => b.room_id))];
            const availableRooms = ['1-21', '1-17'].filter(room => !bookedRooms.includes(room));
            if (availableRooms.length > 0) {
              return <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Room {availableRooms[0]} pre-selected (available)</span>;
            }
          })()}
        </label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            {...register('room_id')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="1-21">Room #1-21 (Main Conference Room) {existingBookings.some(b => b.room_id === '1-21') ? '- Already Booked' : ''}</option>
            <option value="1-17">Room #1-17 (Training Room) {existingBookings.some(b => b.room_id === '1-17') ? '- Already Booked' : ''}</option>
          </select>
        </div>
        {errors.room_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.room_id.message}
          </p>
        )}
      </div>

      {/* Selected Date Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">Selected Date: {formatDisplayDate(selectedDate)}</span>
        </div>
      </div>

      {/* Quick Time Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Time Selection
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {commonTimeSlots.map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => handleQuickTimeSelect(slot.start, slot.end)}
              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                watchedStartTime === slot.start && watchedEndTime === slot.end
                  ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Time Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selected Time Slot
        </label>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100">
            {watchedStartTime && watchedEndTime ? `${watchedStartTime} - ${watchedEndTime}` : 'Please select a time slot above'}
          </span>
        </div>
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
          placeholder="e.g., ACP,AOP,Orientation Program, Team Meeting"
          icon={<FileText className="w-4 h-4" />}
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
          error={errors.poc_name?.message}
          helperText="Include rank and full name"
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
          error={errors.phone_number?.message}
          helperText="Optional - 8 digits starting with 6, 8, or 9"
          {...register('phone_number')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isFormLoading}
          disabled={isFormLoading}
          className="w-full sm:w-auto"
        >
          {isFormLoading ? 'Creating Booking...' : 'Create Booking'}
        </Button>
      </div>

      {/* Business Hours Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p><strong>Available Time Slots:</strong></p>
        <p>• Full day: 8:00 AM - 5:30 PM</p>
        <p>• Morning: 8:00 AM - 12:00 PM</p>
        <p>• Afternoon: 1:00 PM - 5:30 PM</p>
        <p className="mt-2"><strong>Note:</strong> Please select one of the preset time slots above</p>
      </div>
    </form>
  );
}