import { z } from 'zod';

export const bookingFormSchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Date must be today or in the future'),
  
  start_time: z.string()
    .min(1, 'Start time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  end_time: z.string()
    .min(1, 'End time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  
  event_name: z.string()
    .min(1, 'Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(255, 'Event name must not exceed 255 characters'),
  
  poc_name: z.string()
    .min(1, 'Point of Contact name is required')
    .min(2, 'POC name must be at least 2 characters')
    .max(255, 'POC name must not exceed 255 characters'),
  
  phone_number: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      // Singapore phone number format: 8 digits starting with 6, 8, or 9
      return /^[689]\d{7}$/.test(phone.replace(/\s/g, ''));
    }, 'Phone number must be 8 digits starting with 6, 8, or 9')
}).refine((data) => {
  // Check if start_time is before end_time
  const start = new Date(`2000-01-01T${data.start_time}`);
  const end = new Date(`2000-01-01T${data.end_time}`);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['end_time']
}).refine((data) => {
  // Check minimum booking duration (30 minutes)
  const start = new Date(`2000-01-01T${data.start_time}`);
  const end = new Date(`2000-01-01T${data.end_time}`);
  const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffMinutes >= 30;
}, {
  message: 'Booking must be at least 30 minutes long',
  path: ['end_time']
}).refine((data) => {
  // Check maximum booking duration (12 hours)
  const start = new Date(`2000-01-01T${data.start_time}`);
  const end = new Date(`2000-01-01T${data.end_time}`);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diffHours <= 12;
}, {
  message: 'Booking cannot exceed 12 hours',
  path: ['end_time']
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Multi-date booking schema
export const multiDateBookingFormSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'))
    .min(1, 'At least one date must be selected')
    .max(30, 'Cannot select more than 30 dates')
    .refine((dates) => {
      // Check all dates are in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dates.every(dateStr => {
        const selectedDate = new Date(dateStr);
        return selectedDate >= today;
      });
    }, 'All dates must be today or in the future')
    .refine((dates) => {
      // Check for unique dates
      const uniqueDates = new Set(dates);
      return uniqueDates.size === dates.length;
    }, 'Duplicate dates are not allowed'),
  
  start_time: z.string()
    .min(1, 'Start time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  end_time: z.string()
    .min(1, 'End time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  
  event_name: z.string()
    .min(1, 'Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(255, 'Event name must not exceed 255 characters'),
  
  poc_name: z.string()
    .min(1, 'Point of Contact name is required')
    .min(2, 'POC name must be at least 2 characters')
    .max(255, 'POC name must not exceed 255 characters'),
  
  phone_number: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return /^[689]\d{7}$/.test(phone.replace(/\s/g, ''));
    }, 'Phone number must be 8 digits starting with 6, 8, or 9')
}).refine((data) => {
  // Check if start_time is before end_time
  const start = new Date(`2000-01-01T${data.start_time}`);
  const end = new Date(`2000-01-01T${data.end_time}`);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['end_time']
});

export type MultiDateBookingFormData = z.infer<typeof multiDateBookingFormSchema>;

// Common time slots for quick selection
export const commonTimeSlots = [
  { label: 'Full day 08:00-17:30', start: '08:00', end: '17:30' },
  { label: 'Morning 08:00-12:00', start: '08:00', end: '12:00' },
  { label: 'Afternoon 13:00-17:30', start: '13:00', end: '17:30' }
];

// Business hours validation
export const BUSINESS_HOURS = {
  start: '07:00',
  end: '22:00'
};

export const isWithinBusinessHours = (startTime: string, endTime: string): boolean => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const businessStart = new Date(`2000-01-01T${BUSINESS_HOURS.start}`);
  const businessEnd = new Date(`2000-01-01T${BUSINESS_HOURS.end}`);
  
  return start >= businessStart && end <= businessEnd;
};