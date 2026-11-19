# 01 - Project Brief: Salon Queue Management System

## 1. Problem Statement
On busy weekends, salon customers frequently experience frustrating wait times of 1 to 2 hours without knowing when their turn will come. Because queue visibility is absent:
- Many frustrated customers abandon the wait and walk away, causing revenue loss.
- In-salon arguments erupt among waiting customers over arrival sequence and who should be served next.
- Reception staff and barbers face continuous pressure answering repetitive "How much longer?" inquiries instead of focusing on service delivery.

The **Salon Queue Management System** solves this by providing real-time, transparent digital queuing across customer mobile devices, barber stations, front-desk reception, and a large waiting-area TV display.

---

## 2. Target Users

| User Persona | Context & Primary Needs |
| :--- | :--- |
| **Customers** | Join queue remotely or upon arrival, select desired services and preferred barber, track live position and estimated wait time, receive clear alert when to approach the chair. |
| **Receptionist / Salon Owner** | Add walk-in customers instantly, call the next eligible customer, track queue health, manage no-shows and cancellations, configure services and staff shifts. |
| **Barbers** | View assigned customer details and chosen services, control chair workflow (`Start` / `Done`), signal readiness for next customer, and toggle break status. |

---

## 3. Must-Have Core Features

1. **Remote Queue Joining (Mobile Web)**
   - Customers can join the queue on their phone with a validated 10-digit mobile number.
   - Choose up to 3 services simultaneously (duration and pricing clearly shown).
   - Select either a specific barber or opt for `Any barber (fastest)`.

2. **Live Customer Status & Dynamic Alerts**
   - Live self-updating status screen with assigned token (e.g., `S-14`).
   - Real-time queue position indicator (e.g., `4th in line`) and circular countdown timer.
   - Proactive notification banner: *"Start coming to the salon"* when 2nd in line.
   - Full-screen gold alert modal: *"It's your turn! Go to [Barber Name]"* when called.

3. **Reception Dashboard (Tablet Landscape)**
   - Add walk-in customers quickly with minimal input taps.
   - Per-barber status cards showing current chair occupant and `Call next` trigger.
   - Chronological waiting list with quick actions to mark `No-show` or `Cancel`.
   - Visual alert highlights (amber tag) for customers waiting longer than 60 minutes.

4. **Barber Workstation Screen (Mobile View)**
   - Displays the current customer in chair, services requested, and active elapsed timer.
   - One-tap status progression: `Start` service, followed by `Done`.
   - Preview of the next queued customer specifically designated for that barber.
   - Status toggle: `Available` vs. `On break`.

5. **Waiting-Area TV Display (`/display`)**
   - High-contrast, large-format layout legible from a distance of 5+ meters.
   - Side-by-side / grid overview of all barber chairs (Barber Photo, Name, active token: `Now: S-12`).
   - "Up Next" panel listing the next 5 upcoming tokens with estimated wait times.
   - Audio chime and gold flashing visual feedback whenever a token is called.

6. **Owner Admin & Salon Settings (`/admin`)**
   - Service catalog management (Service Name in English & Gujarati, Duration in minutes, Price in ₹, Active On/Off toggle).
   - Barber shift roster toggle (On duty / Off duty).
   - Global queue toggle (`Open` / `Closed` for online queue entries).
   - Real-time daily analytics summary (total customers served, average wait time, total no-shows).

---

## 4. Don't-Build List (Strictly Out of Scope)

To maintain focus and simplicity, the following features are strictly prohibited:
- ❌ **Online Payments & Billing**: Cash/POS transactions remain in-person at the desk; no payment gateways.
- ❌ **Future-Date Appointments / Booking Calendar**: This is strictly a real-time, same-day queue system.
- ❌ **SMS or WhatsApp Notifications**: All updates occur via real-time web socket subscriptions on the open web page.
- ❌ **Loyalty Programs, Points & Discounts**: No membership tiers or points tracking.
- ❌ **Multi-Branch Support**: Single salon location operation only.

---

## 5. Look & Feel Guidelines

- **Style Identity**: High-end, premium salon ambience.
- **Color Palette**:
  - Dominant Background: Deep Dark Charcoal (`#1F2937`)
  - Accent / Highlights / Calls-to-Action: Luxurious Gold (`#D4A017`)
  - Neutral Text: Crisp White (`#FFFFFF`) and Muted Gray (`#9CA3AF`)
  - Warning Accent: Amber (`#F59E0B`) for wait times exceeding 60 minutes
- **Design Principles**:
  - Mobile-first approach for customer and barber views.
  - Generous card borders, subtle shadows, and rounded container cards (`rounded-xl` / `rounded-2xl`).
  - High typographic clarity and legible contrasts across screens.
- **Bilingual Localization**:
  - Full dual-language support: **English (EN)** and **Gujarati (GU)**.
  - Accessible language toggle on top navigation of all screens.
  - Zero hard-coded text in UI components.
