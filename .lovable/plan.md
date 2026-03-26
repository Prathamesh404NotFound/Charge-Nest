

## Neighborhood EV Charge Marketplace — Premium Multipage Website

### Overview
A stunning, conversion-focused multipage website for a hyperlocal EV charging marketplace. Two audiences: EV two-wheeler riders finding charging spots, and homeowners earning by listing their outlets.

### Design System
- **Palette**: White, navy (#1a1f36), electric blue (#3b82f6), green (#22c55e), silver, soft grays
- **Style**: Glassmorphism cards, subtle gradient backgrounds, soft shadows, rounded corners
- **Motion**: Scroll-reveal animations (fade/slide/scale), hover effects on all interactive elements, animated counters, floating effects, smooth page transitions
- **Typography**: Clean, modern hierarchy with strong headings and readable body text

### Global Components
1. **Sticky Navbar** — Logo, nav links (Home, Find Spots, Become a Host, How It Works, Pricing, About, Contact), mobile hamburger drawer, active link highlight
2. **Floating Action Buttons** — Fixed WhatsApp (green) and Call (blue) buttons on all pages, bottom-right
3. **Premium Footer** — Full navigation, contact info, social links, trust text, newsletter signup
4. **Reusable blocks** — HeroSection, StatsCounter, TestimonialCarousel, FAQAccordion, CTABanner, SpotCard, PricingCard, FeatureCard
5. **Page transitions** — Smooth fade/slide animations between routes

### Pages

#### 1. Home (`/`)
- **Hero**: Bold headline "Find Nearby EV Charging Spots or Earn from Your Home Outlet", subheadline, 4 CTA buttons (Find Spot, Register Home, Call, WhatsApp), AI-generated hero image of EV scooter charging at home, animated gradient blobs background
- **Trust Stats**: Animated counters (500+ spots, 1200+ riders, 300+ hosts, 10K+ sessions)
- **How It Works Preview**: Two-column cards for Riders and Hosts with step icons
- **Rider Benefits**: 4 feature cards (nearby access, easy booking, transparent pricing, fast charging)
- **Host Benefits**: 4 feature cards (passive income, simple setup, verified listing, local demand)
- **Featured Charging Spots**: 3 premium spot cards with ratings, pricing, verified badges
- **Why Choose Us**: 4 value prop cards with icons
- **Testimonials**: Carousel with rider and host reviews
- **FAQ Preview**: 4 common questions in accordion
- **Final CTA**: Strong conversion banner with dual CTAs

#### 2. Find Charging Spots (`/spots`)
- Search bar with location input
- Filter chips (distance, price, rating, availability, verified, charging type)
- Sort dropdown (nearest, cheapest, highest rated, open now)
- Map-inspired visual panel with spot markers
- Grid of spot cards: host name, distance, price/10min, rating stars, open/closed badge, verified badge, Book/Call/WhatsApp buttons
- Featured/recommended spots highlighted section
- Empty state design

#### 3. Become a Host (`/host`)
- Hero with residential charging image, headline about earning from home outlet
- Benefits grid (passive income, low effort, local demand, flexible, verified)
- 5-step onboarding timeline (Register → Add details → Verify → Get QR → Earn)
- Earnings calculator preview (daily/weekly/monthly estimates)
- Safety & privacy section
- Host registration interest form (name, phone, area, outlet type, availability, pricing)
- CTA section with Call/WhatsApp

#### 4. How It Works (`/how-it-works`)
- Two visual journey timelines side by side
- **Rider flow**: Search → Choose → Navigate → Scan QR → Charge → Pay → Rate (7 animated step cards)
- **Host flow**: Register → Set Price → Verify → Accept Riders → Earn → Withdraw (6 animated step cards)
- Animated connector lines between steps
- Trust notes section

#### 5. Pricing (`/pricing`)
- Rider pricing breakdown (cost per 10 min, sample session)
- Host earnings breakdown (income per session, electricity cost, net profit)
- Platform commission explanation
- 3 comparison cards (Basic, Featured, Premium) with recommended badge
- Pricing FAQ accordion
- Transparency/trust section

#### 6. About (`/about`)
- Story section: why the platform exists, EV charging gap in local areas
- Mission & Vision cards
- "Why It Matters in Indian Neighborhoods" section
- Impact section (sustainable mobility, local economy, infrastructure)
- Founder philosophy block (trust, simplicity, community, innovation)
- Partner logos placeholder section

#### 7. Contact (`/contact`)
- Contact form (name, phone, email, area, message)
- Call & WhatsApp quick buttons
- Business info (service area, hours, response time)
- Mini FAQ section
- Service area visual card
- Trust badges

### Image Generation
AI-generated images for key sections using the Nano banana model:
- Hero: EV scooter charging at a home outlet
- Host page: Homeowner near charging point
- Spots page: Map/discovery visual
- How It Works: Step illustrations
- About: Community/neighborhood scene

### Technical Approach
- React Router for multipage navigation
- Intersection Observer for scroll-reveal animations
- CSS animations + Tailwind for all motion effects
- Framer-motion-style animations via CSS keyframes
- Lucide React for all icons
- Fully responsive with mobile-first approach
- No backend, all static data

