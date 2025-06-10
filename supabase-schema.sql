-- AES Learnet Room Booking System - Database Schema v4
-- Multi-Room Support: 1-21 (Red spectrum) and 1-17 (Blue spectrum)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Rooms Table (Master Room Information)
-- =============================================
CREATE TABLE rooms (
  id VARCHAR(10) PRIMARY KEY, -- '1-21', '1-17'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INTEGER,
  color_base_hue INTEGER NOT NULL, -- Base hue for room's color spectrum
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_valid_base_hue CHECK (color_base_hue >= 0 AND color_base_hue <= 359)
);

-- =============================================
-- Events Table (Master Event Information)
-- =============================================
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id VARCHAR(10) NOT NULL REFERENCES rooms(id),
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color_hue INTEGER NOT NULL DEFAULT 0, -- Specific hue within room's color spectrum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_valid_time_range CHECK (start_time < end_time),
  CONSTRAINT check_valid_hue CHECK (color_hue >= 0 AND color_hue <= 359)
);

-- =============================================
-- Bookings Table (Individual Date Instances)
-- =============================================
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_future_date CHECK (date >= CURRENT_DATE),
  CONSTRAINT unique_event_date UNIQUE(event_id, date)
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_rooms_active ON rooms(is_active);
CREATE INDEX idx_events_room_id ON events(room_id);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_date_range ON bookings(date, event_id);

-- =============================================
-- Views for Easy Data Access
-- =============================================

-- Complete booking view with event and room details
CREATE VIEW booking_details AS
SELECT 
  b.id as booking_id,
  b.date,
  b.created_at as booking_created_at,
  b.updated_at as booking_updated_at,
  e.id as event_id,
  e.event_name,
  e.poc_name,
  e.phone_number,
  e.start_time,
  e.end_time,
  e.color_hue,
  e.created_at as event_created_at,
  e.updated_at as event_updated_at,
  r.id as room_id,
  r.name as room_name,
  r.description as room_description,
  r.capacity as room_capacity,
  r.color_base_hue as room_base_hue,
  -- Formatted time range
  CONCAT(
    TO_CHAR(e.start_time, 'HH24:MI'), 
    '-', 
    TO_CHAR(e.end_time, 'HH24:MI')
  ) as time_range
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN rooms r ON e.room_id = r.id
WHERE r.is_active = true
ORDER BY b.date, e.start_time;

-- Room utilization view
CREATE VIEW room_utilization AS
SELECT 
  r.id as room_id,
  r.name as room_name,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.date >= CURRENT_DATE THEN b.id END) as upcoming_bookings,
  MIN(b.date) as first_booking_date,
  MAX(b.date) as last_booking_date
FROM rooms r
LEFT JOIN events e ON r.id = e.room_id
LEFT JOIN bookings b ON e.id = b.event_id
WHERE r.is_active = true
GROUP BY r.id, r.name
ORDER BY r.id;

-- =============================================
-- Functions for Business Logic
-- =============================================

