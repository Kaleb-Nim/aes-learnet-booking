# Multi-Room Booking System - Feature Implementation

## 🎯 Overview

The AES Learnet Room Booking System has been enhanced to support **multiple rooms** with distinct color schemes:

- **Room 1-21**: Red color spectrum (Hue 0 ± 30°)
- **Room 1-17**: Blue color spectrum (Hue 240 ± 30°)

## 🏢 Room Configuration

### **Room 1-21 (Red Spectrum)**
```json
{
  "id": "1-21",
  "name": "AES Learnet Room 1-21", 
  "description": "Main conference room with projector and whiteboard",
  "capacity": 30,
  "color_base_hue": 0,
  "primary_color": "red"
}
```

### **Room 1-17 (Blue Spectrum)**
```json
{
  "id": "1-17",
  "name": "AES Learnet Room 1-17",
  "description": "Training room with flexible seating arrangement", 
  "capacity": 25,
  "color_base_hue": 240,
  "primary_color": "blue"
}
```

## 📊 Enhanced Database Schema (v4)

### **New Tables**

#### **Rooms Table**
```sql
CREATE TABLE rooms (
  id VARCHAR(10) PRIMARY KEY,        -- '1-21', '1-17'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INTEGER,
  color_base_hue INTEGER NOT NULL,   -- Base hue for color spectrum
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **Updated Events Table**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  room_id VARCHAR(10) REFERENCES rooms(id),  -- NEW: Room association
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color_hue INTEGER NOT NULL,                -- Within room's spectrum
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Enhanced Views**

#### **Booking Details with Room Info**
```sql
CREATE VIEW booking_details AS
SELECT 
  b.id as booking_id,
  b.date,
  e.event_name,
  e.poc_name,
  e.start_time,
  e.end_time,
  e.color_hue,
  r.id as room_id,          -- NEW: Room details
  r.name as room_name,
  r.color_base_hue,
  r.capacity
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN rooms r ON e.room_id = r.id;
```

## 🎨 Room-Based Color System

### **Color Spectrum Allocation**

#### **Room 1-21 (Red Spectrum)**
- **Base Hue**: 0° (Pure Red)
- **Spectrum Range**: 330° - 30° (±30° from base)
- **Color Variations**: 
  - Deep Red: 345° - 359°
  - Pure Red: 0° - 15°
  - Red-Orange: 16° - 30°
  - Red-Violet: 315° - 344°

#### **Room 1-17 (Blue Spectrum)**
- **Base Hue**: 240° (Pure Blue)
- **Spectrum Range**: 210° - 270° (±30° from base)
- **Color Variations**:
  - Blue-Cyan: 210° - 224°
  - Pure Blue: 225° - 255°
  - Blue-Violet: 256° - 270°

### **Color Generation Functions**
```typescript
// Generate room-specific color
generateUniqueRoomHue('1-21', existingHues) // Returns red spectrum hue
generateUniqueRoomHue('1-17', existingHues) // Returns blue spectrum hue

// Get room preset colors
getRoomPresetColors('1-21') // Returns 10 red variations
getRoomPresetColors('1-17') // Returns 10 blue variations
```

## 🔧 Enhanced API Functions

### **Room Management**
```typescript
// Get all active rooms
RoomAPI.getAllRooms(): Promise<Room[]>

// Get room utilization stats
RoomAPI.getRoomUtilization(roomId: string): Promise<RoomUtilization>

// Check room availability
RoomAPI.isRoomAvailable(roomId: string, date: string, startTime: string, endTime: string): Promise<boolean>
```

### **Room-Specific Booking**
```typescript
// Get bookings for specific room and month
BookingAPI.getRoomBookingsForMonth(roomId: string, year: number, month: number): Promise<BookingWithEventDetails[]>

// Create event for specific room
EventAPI.createEvent({
  room_id: '1-21',
  event_name: 'Meeting',
  // ... other fields
}): Promise<Event>

// Check room conflicts
BookingAPI.checkRoomConflict('1-21', date, startTime, endTime): Promise<boolean>
```

## 📋 Database Functions

### **Room-Specific Conflict Checking**
```sql
-- Check conflicts for specific room
SELECT check_room_booking_conflict('1-21', '2025-06-15', '09:00', '17:00');

-- Get room bookings for month
SELECT * FROM get_room_bookings_for_month('1-21', 2025, 6);

