# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `aes-learnet-booking`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
6. Click "Create new project"

## 2. Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create:
- `bookings` table with all required fields
- Indexes for better performance
- Constraints for data validation
- Helper functions for conflict checking
- Sample data for testing
- Row Level Security policies

## 3. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Create `.env.local` file in your project root:

```bash
cp .env.local.example .env.local
```

4. Fill in your actual Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Verify Setup

After running the schema, you should see:

### Tables
- `bookings` - Main table for storing room bookings

### Views
- `bookings_view` - Formatted view with time ranges

### Functions
- `check_booking_conflict()` - Detects overlapping bookings
- `get_bookings_for_month()` - Gets bookings for specific month
- `is_time_slot_available()` - Checks availability

### Sample Data
Three sample bookings will be inserted for testing.

## 5. Security Notes

- Row Level Security (RLS) is enabled
- Current policy allows all operations (modify as needed)
- Consider adding user authentication for production
- The `anon` key is safe for client-side use

## 6. Database Schema Details

```sql
-- Main booking structure
bookings (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) OPTIONAL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

### Constraints
- `start_time` must be before `end_time`
- `date` must be today or in the future
- Automatic conflict detection prevents overlapping bookings

### Indexes
- Fast queries by date
- Optimized for date + time range searches
- Efficient sorting by creation time

## Troubleshooting

### Common Issues

1. **SQL Execution Errors**
   - Ensure you're in the SQL Editor, not the Table Editor
   - Check that extensions are enabled in your project

2. **Environment Variables Not Working**
   - Restart your development server after adding `.env.local`
   - Verify the URL format includes `https://`

3. **Permission Errors**
   - Check that RLS policies are correctly applied
   - Verify your anon key is correct

### Useful SQL Queries

```sql
-- Check all bookings
SELECT * FROM bookings_view;

-- Get June 2025 bookings
SELECT * FROM get_bookings_for_month(2025, 6);

-- Check if time slot is available
SELECT is_time_slot_available('2025-06-30', '14:00', '16:00');

-- Clear all sample data
DELETE FROM bookings;
```