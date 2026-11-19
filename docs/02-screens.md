# 02 - Screen Specifications: Salon Queue Management System

This document outlines the detailed UI/UX specifications, component hierarchies, responsive behavior, interaction states, and error handling for all 7 screens.

---

## 1. Home Screen

- **URL**: `/`
- **Primary Users**: Customers browsing salon availability and preparing to join the queue.
- **UI Elements (Top to Bottom)**:
  1. **Top Header**:
     - Salon Logo & Salon Name (e.g., *Royal Crown Men's Salon*).
     - Language Toggle button (`EN` | `ગુજરાતી`).
     - Staff Portal link (`/reception` or PIN trigger).
  2. **Salon Operational Badge**:
     - Pill badge: `Open · Closes 9 PM` (Green dot for open, red dot if closed).
  3. **Live Queue Summary Card**:
     - Charcoal card with gold border.
     - Metrics: `6 people waiting · about 50 min wait time`.
     - Small real-time pulse animation indicator ("Live").
  4. **Barber Availability Chips / Cards**:
     - Horizontal chip list / avatars of active barbers on duty.
     - Status badges: `Free` (emerald), `Busy` (amber), or `On break` (gray).
  5. **Call-to-Action (CTA)**:
     - Prominent, full-width gold button: `[Join Queue]`.
- **Button Actions**:
  - `[EN | ગુજરાતી]`: Toggles the active language state between English and Gujarati across all strings.
  - `[Join Queue]`:
    - If queue is open: Navigates to `/join`.
    - If user already has an active session token stored in `localStorage`: Redirects straight to `/status/:id`.
    - If online queue is marked closed: Button is disabled with an explanatory tooltip/banner.
- **Responsive Layout**:
  - **Mobile (< 768px)**: Single-column centered feed, fixed sticky bottom CTA for `[Join Queue]`.
  - **Tablet / Desktop (≥ 768px)**: Centered max-w-md or max-w-lg card with generous padding.
- **Empty & Error States**:
  - *Queue Empty*: Displays `0 people waiting · 0 min wait` with subtext *"Walk in right now for immediate service!"*.
  - *Queue Closed*: Gold button replaced by dark gray banner: *"Online joining is currently closed. Walk-ins still welcome at desk until 9:00 PM."*.
  - *Network Offline*: Sticky top bar: *"Reconnecting to live queue updates..."*.

---

## 2. Join Queue Screen

- **URL**: `/join`
- **Primary Users**: Remote or in-salon customers entering their details to reserve a spot.
- **UI Elements (Top to Bottom)**:
  1. **Top Bar**:
     - Back navigation arrow (`< Back to Home`).
     - Screen Title: `Join Salon Queue / કતારમાં જોડાઓ`.
     - Language selector.
  2. **Customer Input Form**:
     - **Name Field**: Text input, auto-capitalized, required.
     - **Phone Field**: Numerical 10-digit input, validated for standard Indian mobile prefixes (`^[6-9]\d{9}$`).
  3. **Service Selection (Multi-select, Max 3)**:
     - Selectable interactive cards displaying name, duration, and price:
       - Card 1: *Haircut* · 30 min · ₹150
       - Card 2: *Beard Trim* · 15 min · ₹80
       - Card 3: *Hair Spa* · 45 min · ₹400
       - Card 4: *Shave* · 20 min · ₹100
     - Checkmark indicator and gold highlight when selected.
     - Helper text: *"Select up to 3 services"*. If 3 are already selected, remaining unselected cards become dimmed.
  4. **Barber Picker**:
     - First card: `Any barber (fastest)` (selected by default; highlighted with a speed badge).
     - Subsequent cards: Barber photo avatars, names, and status (`Ravi`, `Amit`, `Kunal`).
  5. **Dynamic Live Summary Bar (Sticky above button)**:
     - Calculates dynamically: `Total 45 min · ₹230 · Expected wait ~35 min`.
  6. **Submission CTA**:
     - Large Gold Button: `[Confirm & Join Queue]`.
- **Button Actions**:
  - `[Select Service Card]`: Toggles selection on/off; updates live summary. Enforces max 3 limit.
  - `[Barber Card]`: Sets preferred barber ID or `'any'`.
  - `[Confirm & Join Queue]`: Validates name and phone. Submits record to Supabase. Saves token ID to browser storage and routes to `/status/:id`.
- **Responsive Layout**:
  - **Mobile**: Vertical scrollable form with a sticky bottom summary dock containing the `[Confirm]` button.
  - **Tablet / Desktop**: Centered two-column grid (Left: Name/Phone + Barber picker; Right: Services list + Summary box).
- **Empty & Error States**:
  - *Validation Errors*: Inline red message under phone (`"Please enter a valid 10-digit mobile number"`).
  - *Duplicate Phone Active*: Error modal: *"You already have an active spot (Token S-14) in the queue"* with a direct button `[View My Spot]`.
  - *Queue Closed Concurrently*: Alert modal: *"Queue has just closed for new entries."* with return to Home button.

---

## 3. My Status Screen

- **URL**: `/status/:id`
- **Primary Users**: Customers tracking their queue progress in real time.
- **UI Elements (Top to Bottom)**:
  1. **Status Header**:
     - Salon branding with pulsing live indicator.
     - Language toggle.
  2. **Token Display Card**:
     - Prominent large token badge: `S-14` (extra-large, bold gold font).
     - Subtitle: *"Joined at 11:15 AM for Haircut + Beard Trim"*.
  3. **Queue Position & Estimated Wait**:
     - Current standing: `4th in line`.
     - Assigned / Preferred Barber info: `Assigned: Any barber` or `Preferred: Ravi`.
     - Self-updating Circular Progress Ring: displaying estimated minutes remaining (e.g., `~35 min`).
  4. **Dynamic Context Banners**:
     - *When 2nd in line*: Prominent amber notification banner appears:
       > 🔔 **"Start coming to the salon! You are 2nd in line."**
  5. **Turn Modal (Overlay Alert)**:
     - When status changes to `Called`:
       - Full-screen gold modal with pulsing animation and vibration (on supported devices):
       - Header: **"It's your turn!"**
       - Direction: **"Please proceed to chair: Ravi"**
       - Token: `S-14`
       - Notice: *"Please report to the reception or chair within 10 minutes."*
  6. **Danger Zone Action**:
     - Text link / subtle red outline button: `[Cancel my spot]`.
- **Button Actions**:
  - `[Cancel my spot]`: Opens native/custom confirmation popup (`"Are you sure you want to leave the queue? You will lose your spot."`). If confirmed, transitions status to `Cancelled` and clears active spot.
  - `[I Have Arrived]` (optional check-in acknowledgement in modal): Closes alert overlay.
- **Responsive Layout**:
  - **Mobile**: Perfectly framed single-screen card view without unnecessary scroll.
  - **Tablet / Desktop**: Centered hero card view with clean margins.
- **Empty & Error States**:
  - *Token Expired / Done*: Replaced by a friendly completion card: *"Thank you for visiting Royal Crown Salon! See you soon."* with a button to return to Home.
  - *Token Marked No-Show*: Red banner: *"Your spot expired due to non-arrival after being called. Please visit the reception desk to rejoin."*.
  - *Invalid ID in URL*: *"Token not found. Please join the queue."* with `[Go to Home]`.

---

## 4. Reception Dashboard

- **URL**: `/reception`
- **Primary Users**: Front-desk receptionist or salon manager (Optimized for Landscape Tablet / Desktop).
- **Security**: PIN Protected (`1234`).
- **UI Elements (Top to Bottom / Multi-Column Layout)**:
  1. **Top Control Bar**:
     - Salon title & current local time.
     - Queue quick status switch: Online Queue `[Open / Closed]`.
     - Button: `[+ Add Walk-In Customer]` (opens quick-entry modal).
     - Summary pills: `Total Waiting: 8` | `In Chair: 3` | `Avg Wait: 42 min`.
     - Language toggle & Lock icon (`Logout`).
  2. **Main Split Screen Layout**:
     - **Left Column (Barber Chair Workstations)**:
       - Individual workstation card per on-duty barber (e.g., Ravi, Amit, Kunal):
         - Barber photo, name, and current status (`Free`, `Occupied`, `On break`).
         - If occupied: Current customer name, token (e.g., `S-12 Vijay`), services list, and active chair timer elapsed (`18 min`).
         - Action button: `[Call Next]` (enabled if chair is free, disabled/warning if customer already in chair).
     - **Right Column (Master Chronological Waiting Queue)**:
       - Ordered list of all customers with status `Waiting` or `Called`.
       - Each queue card displays:
         - Token ID (e.g., `S-14`), Customer Name, Phone number.
         - Service badges (e.g., `Haircut`, `Beard Trim`).
         - Preferred Barber: Specific barber name or `Any`.
         - Time waited since check-in: e.g., `Waiting: 24 min`.
         - **Amber highlight**: When a customer's waiting time exceeds 60 minutes (`bg-amber-950/40 border-amber-500`).
         - Action buttons on each row:
           - `[Call]` (if not yet called)
           - `[No-show]` (flags as no-show if called and not present)
           - `[Cancel]` (cancels queue position on request)
  3. **Add Walk-In Modal**:
     - Fast form fields: Name, Phone, Service selection checkboxes, Barber dropdown, and submit button `[Add to Queue]`.
- **Button Actions**:
  - `[Call Next]` (for Barber X): Triggers queue engine to pick the earliest customer requesting Barber X or `'Any'`. Sets customer status to `Called`.
  - `[No-show]`: Prompts 1-tap confirmation, marks customer `No-show`, frees up barber queue sequence.
  - `[Cancel]`: Removes customer from queue as `Cancelled`.
  - `[+ Add Walk-In]`: Assigns next sequential token number immediately.
- **Responsive Layout**:
  - **Tablet Landscape / Desktop**: 2-column split (40% Barbers / 60% Queue List).
  - **Tablet Portrait / Mobile Fallback**: Toggle tabs between `[Barber Chairs]` and `[Waiting List]`.
- **Empty & Error States**:
  - *No Customers Waiting*: Right panel displays clean icon with *"All caught up! Waiting list is empty."*.
  - *No Barbers On Duty*: Warning banner: *"No barbers are currently on duty. Please mark staff available in Admin Settings."*.

---

## 5. Barber View

- **URL**: `/barber/:name` (e.g., `/barber/ravi`)
- **Primary Users**: Barbers mounted on a mobile dock next to each styling mirror.
- **Security**: PIN Protected (`1234`).
- **UI Elements (Top to Bottom)**:
  1. **Barber Header**:
     - Barber Avatar + Name (`Ravi`).
     - Availability Toggle Switch: `[Available]` vs `[On Break]`.
     - Audio alert toggle (bell icon).
  2. **Active Chair Workspace Card**:
     - Status Banner: `In Chair` or `Ready for Next`.
     - Current Customer Name (e.g., `Vijay Patel`) & Token (`S-12`).
     - Selected Services pills (`Haircut (30m)`, `Beard Trim (15m)`).
     - **Timer Display**:
       - Elapsed service stopwatch (`14:32`).
       - Estimated target duration countdown.
     - **Primary Workflow Buttons (Large Touch Target)**:
       - If customer is `Called`: Green/Gold Button `[Start Service]`.
       - If customer is `In Chair`: Prominent Gold Button `[Done / Complete Service]`.
  3. **"Up Next For You" Preview Card**:
     - Shows the very next eligible customer specifically queued for this barber or general queue:
     - Card preview: `Next for you: S-15 Kunal · Haircut (30 min)`.
- **Button Actions**:
  - `[Start Service]`: Transitions customer status from `Called` to `In chair`. Starts chair elapsed timer.
  - `[Done / Complete Service]`:
    - Transitions customer status to `Done`.
    - Stops timer and records actual completion time.
    - Prompts barber: *"Ready for next customer?"* with one-tap `[Call Next]`.
  - `[Toggle On Break]`: Updates barber status in realtime to `On break`. Suspends auto-assignment.
- **Responsive Layout**:
  - Mobile portrait layout optimized for single-thumb one-handed operation.
  - Big, high-contrast buttons (`h-16`, minimum 48px touch target).
- **Empty & Error States**:
  - *No Customer in Chair*: Chair card shows *"Chair Empty"*; large button says `[Call Next Customer]`.
  - *No Customers in Line for Barber*: "Up next" displays *"No pending customers in queue."*.

---

## 6. Waiting Area TV Display

- **URL**: `/display`
- **Primary Users**: In-salon waiting customers viewing a wall-mounted large TV screen (55"+) from 5 meters away.
- **UI Elements (Split Screen / High-Contrast Dashboard)**:
  1. **Header Banner**:
     - Salon Gold Crest / Logo, Salon Name, and Real-time Digital Clock (`11:42 AM`).
     - Audio status pill (subtle mute/unmute indicator).
  2. **Left / Top Section: Active Barber Stations ("In Chair / Now Serving")**:
     - Large cards for each barber:
       - High-res barber photo and name (`Amit`, `Ravi`, `Kunal`).
       - Status badge: `Serving Now` or `Available`.
       - Huge token callout: `Now: S-12` (in luminous gold, visible across room).
       - Customer First Name (e.g., `Vijay P.`).
  3. **Right / Bottom Section: "Up Next" Queue (Next 5 Tokens)**:
     - Prominent section title: `Up Next / હવે પછી`.
     - Ordered table/cards showing next 5 queued tokens:
       - Position (1st, 2nd, 3rd, 4th, 5th).
       - Token number in bold (`S-14`, `S-15`, `S-16`, `S-17`, `S-18`).
       - Preferred Barber or `Any`.
       - Estimated wait time remaining (`~10m`, `~25m`, `~35m`).
  4. **Call Alert Animation (Overlay / Flash)**:
     - Whenever any barber calls a customer:
       - The called token row or station card flashes in brilliant gold for 8 seconds.
       - Plays an audible melodic chime (via Web Audio API).
       - Banner alert: `🔔 Now Serving Token S-14 (Rajesh) at Chair 1 (Ravi)`.
- **Button Actions**:
  - Display is non-interactive; purely spectator/display mode. Contains a hidden bottom-corner fullscreen toggle button (`[⛶]`) and audio unlock toggle for the chime on first interaction.
- **Responsive Layout**:
  - Designed natively for 1080p and 4K TV screens in 16:9 landscape aspect ratio.
  - Giant typography (token sizes: `text-6xl` to `text-8xl`), ultra-high contrast dark charcoal background `#111827` with deep gold `#D4A017`.
- **Empty & Error States**:
  - *Empty Queue*: Up Next section reads *"Queue is clear. Walk in now!"*.
  - *Loss of Realtime Connection*: Unobtrusive yellow warning badge in corner: *"Syncing..."*.

---

## 7. Owner Settings Screen

- **URL**: `/admin`
- **Primary Users**: Salon owner and head manager.
- **Security**: PIN Protected (`1234`).
- **UI Elements (Top to Bottom)**:
  1. **Admin Header**:
     - Title: `Salon Management & Analytics`.
     - Back to Reception / Home buttons.
     - Language selector.
  2. **Today's Live Statistics (3 Metric Cards)**:
     - `Customers Served`: e.g., **48**
     - `Average Wait Time`: e.g., **24 mins**
     - `No-Shows / Cancelled`: e.g., **3 / 2**
  3. **Online Queue Master Switch**:
     - Toggle: `Allow Online Queue Joining (Open / Closed)`.
     - Explanatory note: *"When closed, customers cannot join via phone. Walk-ins can still be added by reception."*.
  4. **Barbers on Duty Manager**:
     - List of all barbers with photo and name.
     - Switch per barber: `On Duty` / `Off Duty`.
  5. **Service Catalog Configuration**:
     - Table / Card list of all offered services:
       - Service Name in English (`Haircut`)
       - Service Name in Gujarati (`હેરકટ`)
       - Duration in minutes (`30`)
       - Price in ₹ (`150`)
       - Active Toggle (`Enabled / Disabled`)
     - Button: `[+ Add New Service]`.
- **Button Actions**:
  - `[Queue Open/Closed Switch]`: Instantly toggles online joining availability.
  - `[Barber On Duty Toggle]`: Adds or removes barber from active calculation of queue wait times.
  - `[Service Toggle]`: Hides or displays the service on the customer `/join` screen.
  - `[Save Changes]`: Persists settings to storage and emits realtime update.
- **Responsive Layout**:
  - **Desktop / Tablet**: 2-column or structured tabbed dashboard.
  - **Mobile**: Stacked collapsible accordion cards.
- **Empty & Error States**:
  - *No Services Defined*: Displays warning: *"Please configure at least one service before opening queue."*.
