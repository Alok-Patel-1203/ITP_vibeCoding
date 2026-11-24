# Salon Queue Management System
Live Deployment Link: https://202612018-vibe-coding.vercel.app

> A real-time, multi-device Salon Queue Management System designed to eliminate weekend wait-time chaos through live status synchronization across customer mobile phones, barber workstations, reception tablets, and a waiting-area TV display.

---

## 📌 Table of Contents
- [Problem Statement](#-problem-statement)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Design System & UI Theme](#-design-system--ui-theme)
- [User Roles & Screen Specifications](#-user-roles--screen-specifications)
- [Queue Business Rules & State Machine](#-queue-business-rules--state-machine)
- [Database Schema (Supabase Realtime)](#-database-schema-supabase-realtime)
- [Out-of-Scope Boundaries (Don't-Build List)](#-out-of-scope-boundaries-dont-build-list)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Vercel Deployment Guide](#-vercel-deployment-guide)
- [10-Point Verification Checklist](#-10-point-verification-checklist)

---

## 🚨 Problem Statement

On busy weekends, salon customers frequently experience frustrating wait times of 1 to 2 hours without knowing when their turn will come:
- **Customer Frustration & Drop-offs**: Lack of wait-time transparency leads to abandoned queues and lost revenue.
- **In-Salon Friction**: Unclear queue seniority leads to disputes over arrival sequence in waiting areas.
- **Operational Strain**: Barbers and receptionists are constantly interrupted with repetitive *"How much longer?"* questions instead of focusing on haircuts and grooming services.

This platform bridges that gap with sub-5-second real-time state synchronization across all salon stakeholders.

---

## 🛠 System Architecture & Tech Stack

- **Frontend**: React 18 + Vite (Single Page Application)
- **Styling**: Tailwind CSS (Utility-first styling with custom Charcoal & Gold aesthetic)
- **Routing**: React Router v6 with `vercel.json` SPA fallback rewrites
- **State & Realtime Synchronization**: Supabase Realtime (`@supabase/supabase-js`) listening to `postgres_changes` across tables
- **Single Source of Truth**: All queue calculation, validation, and transition logic encapsulated in `src/services/queueService.js`
- **Internationalization (i18n)**: Centralized bilingual dictionary (`en` & `gu`) in `src/i18n/translations.js` with persistent language toggle
- **Hosting & CI/CD**: Vercel

---

## 🎨 Design System & UI Theme

- **Aesthetic**: Premium, luxurious salon ambience.
- **Color Palette**:
  - **Dominant Charcoal Background**: `#1F2937` (`bg-charcoal` / `gray-800`)
  - **Luxurious Gold Accents**: `#D4A017` (`text-gold`, `border-gold`, `bg-gold`)
  - **Warning / Delay Accent**: Amber `#F59E0B` (applied when wait time exceeds 60 minutes)
  - **Typography**: Clean, readable sans-serif typography with high contrast for long-distance viewing.
- **Components**: Rounded card containers (`rounded-xl` and `rounded-2xl`), accessible touch targets (minimum 44px+ for mobile tap surfaces), and tactile button feedback.

---

## 📱 User Roles & Screen Specifications

All staff-facing views are protected with a secure staff access PIN (configurable in salon settings).

| Route | View Name | Target Device | Core Features & Access |
| :--- | :--- | :--- | :--- |
| `/` | **Home Screen** | Mobile / Desktop | Live queue summary, active wait-time estimates, salon operating hours, and one-tap CTA to join queue. |
| `/join` | **Remote Queue Entry** | Mobile Web | 10-digit phone validation, multi-service selector (up to 3 services with live duration & price totals), barber selection (`Any` vs specific barber), duplicate active spot prevention. |
| `/status/:id` | **Customer Live Status** | Mobile Web | Live self-updating queue position (e.g. `2nd in line`), dynamic countdown estimate, "Start coming" alert banner, full-screen gold modal alert when called ("It's your turn! Go to [Barber]"), and cancel option. |
| `/reception` | **Reception Dashboard** | Tablet Landscape | **Staff PIN Protected**. Rapid walk-in entry, per-barber chair status cards with `Call Next` actions, chronological waiting list, `No-Show` and `Cancel` controls, >60 min amber visual delay warnings. |
| `/barber/:name` | **Barber Mirror View** | Mobile / Tablet | **Staff PIN Protected**. Displays currently seated customer, requested services, live elapsed service timer, one-tap state progression (`Start` ➔ `Done`), next queued customer preview, and `Available` vs `On Break` toggle. |
| `/display` | **Waiting-Area TV Display** | TV / Large Screen | Full-screen, high-contrast display legible from 5+ meters. Shows side-by-side chair status (`Now: S-12`), "Up Next" list of next 5 tokens with wait estimates, flashing gold card, and audio chime when a customer is called. |
| `/admin` | **Owner Settings & Analytics**| Desktop / Tablet | **Staff PIN Protected**. Service catalog CRUD (EN/GU names, duration, price, active toggle), barber roster shift toggle, global online queue toggle (`Open`/`Closed`), and real-time daily analytics summary. |

---

## ⚙️ Queue Business Rules & State Machine

All business rules are strictly maintained in [src/services/queueService.js](file:///d:/STUDY%20MATERIALS/DAU/itp%20practical/salon_queue_system/src/services/queueService.js) as the single source of truth:

```
[Waiting] ───(Call next)───► [Called] ───(Start service)───► [In chair] ───(Done)───► [Done]
    │                           │
    ├──(Cancel)──► [Cancelled]  └──(10 min timeout)──► [No-show]
```

1. **Unidirectional State Transitions**:
   - Tokens can only move forward: `Waiting` ➔ `Called` ➔ `In chair` ➔ `Done`.
   - Reverting states backward is strictly forbidden.
   - `Cancelled` and `No-show` are terminal states. If a customer returns after being marked No-Show, they must be registered as a completely new entry at the tail end of the queue.
2. **First-Come, First-Served (FCFS) with Barber Preference**:
   - Customers are called in chronological order (`created_at ASC`).
   - If Barber X triggers `Call Next`, the system assigns the earliest waiting customer who requested Barber X **or** selected `Any barber`.
   - **Preference Isolation**: A customer who requested Ravi will never be assigned to Amit or Imran, even if other barbers become free first.
3. **Single-Occupancy Chair Invariant**:
   - A barber chair can hold at most **one** customer in `In chair` status at any time.
4. **Dynamic Wait-Time Formula**:
   $$\text{Estimated Wait Time} \approx \frac{\sum \text{Service Durations of all pending customers ahead}}{\text{Active On-Duty Barbers}}$$
   - For specific barber selections, wait time is calculated exclusively based on that barber's current chair remaining time plus waiting customers in that barber's line.
5. **Duplicate Phone Prevention**:
   - A phone number can hold only **one active token** (`Waiting`, `Called`, or `In chair`) at any given time. Submitting an active phone number redirects directly to the existing active token's status screen.
6. **Online Cutoff Policy**:
   - Online queue joining automatically closes **30 minutes prior to salon closing** (e.g., closes at 8:30 PM if salon closes at 9:00 PM). Reception can still enter in-person walk-ins up to closing time.
7. **Barber Breaks**:
   - When a barber is set to `On break`, they are excluded from the `Any` barber auto-assignment pool.
   - Customers waiting specifically for that barber receive an informative notice: *"Barber is currently on a short break. Your spot is preserved."*
8. **10-Minute Grace Period**:
   - When a customer is `Called`, a 10-minute timer starts. If they fail to report to the chair, the receptionist can mark them as `No-show`.

---

## 🗄 Database Schema (Supabase Realtime)

The database consists of 4 core tables with Row-Level Security (RLS) enabled and broadcasted via `supabase_realtime`:

### 1. `services`
- `id` (text, primary key) — e.g. `'haircut'`, `'beard_trim'`, `'hair_spa'`, `'facial'`
- `name_en` (text) — English title
- `name_gu` (text) — Gujarati title
- `duration` (integer) — Estimated duration in minutes
- `price` (numeric) — Price in ₹
- `active` (boolean) — Available for selection

### 2. `barbers`
- `id` (text, primary key) — e.g. `'ravi'`, `'amit'`, `'imran'`
- `name` (text) — Barber display name
- `photo_url` (text) — Avatar image URL
- `is_on_duty` (boolean) — Present on shift
- `is_on_break` (boolean) — Temporarily on break

### 3. `queue_entries`
- `id` (uuid, primary key) — Unique record identifier
- `token_number` (text) — Daily sequential token (e.g. `'S-01'`, `'S-02'`)
- `customer_name` (text) — Name of the customer
- `phone_number` (text) — Validated 10-digit mobile number
- `services` (jsonb / text[]) — Selected service IDs
- `preferred_barber` (text) — Barber ID or `'any'`
- `assigned_barber` (text, nullable) — Barber ID who called the customer
- `status` (text) — `'Waiting'`, `'Called'`, `'In chair'`, `'Done'`, `'Cancelled'`, `'No-show'`
- `estimated_wait_min` (integer) — Dynamically calculated wait estimate
- `called_at` (timestamptz, nullable) — Timestamp when status became `'Called'`
- `service_started_at` (timestamptz, nullable) — Timestamp when service started
- `completed_at` (timestamptz, nullable) — Timestamp when service finished
- `created_at` (timestamptz) — Creation timestamp for chronological queue priority

### 4. `salon_settings`
- `id` (text, primary key) — Single configuration row (`'default'`)
- `is_queue_open` (boolean) — Master toggle for online queue joining
- `opening_time` (text) — e.g. `'09:00'`
- `closing_time` (text) — e.g. `'21:00'`
- `staff_pin` (text) — Secure staff access PIN

---

## 🚫 Out-of-Scope Boundaries (Don't-Build List)

To maintain focus and simplicity, the following features are strictly prohibited:
- ❌ **Online Payments & Billing**: Cash/POS payments occur in person at the desk; no payment gateways.
- ❌ **Future-Date Appointments / Booking Calendar**: Strictly a real-time, same-day queue system.
- ❌ **SMS or WhatsApp Notifications**: All updates occur via real-time web socket subscriptions on the open web page.
- ❌ **Loyalty Programs & Discounts**: No reward points, customer tiers, or discount codes.
- ❌ **Multi-Branch Support**: Dedicated to single-salon operations.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/salon-queue-system.git
   cd salon-queue-system
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Staff Access PIN**:
   Use your configured staff access PIN (set in salon settings) to unlock Reception (`/reception`), Barber Station (`/barber/:name`), and Admin (`/admin`).

---

## 🔐 Environment Variables

| Variable | Description | Where to Set |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project API URL | `.env` (local) & Vercel Project Settings |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Public API Key | `.env` (local) & Vercel Project Settings |

---

## 🌐 Vercel Deployment Guide

1. Push your latest code to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. In **Project Settings ➔ Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. The repository includes `vercel.json` to handle client-side routing rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Deploy! Your app will be live and automatically synchronizing across all devices.

---

## ✅ 10-Point Verification Checklist

Verify these 10 core scenarios to confirm end-to-end functionality:

1. [x] **Multi-Service Calculation**: Selecting Haircut (₹150, 30m) + Beard trim (₹80, 15m) accurately displays total price (₹230) and duration (45m) on both Join and Status pages.
2. [x] **Duplicate Phone Guard**: Attempting to join with an active queue phone number rejects duplicate creation and redirects to the active `/status/:id`.
3. [x] **Barber Preference Routing**: Triggering `Call next` for Barber Amit skips a waiting customer who explicitly chose Ravi, calling the earliest customer requesting Amit or `Any`.
4. [x] **Realtime Turn Notification Latency**: Calling a customer triggers the full-screen gold alert modal ("It's your turn!") on `/status/:id` within 5 seconds.
5. [x] **Cross-Screen Progression Sync**: Tapping `Start` and `Done` in `/barber/:name` immediately updates Reception (`/reception`) and TV Display (`/display`).
6. [x] **No-Show Re-addition at Tail**: Marking a customer `No-show` terminates that token; re-adding them as a walk-in places them at the tail end with a new sequential token.
7. [x] **Queue Closing Lockout**: Switching the queue to `Closed` in `/admin` immediately disables the `Join Queue` CTA on `/` and displays the queue closed banner.
8. [x] **Full Bilingual Localization**: Switching EN/GU language toggle updates 100% of UI strings without missing keys or hard-coded English leakage.
9. [x] **Dynamic Wait-Time Reduction**: Completing services reduces the estimated wait times dynamically across waiting entries without manual page refresh.
10. [x] **Multi-Device Realtime Consistency**: Opening customer mobile, reception tablet, and TV display simultaneously demonstrates sub-5s live state synchronization.
