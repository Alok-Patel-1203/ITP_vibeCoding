# AGENTS.md

> Real-time Salon Queue Management System eliminating weekend wait-time chaos with live status tracking for customers, barbers, reception, and waiting-area display.

---

## Read First
Before developing or modifying any part of the project, read these specification documents:
1. [docs/01-brief.md](file:///d:/STUDY%20MATERIALS/DAU/itp%20practical/salon_queue_system/docs/01-brief.md) — Project background, problem statement, users, core features, out-of-scope boundaries, and visual language.
2. [docs/02-screens.md](file:///d:/STUDY%20MATERIALS/DAU/itp%20practical/salon_queue_system/docs/02-screens.md) — Screen specifications, URLs, component hierarchies, interaction states, responsive layouts, and edge/error states.
3. [docs/03-flows-rules.md](file:///d:/STUDY%20MATERIALS/DAU/itp%20practical/salon_queue_system/docs/03-flows-rules.md) — State machine transitions, queue allocation algorithms, wait calculation rules, and 10-point test checklist.

---

## Tech Stack & Architecture
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Dev Command**: `npm run dev`
- **Data & Realtime**: Supabase Realtime (explain schema/events before writing or altering code; no custom backend server needed)
- **Deployment**: Vercel
- **Live Deployment Link**: Must always be placed as the first line directly beneath the main title in `README.md`
- **Staff Access PIN**: `1234` (used for Reception, Barber View, and Owner Admin)

---

## Engineering Guidelines & How to Work
- **Strict Scope per Task**: Build or modify only one screen or feature per task. Never alter unrelated screens or shared components without explicit need.
- **Theme & Design System**: Premium salon aesthetic using Dark Charcoal (`#1F2937`) background and Gold (`#D4A017`) accents with rounded card containers (`rounded-xl` or `rounded-2xl`).
- **Internationalization (i18n)**: All UI strings and labels must be routed through the centralized EN/GU language file (`en` and `gu`). Absolutely no hardcoded user-facing text strings in components.
- **Single Source of Truth for Queue Rules**: All business logic (queue state transitions, wait-time calculations, barber matching, phone deduplication) must live in **one single core queue module** and be imported wherever needed.
- **Respect the Don't-Build List**: Never introduce features on the out-of-scope list (online payments, appointments for future dates, SMS/WhatsApp messaging, loyalty systems, multi-branch support).
- **Post-Task Deliverables**: After completing each task, provide:
  1. A list of all created or modified files.
  2. Clear, step-by-step instructions on how to test and verify the change.
