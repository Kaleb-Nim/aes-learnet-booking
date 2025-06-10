'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, User, Phone, FileText, CalendarDays, ArrowRight, Home } from 'lucide-react';
import { 
  multiDateBookingFormSchema, 
  MultiDateBookingFormData 
} from '../../lib/utils/validationSchemas';
import { formatDate, formatDisplayDate } from '../../lib/utils/dateUtils';
import { eachDayOfInterval } from 'date-fns';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface MultiDateBookingFormProps {
  onSubmit: (data: MultiDateBookingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingBookings?: any[];
}

export default function MultiDateBookingForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  existingBookings = []
}: MultiDateBookingFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MultiDateBookingFormData>({
    resolver: zodResolver(multiDateBookingFormSchema),
    defaultValues: {
      room_id: '1-21',
      dates: [],
      start_time: '08:00',
      end_time: '17:30',
      event_name: '',
      poc_name: '',
      phone_number: ''
    }
  });

  // Generate date range when start and end dates change
  useEffect(() => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start <= end) {
          const dateRange = eachDayOfInterval({ start, end });
          const dateStrings = dateRange.map(date => formatDate(date));
          setSelectedDates(dateStrings);
          setValue('dates', dateStrings);
        } else {
          setSelectedDates([]);
          setValue('dates', []);
        }
      } catch (error) {
        console.error('Error generating date range:', error);
        setSelectedDates([]);
        setValue('dates', []);
      }
    } else if (startDate && !endDate) {
      // Only start date selected
      setSelectedDates([startDate]);
      setValue('dates', [startDate]);
    } else {
      setSelectedDates([]);
      setValue('dates', []);
    }
  }, [startDate, endDate, setValue]);

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDates([]);
    setValue('dates', []);
  };

  const onFormSubmit = async (data: MultiDateBookingFormData) => {
    try {
      await onSubmit({ ...data, dates: selectedDates });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  // Get minimum date (today)
  const today = new Date();
  const minDate = formatDate(today);

  // Check for conflicts with existing bookings for the selected room
  const getConflictsForDates = () => {
    const selectedRoomId = watch('room_id');
    const conflicts: string[] = [];
    selectedDates.forEach(date => {
      const dateBookings = existingBookings.filter(booking => 
        booking.date === date && booking.room_id === selectedRoomId
      );
      if (dateBookings.length > 0) {
        conflicts.push(date);
      }
    });
    return conflicts;
  };

  const selectedRoomId = watch('room_id');
  const conflicts = getConflictsForDates();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Multi-Date Selection Header */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CalendarDays className="w-5 h-5" />
          <span className="font-medium">Consecutive Date Range Booking (Full Day: 08:00-17:30)</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          Select start and end dates to book consecutive days for the same event. Perfect for training programs, workshops, and extended meetings.
        </p>
      </div>

      {/* Room Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Room Selection
        </label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            {...register('room_id')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

      {/* Date Range Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Date Range
        </label>
        
        {/* Start and End Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              min={minDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || minDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!startDate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       dark:bg-gray-800 dark:text-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed
                       dark:disabled:bg-gray-900 disabled:text-gray-400"
            />
          </div>
        </div>

        {/* Date Range Preview */}
        {startDate && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {endDate ? (
                  <>
                    {formatDisplayDate(new Date(startDate))} 
                    <ArrowRight className="w-4 h-4 mx-2 inline" />
                    {formatDisplayDate(new Date(endDate))}
                    <span className="ml-2 text-sm">({selectedDates.length} days)</span>
                  </>
                ) : (
                  <>Single day: {formatDisplayDate(new Date(startDate))}</>
                )}
              </span>
            </div>
            {selectedDates.length > 1 && (
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Booking {selectedDates.length} consecutive days from {formatDisplayDate(new Date(startDate))} to {formatDisplayDate(new Date(endDate))}
              </div>
            )}
          </div>
        )}

        {/* Selected Dates Summary (if many dates) */}
        {selectedDates.length > 7 && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Selected Dates ({selectedDates.length} days):
            </div>
            <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                {selectedDates.map((date) => (
                  <div
                    key={date}
                    className={`p-1 rounded text-center ${
                      conflicts.includes(date)
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {formatDisplayDate(new Date(date))}
                    {conflicts.includes(date) && <span className="text-xs block">⚠️</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clear dates button */}
        {(startDate || endDate) && (
          <div className="mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearDates}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear dates
            </Button>
          </div>
        )}

        {errors.dates && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.dates.message}
          </p>
        )}
      </div>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Booking Conflicts Detected
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            {conflicts.length} of your selected dates already have bookings for Room {selectedRoomId}. 
            This will create overlapping bookings if you proceed.
          </p>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            Conflicting dates: {conflicts.map(date => formatDisplayDate(new Date(date))).join(', ')}
          </div>
        </div>
      )}

      {/* Fixed Time Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Time: 08:00 - 17:30 (Full Day)</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          All selected dates will use full day timing for Room {selectedRoomId}.
        </p>
      </div>

      {/* Hidden time inputs for form validation */}
      <input type="hidden" {...register('start_time')} value="08:00" />
      <input type="hidden" {...register('end_time')} value="17:30" />

      {/* Event Name */}
      <div>
        <Input
          label="Event Name"
          placeholder="e.g., ACP Training Program, Multi-day Workshop"
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
          disabled={isFormLoading || selectedDates.length === 0}
          className="w-full sm:w-auto"
        >
          {isFormLoading 
            ? 'Creating Bookings...' 
            : selectedDates.length === 1 
            ? 'Create 1 Booking'
            : selectedDates.length > 1
            ? `Create ${selectedDates.length} Consecutive Bookings`
            : 'Select Date Range'
          }
        </Button>
      </div>

      {/* Multi-Date Booking Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p><strong>Date Range Booking:</strong></p>
        <p>• Select room and date range for consecutive day booking</p>
        <p>• All dates will use full day timing (08:00-17:30)</p>
        <p>• Maximum 30 consecutive days can be selected</p>
        <p>• Each date creates a separate booking entry for the selected room</p>
        <p>• Perfect for multi-day training programs and extended events</p>
      </div>
    </form>
  );
}