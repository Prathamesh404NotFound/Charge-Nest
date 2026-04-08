# Implementation Plan: Charge Nest Landing Page

## Overview

Implement the Charge Nest landing page as a single-page React UI using TypeScript, TailwindCSS, and the existing project patterns (`useScrollReveal`, `.reveal`/`.glass` CSS classes, Space Grotesk + Inter fonts, existing Tailwind theme variables). All new section components live under `src/components/landing/`.

## Tasks

- [x] 1. Create the landing components directory and shared types
  - Create `src/components/landing/` directory with an `index.ts` barrel export
  - Define shared TypeScript interfaces: `Step`, `Feature`, `RewardTier`, `LeaderboardEntry`, `ContactFields`
  - _Requirements: 3.1, 4.1, 6.2_

- [x] 2. Implement HeroSection
  - [x] 2.1 Create `src/components/landing/HeroSection.tsx`
    - Full-viewport section with headline "Never Run Out of Battery Again", subtext, and two CTA buttons: "Find Charging Spot" and "Share Your Plug"
    - Dark navy-to-blue gradient background with animated decorative blobs using existing `animate-blob` / `animate-blob-delayed` classes
    - Slide-up entrance animation using existing `animate-slide-up` class on headline, subtext, and CTAs
    - Responsive: stack text and illustration vertically on mobile (hide illustration if needed), side-by-side on desktop
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [ ]* 2.2 Write unit tests for HeroSection
    - Test renders headline, subtext, and both CTA buttons
    - Test illustration is present on desktop layout
    - _Requirements: 2.1, 2.3_

- [x] 3. Implement HowItWorksSection
  - [x] 3.1 Create `src/components/landing/HowItWorksSection.tsx`
    - Render exactly 3 step cards: "Browse Charging Spots", "Request a Spot", "Charge Your Phone"
    - Each card: numbered badge, LucideIcon, title, short description
    - Cards use `.reveal` class with staggered `transitionDelay` for scroll-triggered animation
    - Hover lift effect: `hover:-translate-y-2 hover:shadow-xl transition-all`
    - Glassmorphism cards using `.glass` utility class
    - Horizontal row on desktop, vertical stack on mobile
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 3.2 Write property test for HowItWorksSection — Property 6
    - **Property 6: How It Works section contains exactly 3 step cards**
    - **Validates: Requirements 3.1**
    - _Requirements: 3.1_

- [x] 4. Implement FeaturesSection
  - [x] 4.1 Create `src/components/landing/FeaturesSection.tsx`
    - Render 4 feature cards: "Nearby Charging Spots", "Verified Hosts", "Secure Requests", "Rewards System"
    - Each card: LucideIcon, title, short description
    - Cards use `.reveal` with staggered delay
    - Hover: `hover:border-primary hover:bg-primary/5` border highlight and background shift
    - 2-column grid on tablet, 4-column grid on desktop
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 4.2 Write property test for FeaturesSection — Property 7
    - **Property 7: Features section contains exactly 4 feature cards**
    - **Validates: Requirements 4.1**
    - _Requirements: 4.1_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement BusinessSection
  - [x] 6.1 Create `src/components/landing/BusinessSection.tsx`
    - Headline targeting businesses (cafes, shops, co-working spaces)
    - List of at least 3 host benefits (attract customers, earn revenue, zero setup cost)
    - Prominent "List Your Spot" CTA button
    - Visually distinct background (dark navy gradient) to separate from adjacent sections
    - Content uses `.reveal` for scroll animation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement RewardsSection
  - [x] 7.1 Create `src/components/landing/RewardsSection.tsx`
    - Headline and description explaining the points-based rewards system
    - At least 3 reward tiers: Bronze, Silver, Gold — each with name, min points, and benefits list
    - Static leaderboard preview with mock ranked entries
    - Amber/gold accent colors: `text-amber-400`, `text-yellow-500`
    - Content uses `.reveal` for scroll animation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 7.2 Write property test for RewardsSection — Property 8
    - **Property 8: Rewards section contains at least 3 reward tiers**
    - **Validates: Requirements 6.2**
    - _Requirements: 6.2_

