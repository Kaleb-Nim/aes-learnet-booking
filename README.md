# AES LEARNET ROOM BOOKING System

A single page booking system for the AES Learnet Room, featuring a calendar-based interface for viewing and booking room reservations.

## Tech Stack

- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **Supabase** - Backend and database
- **Vercel** - Deployment platform

## Features

### Calendar View
- One month calendar display
- Simple, intuitive UI
- Easy navigation between months

### Event Management
Users can view all events with the following details:
- **Date & Timing**: e.g., 07:30-17:00
- **Event Name**: e.g., "Orientation Program"
- **Point of Contact (POC)**: e.g., "ME3 Kok Wai Chung, CPL Kaleb Nim"
- **Phone Number**: Optional contact information (e.g., 84953150)

### Booking Functionality
- Click on empty dates to book the room
- Modal popup for booking form
- Real-time availability checking

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This project is configured for deployment on Vercel. Connect your repository to Vercel for automatic deployments.
