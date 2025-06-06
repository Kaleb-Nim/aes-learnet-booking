-- AES Learnet Room Booking System Database Schema
-- Execute this file in Supabase SQL Editor to set up the complete database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_date_time ON bookings(date, start_time, end_time);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Add constraints
ALTER TABLE bookings 
ADD CONSTRAINT check_valid_time_range 
CHECK (start_time < end_time);

ALTER TABLE bookings 
ADD CONSTRAINT check_future_date 
CHECK (date >= CURRENT_DATE);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row changes
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
    booking_date DATE,
    booking_start_time TIME,
    booking_end_time TIME,
    exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM bookings
    WHERE date = booking_date
    AND (
        (start_time <= booking_start_time AND end_time > booking_start_time) OR
        (start_time < booking_end_time AND end_time >= booking_end_time) OR
        (start_time >= booking_start_time AND end_time <= booking_end_time)
    )
    AND (exclude_booking_id IS NULL OR id != exclude_booking_id);
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
-- Enable RLS on the bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict based on user roles later)
CREATE POLICY "Allow all operations on bookings" ON bookings
    FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO bookings (date, start_time, end_time, event_name, poc_name, phone_number) VALUES
('2025-06-15', '08:00', '17:30', 'ACP Training', 'ME3 Kok Wai Chung, CPL Kaleb Nim', '84953150'),
('2025-06-20', '13:00', '17:30', 'AOP Session', 'SGT John Doe', '91234567'),
('2025-06-25', '08:00', '12:00', 'Morning Briefing', 'CPL Jane Smith', NULL);

-- Create a view for easier querying of bookings with formatted times
CREATE VIEW bookings_view AS
SELECT 
    id,
    date,
    start_time,
    end_time,
    CONCAT(
        TO_CHAR(start_time, 'HH24:MI'), 
        '-', 
        TO_CHAR(end_time, 'HH24:MI')
    ) AS time_range,
    event_name,
    poc_name,
    phone_number,
    created_at,
    updated_at
FROM bookings
ORDER BY date ASC, start_time ASC;

-- Create a function to get bookings for a specific month
CREATE OR REPLACE FUNCTION get_bookings_for_month(
    target_year INTEGER,
    target_month INTEGER
)
RETURNS TABLE (
    id UUID,
    date DATE,
    start_time TIME,
    end_time TIME,
    time_range TEXT,
    event_name VARCHAR(255),
    poc_name VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM bookings_view
    WHERE EXTRACT(YEAR FROM bookings_view.date) = target_year
    AND EXTRACT(MONTH FROM bookings_view.date) = target_month;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check availability for a specific date and time
CREATE OR REPLACE FUNCTION is_time_slot_available(
    booking_date DATE,
    booking_start_time TIME,
    booking_end_time TIME
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT check_booking_conflict(booking_date, booking_start_time, booking_end_time);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON bookings_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_bookings_for_month(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_time_slot_available(DATE, TIME, TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION check_booking_conflict(DATE, TIME, TIME, UUID) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE bookings IS 'Table storing all room booking information for the AES Learnet Room';
COMMENT ON COLUMN bookings.date IS 'The date of the booking (YYYY-MM-DD)';
COMMENT ON COLUMN bookings.start_time IS 'Start time of the booking in 24-hour format';
COMMENT ON COLUMN bookings.end_time IS 'End time of the booking in 24-hour format';
COMMENT ON COLUMN bookings.event_name IS 'Name or description of the event';
COMMENT ON COLUMN bookings.poc_name IS 'Point of Contact name for the booking';
COMMENT ON COLUMN bookings.phone_number IS 'Optional phone number for contact';

COMMENT ON FUNCTION check_booking_conflict(DATE, TIME, TIME, UUID) IS 'Checks if a booking time slot conflicts with existing bookings';
COMMENT ON FUNCTION get_bookings_for_month(INTEGER, INTEGER) IS 'Returns all bookings for a specific month and year';
COMMENT ON FUNCTION is_time_slot_available(DATE, TIME, TIME) IS 'Checks if a specific time slot is available for booking';