-- Check if a time slot conflicts with existing bookings for a specific room
CREATE OR REPLACE FUNCTION check_room_booking_conflict(
  p_room_id VARCHAR(10),
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_event_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM booking_details bd
    WHERE bd.room_id = p_room_id
    AND bd.date = p_date
    AND (
      (p_start_time >= bd.start_time AND p_start_time < bd.end_time) OR
      (p_end_time > bd.start_time AND p_end_time <= bd.end_time) OR
      (p_start_time <= bd.start_time AND p_end_time >= bd.end_time)
    )
    AND (p_exclude_event_id IS NULL OR bd.event_id != p_exclude_event_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Get available time slots for a room on a specific date
CREATE OR REPLACE FUNCTION get_room_available_slots(
  p_room_id VARCHAR(10),
  p_date DATE
)
RETURNS TABLE(
  slot_start_time TIME,
  slot_end_time TIME,
  duration_minutes INTEGER
) AS $$
DECLARE
  business_start TIME := '07:00';
  business_end TIME := '22:00';
  slot_cursor CURSOR FOR 
    SELECT bd.start_time, bd.end_time 
    FROM booking_details bd 
    WHERE bd.room_id = p_room_id 
    AND bd.date = p_date 
    ORDER BY bd.start_time;
  current_pos TIME := business_start;
  booking_record RECORD;
BEGIN
  -- Open cursor and iterate through bookings
  OPEN slot_cursor;
  LOOP
    FETCH slot_cursor INTO booking_record;
    EXIT WHEN NOT FOUND;
    
    -- If there's a gap before this booking
    IF current_pos < booking_record.start_time THEN
      slot_start_time := current_pos;
      slot_end_time := booking_record.start_time;
      duration_minutes := EXTRACT(EPOCH FROM (slot_end_time - slot_start_time))/60;
      RETURN NEXT;
    END IF;
    
    -- Move current position to end of this booking
    current_pos := GREATEST(current_pos, booking_record.end_time);
  END LOOP;
  CLOSE slot_cursor;
  
  -- Check for availability after last booking
  IF current_pos < business_end THEN
    slot_start_time := current_pos;
    slot_end_time := business_end;
    duration_minutes := EXTRACT(EPOCH FROM (slot_end_time - slot_start_time))/60;
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get bookings for a specific room and month
CREATE OR REPLACE FUNCTION get_room_bookings_for_month(
  p_room_id VARCHAR(10),
  p_year INTEGER, 
  p_month INTEGER
)
RETURNS TABLE(
  booking_id UUID,
  event_id UUID,
  date DATE,
  event_name VARCHAR,
  poc_name VARCHAR,
  phone_number VARCHAR,
  start_time TIME,
  end_time TIME,
  time_range TEXT,
  color_hue INTEGER,
  room_id VARCHAR,
  room_name VARCHAR,
  room_base_hue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bd.booking_id,
    bd.event_id,
    bd.date,
    bd.event_name,
    bd.poc_name,
    bd.phone_number,
    bd.start_time,
    bd.end_time,
    bd.time_range,
    bd.color_hue,
    bd.room_id,
    bd.room_name,
    bd.room_base_hue
  FROM booking_details bd
  WHERE bd.room_id = p_room_id
    AND EXTRACT(YEAR FROM bd.date) = p_year
    AND EXTRACT(MONTH FROM bd.date) = p_month
  ORDER BY bd.date, bd.start_time;
END;
$$ LANGUAGE plpgsql;

-- Get all bookings for a month (all rooms)
CREATE OR REPLACE FUNCTION get_all_bookings_for_month(
  p_year INTEGER, 
  p_month INTEGER
)
RETURNS TABLE(
  booking_id UUID,
  event_id UUID,
  date DATE,
  event_name VARCHAR,
  poc_name VARCHAR,
  phone_number VARCHAR,
  start_time TIME,
  end_time TIME,
  time_range TEXT,
  color_hue INTEGER,
  room_id VARCHAR,
  room_name VARCHAR,
  room_base_hue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bd.booking_id,
    bd.event_id,
    bd.date,
    bd.event_name,
    bd.poc_name,
    bd.phone_number,
    bd.start_time,
    bd.end_time,
    bd.time_range,
    bd.color_hue,
    bd.room_id,
    bd.room_name,
    bd.room_base_hue
  FROM booking_details bd
  WHERE EXTRACT(YEAR FROM bd.date) = p_year
    AND EXTRACT(MONTH FROM bd.date) = p_month
  ORDER BY bd.room_id, bd.date, bd.start_time;
END;
$$ LANGUAGE plpgsql;

-- Generate unique color hue for new events in a specific room's color spectrum
CREATE OR REPLACE FUNCTION generate_room_event_color_hue(p_room_id VARCHAR(10))
RETURNS INTEGER AS $$
DECLARE
  room_base_hue INTEGER;
  used_hues INTEGER[];
  new_hue INTEGER;
  hue_step INTEGER := 30; -- Smaller step for more color variations within spectrum
  spectrum_range INTEGER := 60; -- ±30 degrees from base hue
  attempt_count INTEGER := 0;
  max_attempts INTEGER := 20;
BEGIN
  -- Get room's base hue
  SELECT color_base_hue INTO room_base_hue 
  FROM rooms 
  WHERE id = p_room_id AND is_active = true;
  
  IF room_base_hue IS NULL THEN
    RAISE EXCEPTION 'Room % not found or inactive', p_room_id;
  END IF;
  
  -- Get all currently used hues for this room
  SELECT ARRAY_AGG(color_hue) INTO used_hues 
  FROM events 
  WHERE room_id = p_room_id;
  
  -- If no events exist for this room, return base hue
  IF used_hues IS NULL OR array_length(used_hues, 1) = 0 THEN
    RETURN room_base_hue;
  END IF;
  
  -- Generate new hue within room's spectrum
  WHILE attempt_count < max_attempts LOOP
    -- Calculate hue within spectrum range
    new_hue := room_base_hue + ((attempt_count * hue_step) % (spectrum_range * 2)) - spectrum_range;
    
    -- Normalize hue to 0-359 range
    new_hue := ((new_hue % 360) + 360) % 360;
    
    -- Check if this hue is far enough from existing hues (minimum 15 degrees)
    IF NOT EXISTS (
      SELECT 1 FROM unnest(used_hues) AS existing_hue 
      WHERE ABS(new_hue - existing_hue) < 15 
      OR ABS(new_hue - existing_hue) > 345
    ) THEN
      RETURN new_hue;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  -- Fallback: return base hue + small random offset
  RETURN ((room_base_hue + (random() * 40 - 20))::INTEGER % 360 + 360) % 360;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Triggers for Automatic Updates
-- =============================================

-- Update timestamp on rooms
CREATE OR REPLACE FUNCTION update_rooms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rooms_timestamp
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_rooms_timestamp();

-- Update timestamp on events
CREATE OR REPLACE FUNCTION update_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_timestamp
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_timestamp();

-- Update timestamp on bookings
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_timestamp();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (customize based on your auth requirements)
CREATE POLICY rooms_policy ON rooms FOR ALL USING (true);
CREATE POLICY events_policy ON events FOR ALL USING (true);
CREATE POLICY bookings_policy ON bookings FOR ALL USING (true);

-- =============================================
-- Initial Room Setup
-- =============================================

-- Insert the two rooms with their color schemes
INSERT INTO rooms (id, name, description, capacity, color_base_hue, is_active) VALUES
('1-21', 'AES Learnet Room 1-21', 'Main conference room with projector and whiteboard', 30, 0, true),     -- Red spectrum (hue 0)
('1-17', 'AES Learnet Room 1-17', 'Training room with flexible seating arrangement', 25, 240, true);   -- Blue spectrum (hue 240)

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert sample events for both rooms with appropriate color hues
DO $$
DECLARE
  room_21_event_id UUID;
  room_17_event_id UUID;
  room_21_event2_id UUID;
  room_17_event2_id UUID;
BEGIN
  -- Create events for Room 1-21 (Red spectrum) - Insert one at a time
  INSERT INTO events (room_id, event_name, poc_name, phone_number, start_time, end_time, color_hue) 
  VALUES ('1-21', 'ACP Training Program', 'ME3 Kok Wai Chung, CPL Kaleb Nim', '84953150', '08:00', '17:30', 0)
  RETURNING id INTO room_21_event_id;
  
  INSERT INTO events (room_id, event_name, poc_name, phone_number, start_time, end_time, color_hue) 
  VALUES ('1-21', 'Leadership Workshop', 'MSG John Tan', '91234567', '09:00', '16:00', 15)
  RETURNING id INTO room_21_event2_id;
  
  -- Create events for Room 1-17 (Blue spectrum) - Insert one at a time
  INSERT INTO events (room_id, event_name, poc_name, phone_number, start_time, end_time, color_hue) 
  VALUES ('1-17', 'Technical Briefing', 'LTA Sarah Lim', '87654321', '07:30', '17:00', 240)
  RETURNING id INTO room_17_event_id;
  
  INSERT INTO events (room_id, event_name, poc_name, phone_number, start_time, end_time, color_hue) 
  VALUES ('1-17', 'Team Building Session', 'CPT Michael Wong', '98765432', '10:00', '15:00', 255)
  RETURNING id INTO room_17_event2_id;
  
  -- Insert sample bookings for Room 1-21
  INSERT INTO bookings (event_id, date) VALUES
  -- ACP Training (5 days)
  (room_21_event_id, CURRENT_DATE + INTERVAL '7 days'),
  (room_21_event_id, CURRENT_DATE + INTERVAL '8 days'),
  (room_21_event_id, CURRENT_DATE + INTERVAL '9 days'),
  (room_21_event_id, CURRENT_DATE + INTERVAL '10 days'),
  (room_21_event_id, CURRENT_DATE + INTERVAL '11 days'),
  
  -- Leadership Workshop (3 days)
  (room_21_event2_id, CURRENT_DATE + INTERVAL '14 days'),
  (room_21_event2_id, CURRENT_DATE + INTERVAL '15 days'),
  (room_21_event2_id, CURRENT_DATE + INTERVAL '16 days');
  
  -- Insert sample bookings for Room 1-17
  INSERT INTO bookings (event_id, date) VALUES
  -- Technical Briefing (single day)
  (room_17_event_id, CURRENT_DATE + INTERVAL '20 days'),
  
  -- Team Building (2 days)
  (room_17_event2_id, CURRENT_DATE + INTERVAL '22 days'),
  (room_17_event2_id, CURRENT_DATE + INTERVAL '23 days');
END $$;

-- =============================================
-- Useful Queries for Development/Testing
-- =============================================

/*
-- View all rooms
SELECT * FROM rooms ORDER BY id;

-- View all bookings with room and event details
SELECT * FROM booking_details ORDER BY room_id, date, start_time;

-- Get bookings for Room 1-21 for current month
SELECT * FROM get_room_bookings_for_month('1-21', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);

-- Get all bookings for current month
SELECT * FROM get_all_bookings_for_month(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);

-- Check for conflicts in Room 1-21
SELECT check_room_booking_conflict('1-21', '2025-06-15', '09:00', '17:00');

-- Get available time slots for Room 1-17
SELECT * FROM get_room_available_slots('1-17', CURRENT_DATE + INTERVAL '7 days');

-- View room utilization
SELECT * FROM room_utilization;

-- Generate color hue for Room 1-21
SELECT generate_room_event_color_hue('1-21');

-- View events with booking counts by room
SELECT 
  r.id as room_id,
  r.name as room_name,
  e.*,
  COUNT(b.id) as total_bookings,
  MIN(b.date) as first_booking_date,
  MAX(b.date) as last_booking_date
FROM rooms r
LEFT JOIN events e ON r.id = e.room_id
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY r.id, r.name, e.id
ORDER BY r.id, e.created_at;

-- Clean up sample data
DELETE FROM bookings;
DELETE FROM events;
UPDATE rooms SET updated_at = NOW();
*/