# AES LEARNET ROOM BOOKING System

A comprehensive room booking system for AES Learnet rooms, featuring a calendar-based interface for viewing and booking multiple room reservations.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **Supabase** - Backend database with real-time features
- **Vercel** - Deployment platform

## Features

### 🏢 Multi-Room Support
- **Room 1-21**: Main conference room with red color scheme
- **Room 1-17**: Training room with blue color scheme
- Room-specific availability checking and conflict detection

### 📅 Advanced Calendar Interface
- Monthly calendar view with intuitive navigation
- Color-coded events by room with unique hue variations
- Click-to-book functionality for available dates
- Responsive design for mobile and desktop

### 🎯 Comprehensive Booking Management
- **Single Date Bookings**: Quick room reservations
- **Multi-Date Bookings**: Batch booking across multiple dates
- **Event Editing**: Modify existing bookings with cascading updates
- **Conflict Prevention**: Real-time availability validation

### 📋 Event Details
Each booking includes:
- **Room Selection**: Choose between available rooms
- **Date & Timing**: Flexible time slot selection (e.g., 07:30-17:00)
- **Event Name**: Descriptive event identification
- **Point of Contact**: Personnel information with rank and name
- **Phone Number**: Optional contact details

### 🔧 Advanced Features
- **Event-Based System**: One event can span multiple dates
- **Color Coordination**: Room-specific color palettes for visual organization
- **Database Relationships**: Cascading edits and deletes
- **Error Handling**: Comprehensive validation and user feedback

## Database Setup

1. **Supabase Configuration**:
   - Create a new Supabase project
   - Run the schema from `supabase-schema.sql`
   - Set up environment variables (see `SUPABASE_SETUP.md` in `ai_docs/`)

2. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `/app` - Next.js App Router pages and components
- `/supabase-schema.sql` - Database schema with room support
- `/ai_docs` - Development documentation and feature notes

## Deployment

This project is optimized for deployment on Vercel:
1. Connect your GitHub repository to Vercel
2. Add your Supabase environment variables
3. Deploy automatically on push to main branch