- [x] 8. Implement NewsletterSection
  - [x] 8.1 Create `src/components/landing/NewsletterSection.tsx`
    - Headline, short description, email input (placeholder: "Enter your email address"), and "Notify Me" button
    - Local state: `email`, `submitted`, `error`
    - On submit with empty/whitespace email: show inline validation message, do not change `submitted`
    - On submit with valid email: set `submitted = true`, change button text to "You're on the list!"
    - No backend calls
    - Visually distinct background
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 8.2 Write property test for NewsletterSection — Property 3
    - **Property 3: Newsletter submission requires non-empty email**
    - For any whitespace-only string as email, assert submission is rejected and error is shown
    - **Validates: Requirements 7.4, 7.5**
    - _Requirements: 7.4, 7.5_
  - [ ]* 8.3 Write property test for NewsletterSection — Property 4
    - **Property 4: Newsletter confirmation state is set on valid submission**
    - For any non-empty email string, assert submission sets confirmed state and no network request is made
    - **Validates: Requirements 7.3, 7.4**
    - _Requirements: 7.3, 7.4_
  - [ ]* 8.4 Write unit tests for NewsletterSection
    - Test renders headline, input, and button
    - Test shows error on empty submit
    - Test shows confirmation on valid email submit
    - _Requirements: 7.1, 7.4, 7.5_

- [x] 9. Implement ContactSection
  - [x] 9.1 Create `src/components/landing/ContactSection.tsx`
    - Form with fields: Name, Email, Subject, Message
    - "Send Message" submit button
    - Form rendered in a `.glass`-styled card
    - On submit: set `submitted = true`, show confirmation message — no backend calls
    - Contact info (email placeholder, location placeholder) shown alongside form on desktop
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 9.2 Write property test for ContactSection — Property 5
    - **Property 5: Contact form confirmation state is set on submission**
    - For any form field values, assert submission sets confirmed state without network requests
    - **Validates: Requirements 8.4**
    - _Requirements: 8.4_
  - [ ]* 9.3 Write unit tests for ContactSection
    - Test renders all 4 form fields and submit button
    - Test shows confirmation state after submit
    - _Requirements: 8.1, 8.4_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update Navbar and Footer
  - [x] 11.1 Update `src/components/Navbar.tsx` nav link labels to match spec: Home, Find Spot, Share Plug, Rewards, Contact
    - Verify scroll-based glassmorphism (backdrop-blur, semi-transparent bg, border) activates at >20px scroll
    - Verify mobile hamburger drawer shows all nav links and auth buttons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ]* 11.2 Write property test for Navbar — Property 1
    - **Property 1: Navbar glassmorphism activates on scroll**
    - For any scroll Y > 20, assert glassmorphism classes are present; for Y ≤ 20, assert they are absent
    - **Validates: Requirements 1.4, 1.5**
    - _Requirements: 1.4, 1.5_
  - [ ]* 11.3 Write property test for Navbar — Property 2
    - **Property 2: Mobile drawer visibility is toggled by hamburger**
    - For any toggle count, assert drawer visible iff count % 2 === 1
    - **Validates: Requirements 1.7, 1.8**
    - _Requirements: 1.7, 1.8_
  - [x] 11.4 Update `src/components/Footer.tsx` to satisfy Requirement 9
    - Ensure logo + tagline, at least 3 grouped link columns, at least 3 social icon links, copyright with current year, dark background
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Wire everything together in Index.tsx
  - [ ] 12.1 Update `src/pages/Index.tsx` to import and render all landing sections in order
    - Import: HeroSection, HowItWorksSection, FeaturesSection, BusinessSection, RewardsSection, NewsletterSection, ContactSection
    - Call `useScrollReveal()` once at the top level so `.reveal` elements across all sections are observed
    - Add `id` anchors to each section matching navbar links (e.g., `id="find-spot"`, `id="rewards"`, `id="contact"`)
    - Enable smooth scroll via `scroll-behavior: smooth` (already in `index.css` or add to `html` element)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [ ]* 12.2 Write property test for scroll reveal — Property 9
    - **Property 9: Scroll reveal elements transition to visible state on intersection**
    - For any `.reveal` element, assert `.revealed` class is added after IntersectionObserver fires
    - **Validates: Requirements 3.3, 4.3, 5.5, 6.4, 10.3**
    - _Requirements: 3.3, 4.3, 5.5, 6.4, 10.3_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property-based tests use `fast-check` — install with `npm install --save-dev fast-check`
- Each property test is tagged with `// Feature: charge-nest-landing-page, Property N: ...`
- All new components are self-contained with no required props; data is co-located as typed constants
- The existing `useScrollReveal` hook, `.reveal`/`.glass` CSS classes, and Tailwind theme variables are used as-is
