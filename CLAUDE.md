# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AES LEARNET ROOM BOOKING System - A single page application for booking the AES Learnet Room. Features a calendar-based interface where users can view existing bookings and create new reservations through modal popups.

## Key Technologies

- **Next.js 15**: App Router with React 19
- **TypeScript**: Strict mode enabled
- **Tailwind CSS v4**: Using PostCSS plugin for styling
- **Supabase**: Backend database and authentication
- **Vercel**: Deployment platform

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Application Features

### Core Functionality
1. **Calendar View**: One month display with navigation
2. **Event Viewing**: Display all bookings with details (date, timing, event name, POC, phone)
3. **Booking System**: Click empty dates to open booking modal

### Data Structure
Events should include:
- Date & Timing (e.g., "07:30-17:00")
- Event Name (e.g., "Orientation Program")
- Point of Contact (e.g., "ME3 Kok Wai Chung, CPL Kaleb Nim")
- Phone Number (optional, e.g., "84953150")

## Architecture Notes

- Single page application architecture
- Uses App Router (`app/` directory structure)
- Root layout handles global font loading and basic HTML structure
- Path aliasing configured with `@/*` pointing to project root
- Modal-based interactions for booking forms
- Real-time data integration with Supabase

## Implementation Plan

### Phase 1: Foundation Setup (High Priority)
1. **Supabase Database Design** - Create bookings table with date, timing, event details
2. **Dependencies Installation** - Supabase client, date utilities, form libraries
3. **TypeScript Interfaces** - Define Booking and BookingFormData types

### Phase 2: Core Components (High Priority)
4. **Calendar Component** - Monthly grid, navigation, date cells with booking status
5. **Booking Modal** - Form with validation, accessibility, animations
6. **Supabase Integration** - API functions for CRUD operations and availability checking

### Phase 3: Feature Implementation (Medium Priority)
7. **Calendar Data Integration** - Real-time updates, loading states, error handling
8. **Event Display** - Booking cards, hover states, detail views
9. **Form Validation** - Time overlap prevention, business hours validation

### Phase 4: Polish & Deployment (Medium-Low Priority)
10. **Responsive Design** - Mobile-first, touch-friendly navigation
11. **Error Handling** - Network recovery, validation messages, loading states
12. **Testing** - End-to-end flows, conflict scenarios, cross-browser
13. **Deployment** - Vercel configuration with environment variables

### Database Schema
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Required Dependencies
- @supabase/supabase-js
- date-fns
- lucide-react
- @headlessui/react
- react-hook-form
- @hookform/resolvers zod

## File Structure

```
app/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarNavigation.tsx
│   │   └── CalendarDay.tsx
│   ├── Booking/
│   │   ├── BookingModal.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingDetails.tsx
│   └── UI/
│       ├── Modal.tsx
│       ├── Button.tsx
│       └── Input.tsx
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── validationSchemas.ts
├── hooks/
│   ├── useBookings.ts
│   └── useCalendar.ts
└── page.tsx (main calendar view)
```

- `app/` - Next.js App Router pages and layouts
- `public/` - Static assets
- Root level configs for Next.js, TypeScript, PostCSS, and Tailwind