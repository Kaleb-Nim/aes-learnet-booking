'use client';

import { useState, useMemo } from 'react';
import { getCalendarDays, getNextMonth, getPreviousMonth } from '../lib/utils/dateUtils';
import { BookingWithEventDetails } from '../lib/types';

export function useCalendar(initialDate?: Date, bookings: BookingWithEventDetails[] = []) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate, bookings);
  }, [currentDate, bookings]);

  const goToNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
  };

  const clearSelection = () => {
    setSelectedDate(undefined);
  };

  return {
    currentDate,
    selectedDate,
    calendarDays,
    goToNextMonth,
    goToPreviousMonth,
    selectDate,
    goToDate,
    clearSelection
  };
}