-- Generate room-specific color hue
SELECT generate_room_event_color_hue('1-21'); -- Returns red spectrum hue
SELECT generate_room_event_color_hue('1-17'); -- Returns blue spectrum hue
```

### **Room Utilization Queries**
```sql
-- View room utilization
SELECT * FROM room_utilization;

-- Get all bookings across rooms
SELECT * FROM get_all_bookings_for_month(2025, 6);
```

## 🎯 User Interface Enhancements

### **Room Selection**
- **Room Dropdown**: Select room when creating bookings
- **Room Filter**: Filter calendar view by room
- **Room Tabs**: Switch between room views
- **Room Legend**: Visual indication of room color schemes

### **Visual Distinctions**
- **Color-Coded Events**: Each room's events display in their color spectrum
- **Room Headers**: Clear room identification in calendar
- **Room Icons**: Visual indicators for each room type

### **Enhanced Forms**
```typescript
interface BookingFormData {
  room_id: string;        // NEW: Required room selection
  date: string;
  event_name: string;
  poc_name: string;
  phone_number?: string;
  start_time: string;
  end_time: string;
}
```

## 🚀 Migration Process

### **From v3 to v4**
1. **Run Migration Script**: Execute `migration-to-v4.sql`
2. **Room Setup**: Two rooms automatically created with color schemes
3. **Event Assignment**: Existing events assigned to Room 1-21
4. **Color Adjustment**: Event colors adjusted to fit room spectrum
5. **View Updates**: New views include room information

### **Backward Compatibility**
- **Legacy API Support**: Old API methods still work
- **Default Room**: Existing bookings assigned to Room 1-21
- **Type Compatibility**: Legacy types supported with adapters

## 📊 Sample Data Structure

### **Room 1-21 Event**
```json
{
  "event_id": "123e4567-e89b-12d3-a456-426614174000",
  "room_id": "1-21",
  "event_name": "ACP Training Program",
  "color_hue": 15,           // Red-orange
  "room_base_hue": 0,        // Room's base red
  "room_name": "AES Learnet Room 1-21"
}
```

### **Room 1-17 Event**
```json
{
  "event_id": "123e4567-e89b-12d3-a456-426614174001", 
  "room_id": "1-17",
  "event_name": "Technical Briefing",
  "color_hue": 255,          // Pure blue
  "room_base_hue": 240,      // Room's base blue
  "room_name": "AES Learnet Room 1-17"
}
```

## 🔍 Testing & Validation

### **Room Functionality Tests**
```sql
-- Test room conflict detection
SELECT check_room_booking_conflict('1-21', '2025-06-15', '09:00', '17:00');
SELECT check_room_booking_conflict('1-17', '2025-06-15', '09:00', '17:00');

-- Test color generation
SELECT generate_room_event_color_hue('1-21'); -- Should return 0-60 or 300-360
SELECT generate_room_event_color_hue('1-17'); -- Should return 210-270

-- Verify room utilization
SELECT * FROM room_utilization;
```

### **UI Integration Tests**
- Room selection in booking forms
- Color-coded calendar display
- Room-specific filtering
- Cross-room availability checking

## 🎨 Color Examples

### **Room 1-21 (Red Spectrum)**
- Event A: `hsl(0, 70%, 45%)` - Pure Red
- Event B: `hsl(15, 70%, 45%)` - Red-Orange  
- Event C: `hsl(345, 70%, 45%)` - Deep Red
- Event D: `hsl(330, 70%, 45%)` - Red-Violet

### **Room 1-17 (Blue Spectrum)**
- Event A: `hsl(240, 70%, 45%)` - Pure Blue
- Event B: `hsl(225, 70%, 45%)` - Light Blue
- Event C: `hsl(255, 70%, 45%)` - Blue-Violet
- Event D: `hsl(210, 70%, 45%)` - Blue-Cyan

## 📈 Benefits

### **For Users**
- **Clear Room Distinction**: Visual separation of room bookings
- **Better Planning**: See availability across multiple rooms
- **Intuitive Interface**: Color-coded room identification

### **For Administrators**
- **Room Management**: Individual room utilization tracking
- **Conflict Prevention**: Room-specific availability checking
- **Scalable System**: Easy to add more rooms

### **For System**
- **Data Integrity**: Proper room-event relationships
- **Performance**: Optimized room-specific queries
- **Extensibility**: Foundation for additional room features

The multi-room system provides a robust foundation for managing multiple spaces while maintaining clear visual distinctions and preventing booking conflicts across different rooms.