# Requirements Document

## Introduction

Charge Nest is a modern startup landing page for a peer-to-peer phone/device charging spot marketplace. The landing page is a single-page UI built with React + Vite + TypeScript + TailwindCSS. It presents the product to potential users (people who need to charge their devices) and potential hosts (cafes, shops, homeowners who can share a charging plug). The page must be visually premium, fully responsive, and animated — with no backend integration at this stage.

## Glossary

- **Landing_Page**: The single-page marketing UI for Charge Nest served at the root route.
- **Navbar**: The sticky top navigation bar with glass/blur effect.
- **Hero_Section**: The full-viewport opening section with headline, subtext, and CTAs.
- **How_It_Works_Section**: The 3-step animated walkthrough section.
- **Features_Section**: The grid of feature highlight cards.
- **Business_Section**: The section targeting cafes and shops as potential hosts.
- **Rewards_Section**: The section explaining the points and leaderboard system.
- **Newsletter_Section**: The email capture section with a notify button.
- **Contact_Section**: The static contact form UI section.
- **Footer**: The bottom section with links, social icons, and copyright.
- **CTA**: Call-to-action button or link.
- **Glassmorphism**: A UI style using frosted-glass backgrounds (backdrop-blur + semi-transparent bg + border).
- **Scroll_Reveal**: An animation where elements fade/slide into view as the user scrolls.
- **Smooth_Scroll**: Browser-level smooth scrolling between anchor sections.

---

## Requirements

### Requirement 1: Sticky Glassmorphism Navbar

**User Story:** As a visitor, I want a persistent navigation bar, so that I can access any section of the page at any time without scrolling back to the top.

#### Acceptance Criteria

1. THE Navbar SHALL display the "Charge Nest" logo with a lightning bolt icon on the left side.
2. THE Navbar SHALL display navigation links: Home, Find Spot, Share Plug, Rewards, and Contact.
3. THE Navbar SHALL display a "Login" ghost button and a "Sign Up" primary button on the right side.
4. WHILE the user has not scrolled, THE Navbar SHALL render with a transparent background.
5. WHEN the user scrolls more than 20px from the top, THE Navbar SHALL apply a glassmorphism style (backdrop-blur, semi-transparent white background, and a subtle border).
6. THE Navbar SHALL remain fixed at the top of the viewport (sticky) at all times.
7. WHEN the viewport width is below 768px, THE Navbar SHALL hide the desktop navigation links and show a hamburger menu icon.
8. WHEN the hamburger icon is activated, THE Navbar SHALL display a full-width mobile drawer with all navigation links and auth buttons.

---

### Requirement 2: Hero Section

**User Story:** As a visitor, I want an impactful opening section, so that I immediately understand what Charge Nest offers and can take action.

#### Acceptance Criteria

1. THE Hero_Section SHALL display the headline "Never Run Out of Battery Again" in a large, bold font.
2. THE Hero_Section SHALL display a subtext paragraph explaining the platform's value proposition.
3. THE Hero_Section SHALL display two CTA buttons: "Find Charging Spot" and "Share Your Plug".
4. THE Hero_Section SHALL display a charging-themed illustration or graphic on the right side of the layout on desktop viewports.
5. THE Hero_Section SHALL use a dark gradient background (navy-to-blue) with animated decorative blobs.
6. WHEN the page loads, THE Hero_Section SHALL animate its headline, subtext, and CTAs using a slide-up entrance animation.
7. THE Hero_Section SHALL occupy at least the full viewport height (min-h-screen).
8. WHEN the viewport width is below 768px, THE Hero_Section SHALL stack the text content and illustration vertically, hiding the illustration if necessary.

---

### Requirement 3: How It Works Section

**User Story:** As a visitor, I want a clear step-by-step explanation, so that I understand how to use Charge Nest in three simple steps.

#### Acceptance Criteria

1. THE How_It_Works_Section SHALL display exactly 3 step cards in sequence: "Browse Charging Spots", "Request a Spot", and "Charge Your Phone".
2. EACH step card SHALL display a numbered badge, an icon, a title, and a short description.
3. WHEN a step card enters the viewport, THE How_It_Works_Section SHALL trigger a Scroll_Reveal animation (fade + slide-up) on that card.
4. WHEN a user hovers over a step card, THE How_It_Works_Section SHALL apply a lift effect (translateY) and an elevated box-shadow.
5. THE How_It_Works_Section SHALL display the 3 cards in a horizontal row on desktop and a vertical stack on mobile.
6. THE How_It_Works_Section SHALL use glassmorphism-styled cards with a light background.

---

### Requirement 4: Features Section

**User Story:** As a visitor, I want to see the platform's key features at a glance, so that I can evaluate whether Charge Nest meets my needs.

#### Acceptance Criteria

