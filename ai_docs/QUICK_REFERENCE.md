# Quick Reference - AES Learnet Room Booking System

**Status**: Production Ready  
**Last Updated**: December 2024  
**Version**: Multi-Room Enhanced

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Deployment
1. Connect to Vercel
2. Add Supabase environment variables
3. Deploy automatically

## 🏢 Room System

### Available Rooms
- **Room 1-21**: Main Conference Room (Red color scheme)
- **Room 1-17**: Training Room (Blue color scheme)

### Booking Process
1. **Click any calendar date** (no separate buttons needed)
2. **Select room** from dropdown
3. **Choose time slot**: Full day, Morning, or Afternoon
4. **Fill event details** and submit

## 🎯 Key Features

### ✅ Working Features
- **Multi-room booking** - Book available rooms on any date
- **Visual room distinction** - Color-coded booking cards
- **Smart availability** - Shows which specific rooms are free
- **Conflict prevention** - Room-specific validation
- **Mobile responsive** - Works on all devices
- **Real-time updates** - Supabase integration

### 🛠️ Recent Fixes
- ✅ **Fixed time validation** - No more false errors when editing
- ✅ **Fixed white box bug** - Proper booking card rendering
- ✅ **Room name display** - Clear room identification
- ✅ **Simplified time selection** - Preset slots only
- ✅ **Multi-room conflicts** - Room-aware validation

## 📊 System Architecture

### Database
- **Events table** - Master event information
- **Bookings table** - Individual date instances
- **Rooms table** - Room configuration

### Frontend
- **Next.js 15** with App Router
- **TypeScript** strict mode
- **Tailwind CSS v4** styling
- **React Hook Form** validation

### Backend
- **Supabase** PostgreSQL database
- **Real-time subscriptions**
- **Row-level security**

## 🎨 Visual System

### Room Colors
- **Room 1-21**: Red spectrum (`bg-red-100`, `text-red-800`)
- **Room 1-17**: Blue spectrum (`bg-blue-100`, `text-blue-800`)
- **Available**: Green indicators
- **Unavailable**: Red indicators

### Time Slots
- **Full day**: 08:00-17:30
- **Morning**: 08:00-12:00
- **Afternoon**: 13:00-17:30

## 🔧 Technical Details

### Key Components
- `Calendar.tsx` - Main calendar display
- `CalendarDay.tsx` - Individual day cells with room logic
- `BookingForm.tsx` - Single date booking
- `MultiDateBookingForm.tsx` - Consecutive date booking
- `BookingDetailsModal.tsx` - View/edit existing bookings

### Important Files
- `dateUtils.ts` - Multi-room availability logic
- `colorUtils.ts` - Room-specific color generation
- `validationSchemas.ts` - Form validation rules
- `supabase.ts` - Database operations

## 📝 Common Tasks

### Adding New Room
1. Update `ROOM_COLOR_SCHEMES` in `colorUtils.ts`
2. Add room option in form dropdowns
3. Update availability logic in `dateUtils.ts`

### Modifying Time Slots
1. Update `commonTimeSlots` in `validationSchemas.ts`
2. Ensure database constraints accommodate new times

### Styling Changes
1. Room colors: Modify `colorUtils.ts`
2. Layout: Update Tailwind classes
3. Responsive: Adjust breakpoint-specific styles

## 🐛 Troubleshooting

### Common Issues
- **White booking cards**: Check Tailwind CSS compilation
- **Time validation errors**: Ensure preset time slots are used
- **Room conflicts**: Verify room-specific logic
- **Calendar not updating**: Check Supabase connection

### Debug Commands
```bash
npm run lint        # Check code issues
npm run build      # Test production build
npx tsc --noEmit  # Check TypeScript
```

## 📚 Documentation

### Complete Docs
- `BUGFIXES_AND_IMPROVEMENTS.md` - Recent changes
- `IMPLEMENTATION_STATUS.md` - Full feature status
- `MULTI_ROOM_FEATURE_README.md` - Room system details
- `SUPABASE_SETUP.md` - Database setup guide

### Architecture Docs
- `DB_REDESIGN_README.md` - Database schema
- `BOOKING_DETAILS_FEATURE.md` - Modal functionality
- `MOBILE_IMPROVEMENTS.md` - Responsive design

---

**Need Help?** Check the comprehensive documentation in `/ai_docs/` folder.