'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, User, Phone, FileText } from 'lucide-react';
import { bookingFormSchema, BookingFormData, commonTimeSlots } from '../../lib/utils/validationSchemas';
import { formatDate, formatDisplayDate } from '../../lib/utils/dateUtils';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface BookingFormProps {
  selectedDate: Date;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BookingForm({ 
  selectedDate, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
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

      {/* Time Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Start Time"
            type="time"
            icon={<Clock className="w-4 h-4" />}
            error={errors.start_time?.message}
            {...register('start_time')}
          />
        </div>
        <div>
          <Input
            label="End Time"
            type="time"
            icon={<Clock className="w-4 h-4" />}
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>
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
        <p className="mt-2"><strong>Minimum Duration:</strong> 30 minutes</p>
      </div>
    </form>
  );
}