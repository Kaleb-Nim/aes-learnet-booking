# Database Schema Redesign - Events & Bookings

## 🎯 Overview

The database has been redesigned to separate **Events** and **Bookings** into distinct entities, enabling:

1. **Cascading Operations** - Edit/delete entire events across all dates
2. **Event-Based Colors** - Unique color coding for each event
3. **Better Data Management** - Cleaner separation of concerns

## 📊 New Schema Structure

### **Events Table**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  poc_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color_hue INTEGER NOT NULL (0-359), -- HSL hue for unique colors
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### **Bookings Table**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, date) -- Prevent duplicate bookings for same event on same date
);
```

### **Booking Details View**
```sql
CREATE VIEW booking_details AS
SELECT 
  b.id as booking_id,
  b.date,
  e.id as event_id,
  e.event_name,
  e.poc_name,
  e.phone_number,
  e.start_time,
  e.end_time,
  e.color_hue,
  CONCAT(TO_CHAR(e.start_time, 'HH24:MI'), '-', TO_CHAR(e.end_time, 'HH24:MI')) as time_range
FROM bookings b
JOIN events e ON b.event_id = e.id;
```

## 🔄 Key Changes

### **1. Cascading Operations**
- **Delete Event** → Automatically deletes all associated bookings
- **Update Event** → Changes apply to all bookings for that event
- **Edit Timing** → Time changes cascade to all dates for the event

### **2. Color-Coded Events**
- Each event gets a unique hue value (0-359)
- Colors are generated using golden angle distribution for optimal visual separation
- Red spectrum focus with different hues for visual distinction

### **3. Data Relationships**
```
Event (1) → Bookings (Many)
├── ACP Training Program (Hue: 0)
│   ├── Booking: June 15, 2025
│   ├── Booking: June 16, 2025
│   └── Booking: June 17, 2025
├── Leadership Workshop (Hue: 137)
│   ├── Booking: July 1, 2025
│   └── Booking: July 2, 2025
```

## 🆕 New API Structure

### **EventAPI**
```typescript
// Create new event
EventAPI.createEvent(eventData: EventFormData): Promise<Event>

// Update event (cascades to all bookings)
EventAPI.updateEvent(eventId: string, updates: Partial<EventFormData>): Promise<Event>

// Delete event (cascades to all bookings)
EventAPI.deleteEvent(eventId: string): Promise<void>

// Create event with multiple bookings
EventAPI.createEventWithBookings(data: CreateEventWithBookingsData): Promise<{event, bookings}>
```

### **BookingAPI**
```typescript
// Create booking for existing event
BookingAPI.createBooking(eventId: string, date: string): Promise<Booking>

// Create multiple bookings for event
BookingAPI.createBookingsForEvent(eventId: string, dates: string[]): Promise<Booking[]>

// Get bookings with event details
BookingAPI.getBookingsForMonth(year: number, month: number): Promise<BookingWithEventDetails[]>
```

## 🎨 Color System

### **Hue Generation**
- Uses golden angle (137°) for optimal color distribution
- Automatically generates unique hues for new events
- Fallback system if database function unavailable

### **Color Utilities**
```typescript
// Generate color from hue
generateEventColor(hue: number): EventColor

// Get unique red-spectrum hue
generateUniqueRedHue(existingHues: number[]): number

// Convert to CSS variables
hueToCSS(hue: number): Record<string, string>
```

## 🔧 Migration Guide

### **Database Migration**
1. **Run Migration Script**: Execute `migration-to-v3.sql`
2. **Backup Created**: Original data backed up to `bookings_backup`
3. **Schema Updates**: New tables, views, and functions created
4. **Data Transformation**: Existing bookings converted to events + bookings

### **Code Updates Required**
1. **Import Changes**: Update imports to use new types
2. **API Calls**: Switch to new EventAPI/BookingAPI methods
3. **Component Updates**: Handle event-based data structure
4. **Color Integration**: Use color utilities for visual styling

## 📋 Database Functions

### **Conflict Checking**
```sql
check_booking_conflict(date, start_time, end_time, exclude_event_id) → boolean
```

### **Color Generation**
```sql
generate_event_color_hue() → integer
```

### **Monthly Queries**
```sql
get_bookings_for_month(year, month) → booking_details[]
```

## 🚀 Benefits

### **For Users**
- **Visual Distinction**: Each event has its own color across all dates
- **Bulk Operations**: Edit/delete entire events at once
- **Consistent Data**: All bookings for an event share the same details

### **For Developers**
- **Data Integrity**: Foreign key constraints prevent orphaned bookings
- **Simpler Queries**: Join tables for complete booking information
- **Scalable Architecture**: Easy to add event-level features

### **For Administration**
- **Event Management**: Manage recurring events as single entities
- **Color Coding**: Quickly identify related bookings visually
- **Cascade Operations**: Bulk changes without complex logic

## 🔄 Backward Compatibility

The redesign maintains backward compatibility through:
- **Legacy API methods** that map to new structure
- **Automatic migration** of existing data
- **Fallback functions** for missing database features
- **Type compatibility** with existing interfaces

## 📝 Example Usage

### **Creating Multi-Date Event**
```typescript
// New way - creates one event with multiple bookings
const result = await EventAPI.createEventWithBookings({
  event: {
    event_name: "Training Program",
    poc_name: "John Doe",
    start_time: "09:00",
    end_time: "17:00"
  },
  dates: ["2025-06-15", "2025-06-16", "2025-06-17"]
});

// Result: One event with unique color, three bookings
```

### **Editing Event (Cascades to All Bookings)**
```typescript
// Update timing for entire event
await EventAPI.updateEvent(eventId, {
  start_time: "08:00",
  end_time: "18:00"
});
// All bookings for this event now show new times
```

### **Deleting Entire Event**
```typescript
// Deletes event and all associated bookings
await EventAPI.deleteEvent(eventId);
// All bookings for all dates automatically removed
```

The redesigned schema provides a robust foundation for event management with proper data relationships, visual distinction through colors, and efficient bulk operations.