1. THE Features_Section SHALL display 4 feature cards: "Nearby Charging Spots", "Verified Hosts", "Secure Requests", and "Rewards System".
2. EACH feature card SHALL display an icon, a title, and a short description.
3. WHEN a feature card enters the viewport, THE Features_Section SHALL trigger a Scroll_Reveal animation with a staggered delay between cards.
4. WHEN a user hovers over a feature card, THE Features_Section SHALL apply a border highlight and a subtle background color shift.
5. THE Features_Section SHALL display cards in a 2-column grid on tablet and a 4-column grid on desktop.

---

### Requirement 5: Business Section

**User Story:** As a cafe or shop owner, I want a dedicated section explaining the business opportunity, so that I can understand how to list my charging spot.

#### Acceptance Criteria

1. THE Business_Section SHALL display a headline targeting businesses (cafes, shops, co-working spaces).
2. THE Business_Section SHALL display a list of at least 3 benefits for business hosts (e.g., attract customers, earn revenue, zero setup cost).
3. THE Business_Section SHALL display a prominent CTA button labeled "List Your Spot".
4. THE Business_Section SHALL use a visually distinct background (e.g., gradient or dark) to separate it from adjacent sections.
5. WHEN the Business_Section enters the viewport, THE Business_Section SHALL trigger a Scroll_Reveal animation on its content.

---

### Requirement 6: Rewards Section

**User Story:** As a visitor, I want to understand the rewards program, so that I am motivated to use Charge Nest regularly.

#### Acceptance Criteria

1. THE Rewards_Section SHALL display a headline and description explaining the points-based rewards system.
2. THE Rewards_Section SHALL display at least 3 reward tiers or benefit items (e.g., Bronze, Silver, Gold or equivalent).
3. THE Rewards_Section SHALL display a leaderboard preview or visual representation of the ranking system.
4. WHEN the Rewards_Section enters the viewport, THE Rewards_Section SHALL trigger a Scroll_Reveal animation on its content.
5. THE Rewards_Section SHALL use accent colors (e.g., gold, amber) to visually reinforce the rewards theme.

---

### Requirement 7: Newsletter Section

**User Story:** As a visitor, I want to subscribe for updates, so that I am notified when Charge Nest launches or adds new features.

#### Acceptance Criteria

1. THE Newsletter_Section SHALL display a headline and short description inviting visitors to subscribe.
2. THE Newsletter_Section SHALL display a text input field with a placeholder of "Enter your email address".
3. THE Newsletter_Section SHALL display a "Notify Me" submit button adjacent to the email input.
4. WHEN the "Notify Me" button is activated, THE Newsletter_Section SHALL display a visual confirmation state (e.g., button text changes to "You're on the list!") without making any backend calls.
5. IF the email input is empty when the "Notify Me" button is activated, THEN THE Newsletter_Section SHALL display an inline validation message.
6. THE Newsletter_Section SHALL use a visually distinct background to draw attention to the subscription prompt.

---

### Requirement 8: Contact Section

**User Story:** As a visitor, I want a contact form, so that I can send a message to the Charge Nest team.

#### Acceptance Criteria

1. THE Contact_Section SHALL display a contact form with fields: Name, Email, Subject, and Message.
2. THE Contact_Section SHALL display a "Send Message" submit button.
3. THE Contact_Section SHALL display the form in a glassmorphism-styled card.
4. WHEN the "Send Message" button is activated, THE Contact_Section SHALL display a visual confirmation state without making any backend calls.
5. THE Contact_Section SHALL display contact information (email address placeholder, location placeholder) alongside the form on desktop viewports.

---

### Requirement 9: Footer

**User Story:** As a visitor, I want a well-structured footer, so that I can find important links and connect with Charge Nest on social media.

#### Acceptance Criteria

1. THE Footer SHALL display the Charge Nest logo and a short tagline.
2. THE Footer SHALL display at least 3 grouped link columns (e.g., Product, Company, Support).
3. THE Footer SHALL display social media icon links for at least 3 platforms (e.g., Twitter/X, Instagram, LinkedIn).
4. THE Footer SHALL display a copyright notice with the current year.
5. THE Footer SHALL use a dark background to visually anchor the bottom of the page.

---

### Requirement 10: Responsive Layout and Animations

**User Story:** As a visitor on any device, I want the landing page to look polished and perform smoothly, so that I have a premium experience regardless of screen size.

#### Acceptance Criteria

1. THE Landing_Page SHALL be fully responsive across viewport widths from 320px to 1920px.
2. THE Landing_Page SHALL use Smooth_Scroll when navigating between anchor sections via navbar links.
3. WHEN any section enters the viewport during scroll, THE Landing_Page SHALL trigger Scroll_Reveal animations using an IntersectionObserver.
4. THE Landing_Page SHALL use a blue and white primary color scheme consistent with the existing Tailwind theme variables.
5. THE Landing_Page SHALL apply glassmorphism styling (backdrop-blur, semi-transparent backgrounds) to cards and the navbar.
6. THE Landing_Page SHALL use the Space Grotesk font for headings and Inter for body text, consistent with the existing CSS setup.
