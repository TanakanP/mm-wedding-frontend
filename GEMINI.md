# Project Overview: Our Wedding Website

This repository contains the frontend web application for our wedding website. The goal is to create a modern, elegant, and highly responsive single-page or multi-page application to share details with guests and collect RSVPs.

## 🛠 Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (Theme configured with elegant typography and custom wedding colors)
- **Animations:** Framer Motion (For elegant scroll reveals and fade-ins)
- **Forms:** React Hook Form + Zod (For robust RSVP validation)

## 🎨 Design & Aesthetic Guidelines
- **Theme Concept:** Elegant, timeless, minimalist, and romantic.
- **Color Palette (Tailwind Custom Extensions):**
  - Primary/Background: Warm Creams and Soft Off-Whites (`bg-stone-50`)
  - Accent 1: Deep, elegant tones (e.g., subtle gold or deep forest accents)
  - Typography: Crisp serif headings for titles (`font-serif`), clean sans-serif for readable body copy.
- **Vibe:** Feels intentional and premium, avoiding cluttered animations. Use soft transitions.

## 📂 Core Features to Build
1. **Hero Section:** High-impact welcoming section with names, date, and a countdown timer.
2. **Our Story:** A beautiful vertical timeline or grid displaying major milestones.
3. **Event Details:** Date, venue, map integration, and schedule of events.
4. **RSVP Form:** Interactive frontend form collecting guest names, attendance status, dietary restrictions, and a congratulatory note.
5. **FAQ Section:** Accordion components addressing dress code, parking, plus-ones, and accommodation details.

## 🤖 Rules for Gemini Code Assist
- **Component Architecture:** Keep components modular, self-contained, and clean. Place them in the `@/components` directory.
- **TypeScript:** Enforce strict typing. Avoid using `any`.
- **Tailwind:** Prioritize clean Tailwind utility usage. Group complex utility definitions cleanly, or use standard semantic layout patterns.
- **Client vs Server:** Explicitly add the `'use client'` directive at the top of files that utilize state, hooks, or animation libraries like Framer Motion.