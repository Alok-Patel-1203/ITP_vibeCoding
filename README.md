# Salon Queue Management System
Live Deployment Link: https://202612018-vibe-coding.vercel.app

Real-time Salon Queue Management System eliminating weekend wait-time chaos with live status tracking for customers, barbers, reception, and waiting-area display.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Supabase Realtime

## Getting Started
```bash
npm install
npm run dev
```

## Available Routes
- `/` - Home Screen
- `/join` - Remote Queue Entry
- `/status/:id` - Customer Live Status Screen
- `/reception` - Reception Desk Dashboard (PIN: 1234)
- `/barber/:name` - Barber Chair Mirror View (PIN: 1234)
- `/display` - Waiting Area TV Screen
- `/admin` - Owner Settings & Analytics (PIN: 1234)
