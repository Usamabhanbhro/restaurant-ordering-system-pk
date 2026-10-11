# DESIGN.md — Product Design Document & Design System

> **Changelog (2026-10-10 - Session 3):** executed visual fix pass across customer screens; standardized mode toggle to concise "In-Venue" label without table numbers; removed in-venue table context banner from menu header; styled completed preparation timeline steps in Electric Cobalt `#1546d9` with white checkmark icons; eliminated total price and item price leaks from OrderProgressTracker; removed "Active" badge and icon clutter from PerksTab; converted Platform Member Discounts in ProfileTab from peach card to plain, unadorned text; eradicated decorative `Zap` and `Sparkles` embellishments across all customer surfaces and standardized branding on "The Velocity Platter" vector mark; cleaned institutional suffixes from mock customer names.  
> **Changelog (2026-10-10 - Session 2):** streamlined customer account recovery and verification flow (removed 3-step segment indicator and action buttons in recovery, added automatic OTP advance on 6th digit, implemented dedicated RESET_PASSWORD screen without Profile or Details step labels); polished in-venue digital order ticket (simplified header to "Order Ticket", removed duplicate price line to display a single visible price, removed redundant counter settlement body text, changed Preparation Timeline step text and icon color to Electric Cobalt `#1546d9`); simplified in-venue entry toggle button to "In-Venue" and removed in-venue table mode banner from ProfileTab; polished Perks tab (removed extra button and zero platform fee promo block, generalized discounts to "Platform Member Discounts" across participating venues, removed all specific institutional/university names across CartDrawer, ProfileTab, and PerksTab, standardized on generic `PROMO50`).  
> **Changelog (2026-10-10):** ratified Two-Mode Customer Ordering Architecture (Remote Pre-Ordering `REMOTE` vs In-Venue Table QR `IN_VENUE`); refined in-venue header (removed "NO ACCOUNT NEEDED" pill), mode toggle button (removed QR icon, hidden in tracker tab), and cart drawer (streamlined header to "Your Order", removed table badges, bypassed slot picker and payment proof fields for table orders); updated category carousel to text-only pills with Saffron Amber `#f9b318` Popular styling; top-right cart button conditionally hidden in tracker tab (`activeTab === "status"`); updated profile tab verified badge to plain text Electric Cobalt `#1546d9`; ratified official Triad Brand Color Palette (`#fd8535` Kinetic Orange, `#f9b318` Saffron Amber, `#1546d9` Electric Cobalt); updated Section 2.0 brand identity with "The Velocity Platter" vector mark assets, eliminating legacy SpeedCup vectors; officially retired and archived `PROTOTYPE.html` per user directive.  
> **Changelog (2026-10-09):** added Section 3.0 Opening Splash Screen specification inspired by Starbucks & Apple fluid motion guidelines (critically damped entrance, ceramic specular sheen, optical typography, time-of-day greeting, venue grounding, interruptible exit with tap-to-dismiss); ratify frontend architecture stack (Next.js 15, React 19, Tailwind v4, Vaul, Motion).  
> **Changelog (2026-10-07):** updated visual design system and component architecture inspired by modern consumer food apps (Buy Bao reference, Starbucks, and Uber Eats). Retains all v1 remote ordering lifecycle rules, 5 dashboard lanes, and Pakistani market constraints.

---

## 1. Product Vision

QueueLess is a lean, Pakistan-market-specific digital pre-ordering and kitchen management system that eliminates long counter queues at busy university canteens and fast-casual cafes by providing remote pre-ordering with scheduled counter pickup, and a unified web-based staff dashboard — without replacing the venue's existing Point of Sale (POS), payment bank/wallet accounts, or staff hierarchy.

The product deliberately stops at order dispatch, kitchen display, and payment verification. It does not process card rails directly, calculate taxes, manage reservations, or handle delivery logistics.

---

## 2. Visual Design System (Consumer F&B Standards)

To match the world-class aesthetic of **Starbucks**, **Uber Eats**, and the **Buy Bao** benchmark, QueueLess moves away from dark-mode developer consoles into an appetizing, high-contrast, light-first consumer experience.

### 2.0 Brand Identity & Logo Specification

The official visual identity for QueueLess is based on **The Velocity Platter** emblem:
- **Symbol:** "The Velocity Platter" — a 3-plume kinetic aerodynamic flow (`viewBox="0 0 800 800"`, `fillRule="evenodd"`):
  - **Plume 01:** Top Aerodynamic Streak (`M 235 285 C 310 290...`)
  - **Plume 02:** Mid Velocity Flow (`M 195 348 C 285 352...`)
  - **Plume 03:** Kinetic Serving Vessel / Bowl Outline (`M 205 435 C 275 425...`)
- **Metaphor:** High-velocity counter pickup, frictionless pre-ordering, and skipping physical queues at university cafeterias and fast-casual cafes.
- **Brand Assets:**
  - Monochrome Vector Mark: [`brand/queueless-svg.svg`](file:///f:/projects/restaurant-ordering-system-pk/brand/queueless-svg.svg)
  - Full Coloured Brand Canvas: [`brand/coloured-svg.svg`](file:///f:/projects/restaurant-ordering-system-pk/brand/coloured-svg.svg)
- **Tagline:** *"Fast Pre-Order & Pickup"* (or *"Skip the Line"*).
- **Physical Signage:** Applied to counter acrylic QR stands deployed by Forward-Deployed Engineers (`FDE_RUNBOOK.md`).

### 2.1 Color Tokens & Brand Palette

The QueueLess brand identity and customer interface are anchored around a distinctive, energetic **Triad Color Palette** designed for high legibility, consumer appetite appeal, and modern mobile elegance:

| Token | Hex Value | Color Name | Semantic Role & Usage |
|---|---|---|---|
| `--color-brand-primary` / `--color-primary` | `#fd8535` | **Kinetic Orange** | **Primary Brand Color & Anchor:** Opening splash screen canvas, venue brand badge, active order pulse indicators, high-emphasis action triggers, and primary brand accents. |
| `--color-brand-secondary` / `--color-amber` | `#f9b318` | **Saffron Amber** | **Secondary Accent & Warm Highlights:** Venue ratings and star badges (`4.8` star rating), perks punch card stamps, loyalty discount chips, "Filling Fast" pickup slot warnings, and kitchen prep timers. |
| `--color-brand-accent` / `--color-cobalt` | `#1546d9` | **Electric Cobalt** | **High-Contrast Digital Accents:** Live digital counter ticket codes (e.g. `#108`), verification PIN states, transaction ID badges, interactive focus indicators, and trust callouts. |
| `--color-canvas` | `#FFFBF8` | **Warm Cream Canvas** | Warm off-white canvas for customer PWA; eliminates harsh dark grays and makes food imagery pop. |
| `--color-surface` | `#FFFFFF` | **Pure White** | Crisp white for food cards, bottom sheets, search input pills, and elevated containers. |
| `--color-surface-subtle` | `#F4F4F6` | **Subtle Neutral Surface** | Subtle off-white for unselected category chips, input fields, and stepper backgrounds. |
| `--color-text-main` | `#121212` | **Jet Black** | Ultra-readable headings, item titles, prices, and high-contrast primary pill buttons (`rounded-full`). |
| `--color-text-muted` | `#6B7280` | **Slate Gray** | Secondary descriptions, Roman Urdu subtitles, and subtle timestamps. |
| `--color-success` | `#10B981` | **Emerald Green** | Available pickup slots, open venue indicator dots, and verified payment states. |
| `--color-danger` | `#EF4444` | **Crimson Alert** | Out of stock (86ed) warnings, order rejection alerts, and voided tickets. |

### 2.2 Typography Hierarchy

- **Font Family:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
- **Display Headings (`font-bold tracking-tight`):** 24px–32px for venue titles and order pickup numbers.
- **Section Headings (`font-bold text-lg`):** 18px–20px for category titles and bottom sheet headers.
- **Item Titles (`font-semibold text-base`):** 16px with tight line height.
- **Prices (`font-bold text-base text-neutral-900`):** Prominently weighted, formatted as `Rs. 750` (or `Rs. 1,200`).
- **Modifiers & Badges (`font-medium text-xs`):** 12px pill chips.

### 2.3 Geometry & Elevation

- **Pill Philosophy:** Interactive buttons, search bars, category selectors, and steppers use full pill radius (`rounded-full`).
- **Cards & Drawers:** Food cards and content containers use high-radius geometry (`rounded-2xl` and `rounded-3xl`).
- **Elevation / Shadows:** Soft, diffuse ambient shadows (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); border: 1px solid #F0EFEA;`) instead of harsh black borders.

### 2.4 Strict No-Emoji Policy
> [!IMPORTANT]
> **Strict No-Emoji Mandate:** No emojis shall be used anywhere in the project (UI components, labels, badges, alerts, buttons, navigation pills, mock data, wireframes, or documentation) unless explicitly asked for by the user.
> 
> - **Iconography:** Always use crisp SVG vector icons (Lucide icons / custom vector paths with deliberate stroke and fill).
> - **Region & Country Identifiers:** Use standard ISO/typographic badges (e.g., `PK +92`) rather than flag emojis.
> - **Status Indicators:** Use CSS-styled circular badges or colored semantic dots (`bg-[#fd8535]`, `bg-[#f9b318]`, `bg-[#1546d9]`, `bg-emerald-500`) instead of colored circle emojis.
> - **Wireframes & Documentation:** Use clean text, bracket labels (e.g., `[Search]`, `[Copy]`, `[User]`, `[Ticket]`, `[Close]`), or ASCII indicators rather than emojis.

### 2.5 Liquid Glass Materials & Motion Design Tokens (Tailwind v4 + Motion)

To achieve world-class visual fluidity without sacrificing mobile battery or performance on Pakistani cellular connections (Jazz, Zong, Telenor 4G):

- **Liquid Glass Surface Material:**
  - Dynamic translucent blurs with high saturation: `backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);`
  - Subtle light-catching rim: `border: 1px solid rgba(255, 255, 255, 0.25);`
  - Floating ambient drop shadow: `box-shadow: 0 12px 36px -6px rgba(0, 0, 0, 0.08);`
  - Applied to the sticky bottom floating navigation pill, sticky top search header, and modal action bars.
- **Gesture Physics & Drawers (`vaul`):**
  - Native iOS-style bottom sheets for Cart, Customizer, and Auth modals.
  - Native touch velocity tracking: flicking down dismisses the sheet cleanly without sluggish animation delays.
  - Snap points (`snapPoints={[0.5, 0.95]}`) with background scale-down (`shouldScaleBackground={true}`) to give native app tactile depth.
- **Spring Physics System (`motion/react`):**
  - GPU-accelerated transforms (`transform: translate3d(x, y, 0) scale(s)`) with zero layout reflows.
  - Interactive tactile springs:
    - **Pill Tab Morph:** `transition: { type: 'spring', stiffness: 400, damping: 30 }` using shared `layoutId="activeCategoryPill"`.
    - **Quantity Stepper Bump:** `whileTap={{ scale: 0.92 }}` with subtle bounce on count change.
    - **Success Ping:** Scale spring from 0.8 to 1.05 and settling at 1.0.
- **Instant Media Delivery & Next-Gen Formats:**
  - All food photography and venue imagery served via `next/image` connected to Cloudflare Images / Imgix CDN.
  - Automatic conversion to AVIF and WebP with aggressive size-budgeting (<45KB per hero item thumbnail).
  - BlurHash / low-quality image placeholder (LQIP) during network fetch ensures zero Cumulative Layout Shift (CLS) on 3G/4G connections.

---

## 3. Component Architecture & UI Anatomy

### 3.0 Opening Splash Screen (Ultra-Minimalist Brand Impact • Apple Fluid Motion)
- **Design Intent:**
  - Ultra-minimalist launch screen emphasizing instant brand recognition, benchmarked against top-tier mobile consumer apps.
  - Strips away all extraneous visual noise (no greeting pills, text labels, venue pills, or app wordmarks) in favor of the pure iconic white brand emblem on vibrant brand orange.
- **Apple Fluid Motion Specifications:**
  - **Purpose:** *State indication & bridging content* (frequency: app launch / first QR scan).
  - **Never `scale(0)`:** Pure white emblem enters from `scale(0.92)` with `opacity: 0` to `scale(1.0)` with `opacity: 1`.
  - **Critically Damped Spring Entrance:** `cubic-bezier(0.16, 1, 0.3, 1)` with `0.52s` duration — responsive, dignified, zero cartoonish bounce or oscillation.
  - **Continuous Spatial Exit:** Cross-fades (`opacity: 1 -> 0`) while gently elevating (`scale(1.04)`) in `360ms`, smoothly revealing the underlying menu.
  - **User Agency & Zero Latency:** Tapping or clicking anywhere immediately triggers the exit transition, bypassing the remainder of the 1.8s auto-dismiss timer.
  - **Accessibility / Reduced Motion:** `@media (prefers-reduced-motion: reduce)` removes all transforms, substituting a gentle opacity crossfade.
- **Visual Composition:**
  - **Canvas:** Solid brand primary orange (`#fd8535`).
  - **Centerpiece:** Pure white (`#FFFFFF`) **Velocity Platter** vector emblem (`w-32 h-32 sm:w-36 sm:h-36`), perfectly centered with zero competing chrome or typography.
  - **Testing & Replay:** Replayable at any time via the Customer Profile tab.

### 3.1 Customer Discovery & Menu Catalog
- **Venue Hero Header (`HeroHeader.tsx`):**
  - Full-width cover image with subtle warm cream bottom gradient overlay for maximum contrast.
  - Floating top bar contains the round white floating **Cart Button** with dynamic quantity count badge; conditionally hidden in the live Order Tracker tab (`activeTab === "status"`).
  - **Venue Profile Card:** Positioned outside `overflow-hidden` container with negative top margin (`-mt-7 relative z-10`) to prevent any bottom boundary clipping of the brand emblem badge.
  - **Brand Badge:** The Velocity Platter SVG on a vibrant rounded-2xl container (`bg-gradient-to-br from-[#fd8535] to-[#e0681c] border-2 border-white shadow-xl`).
  - **Title & Metadata:** Venue name (`text-base sm:text-lg font-extrabold`) with the Saffron Amber rating badge (`#f9b318` star pill) and cuisine tags directly underneath.
- **In-Venue Dining Header:**
  - Displays table and zone context (e.g. `Ordering to Table 04 (Indoor Main)`).
  - "NO ACCOUNT NEEDED" pill removed for clean header aesthetics.
  - Mode toggle button renders clean text with no QR icon.
  - Mode toggle and in-venue header are restricted to the menu screen (`activeTab === "menu"`) and hidden in the order tracker tab.
- **Category Carousel:**
  - Text-only horizontal category pills (vector icons removed for clean typographic focus).
  - Unselected "Popular" pill styled in Saffron Amber (`#f9b318`), selected in Kinetic Orange (`#fd8535`). Other category pills styled in Kinetic Orange when active.
  - Food card "POPULAR" badge styled in Saffron Amber (`#f9b318`).
  - Dynamic gradient edge masks (fade indicators on left and right) with one-tap chevron assist buttons for clear mobile discoverability.
  - Grid wrapping toggle button (`LayoutGrid`) enabling small-screen users (320px–375px) to toggle into a 2-row wrapped view without horizontal scrolling.
- **Food Item Cards (Split Card Layout):**
  - Left: Item name in English, Roman Urdu subtitle (e.g. *Double Smash Burger • Ziada Cheese*), 2-line teaser description, and bold price.
  - Right: Clean 1:1 food cutout/thumbnail (`rounded-2xl`) with an overlay or adjacent black pill `+` cart button.

### 3.2 Customization Bottom Sheet (Slide-Up Drawer)
- Slides smoothly from bottom on mobile; darkened ambient backdrop (`rgba(0,0,0,0.4)`).
- Full-width food hero header with close button.
- Sectioned modifier groups:
  - Radio groups for single-choice (e.g. Milk: Whole, Oat, Almond).
  - Checkbox chips for multi-choice add-ons and exclusions.
  - Color-coded indicator tags (Red: Exclusions, Green: Add-ons, Amber: Preferences).
- Free-text note input with 40-char limit (`^[a-zA-Z0-9\s.,!?'-]{0,40}$`).
- Sticky bottom footer with tactile quantity stepper (`[-] 1 [+]`) and solid black CTA: `Add to Cart • Rs. 870`.

### 3.3 Cart Drawer & Two-Mode Checkout Mechanics (`CartDrawer.tsx`)
- **Streamlined Header Architecture:**
  - Header is distilled strictly to **"Your Order"** with crisp 18px bold typography.
  - Removed item count pills, store/venue icons, subtitle breadcrumbs, and intro/welcome text.
  - Pure white background surface for clean contrast.
- **Remote Ordering Checkout Flow (`REMOTE`):**
  - **Pickup Slot Carousel:** Horizontal time chips (`13:30`, `13:45`, `14:00`, `14:15`) with capacity labels (*"Available"*, *"Filling Fast"*, or disabled *"Full"*).
  - **Direct Venue Payment Card:** Tabbed/radio selection between venue's registered accounts (**Easypaisa**, **SadaPay**, **Meezan Bank / Raast**) with 1-tap **"Copy Number"** button, transaction ID input, and terms acknowledgment. "Cash on Pickup" is strictly removed.
- **In-Venue Table Checkout Flow (`IN_VENUE`):**
  - **Dining Summary Card:** Displays clean table and zone context without redundant "Table Order" badge or `#04` square block.
  - **Bypassed Elements:** Pickup slot selection card and manual payment upload fields are completely hidden.
  - **Counter Settlement:** Diner submits order directly to the kitchen queue and pays cash or physical card at the counter desk.

### 3.4 Customer Live Order Timeline (`OrderProgressTracker.tsx`)
- **Remote Pre-Order 5-Stage Stepper:**
  1. **Awaiting Payment Confirmation:** Node active with pulse; message shows operator is verifying transaction ID.
  2. **Confirmed, Scheduled for HH:MM:** Node locked; displays scheduled pickup slot and target kitchen start time.
  3. **Being Prepared:** Active cooking animation; timer counting down to pickup time.
  4. **Ready for Pickup:** Prominent high-contrast **Digital Counter Ticket Card** displaying large order code (e.g. **#108**).
  5. **Collected:** Terminal `SERVED` state with transaction receipt summary.
- **In-Venue Table Order Stepper:**
  - Adjusted steps: "Kitchen Ticket Dispatched" and "Served to Table".
  - **Hidden Elements:** Break slot / pickup-timing blocks are completely hidden for table orders (slots are strictly a remote-ordering concept).
  - Mode toggle and in-venue header are hidden while viewing the order progress tracker.
- **Cancelled / Expired:** Neutral, dignity-preserving card (*"This order could not be completed"*) without exposing technical error codes.

---

### 3.5 Detailed Screen Wireframe Specifications

#### Wireframe A: Customer PWA — Menu & Discovery
```
┌──────────────────────────────────────────┐
│  [Logo]   Brewery Cafe Gulberg    [User] │
│  Pickup at Counter • 10-15m • [Open]     │
├──────────────────────────────────────────┤
│  [ Search coffee, burgers, fries... ]    │
├──────────────────────────────────────────┤
│  (All)  (Burgers)  (Coffee)  (Sides)     │  <-- Sticky Category Pill Row
├──────────────────────────────────────────┤
│  POPULAR PICKS                           │
│  ┌────────────────────────────────────┐  │
│  │ Double Smash Burger     ┌────────┐ │  │
│  │ Ziada Cheese            │ [IMG]  │ │  │
│  │ 2x 80g smashed beef...  │        │ │  │
│  │ Rs. 750                 │  (+)   │ │  │
│  └─────────────────────────┴────────┘─┘  │
│  ┌────────────────────────────────────┐  │
│  │ Spanish Iced Latte      ┌────────┐ │  │
│  │ Artisanal clear ice     │ [IMG]  │ │  │
│  │ Rs. 520                 │  (+)   │ │  │
│  └─────────────────────────┴────────┘─┘  │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ View Cart • 2 items • Rs. 1,270  → │  │  <-- Floating Cart Capsule
│  └────────────────────────────────────┘  │
│                                          │
│  [State 1: Scrolled Up / Top — Floating Pill]
│        ┌─────────────────────────┐       │
│        │ (Menu) (Perk) (Trk) (Usr) │     │  <-- Frosted Capsule with Circular Tabs
│        └─────────────────────────┘       │
│                                          │
│  [State 2: Scrolled Down — Attached Dock]│
│  ┌────────────────────────────────────┐  │
│  │   Menu     Perks    Tracker   Profile │  │  <-- Docked Flush Edge Bar
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 3.6 Adaptive Bottom Navigation & Vector Icon System
- **Adaptive Dual-State Dock Architecture:**
  - **Scroll-Up / Initial View (Floating Pill):**
    - Transforms into a detached, elevated glassmorphism capsule centered horizontally (`bottom-3.5 left-1/2 -translate-x-1/2 rounded-full p-1.5 bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_14px_36px_rgba(0,0,0,0.16)]`).
    - **Active Tab:** Solid black circular button (`w-11 h-11 rounded-full bg-neutral-950 text-white shadow-md scale-105`).
    - **Inactive Tabs:** White circular buttons with subtle borders (`w-11 h-11 rounded-full bg-white text-neutral-700 shadow-sm border border-neutral-100/80 hover:bg-neutral-50`).
    - **Active Order Dot:** Glowing `#fd8535` pulse indicator on Tracker button when an order is in progress.
  - **Scroll-Down View (Attached Dock):**
    - Smoothly anchors flush against the bottom edge (`bottom-0 left-0 right-0 h-16 rounded-none bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-none px-6 flex items-center justify-around`).
    - Displays clean vector icon above text label with Kinetic Orange (`#fd8535`) active highlight.
  - **Motion Curve:** `transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- **Iconography Standard (Zero Emojis):**
  - All cartoonish emojis are replaced by clean Lucide vector icons (`viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"`).
  - Consistent optical weight, scalable, crisp on Retina displays, and zero platform-dependent emoji rendering variance.

#### Wireframe B: Customization Bottom Sheet Drawer
```
┌──────────────────────────────────────────┐
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ [======== Full Food Image ========]│  │
│  │ Double Smash Burger           [✕]  │  │
│  │ Rs. 750                            │  │
│  ├────────────────────────────────────┤  │
│  │ CHEESE & ADD-ONS (Optional)        │  │
│  │ [x] Extra Melted Cheddar  +Rs. 120 │  │
│  │ [ ] Smoked Beef Bacon     +Rs. 180 │  │
│  ├────────────────────────────────────┤  │
│  │ EXCLUSIONS (Allergy / Diet)        │  │
│  │ [x] No Onion (Pyaz Na Dalein)      │  │
│  │ [ ] No Pickles                     │  │
│  ├────────────────────────────────────┤  │
│  │ SPECIAL NOTE (Max 40 chars)        │  │
│  │ [ Cut in half please             ] │  │
│  ├────────────────────────────────────┤  │
│  │  [-]  1  [+]   [ Add to Order • Rs 870 ] │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### Wireframe C: Slot Selection & Direct Venue Payment
```
┌──────────────────────────────────────────┐
│  ← Checkout & Pickup Slot                │
├──────────────────────────────────────────┤
│  SELECT SAME-DAY PICKUP TIME             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  13:30   │ │  13:45   │ │  14:00   │  │
│  │ (Avail)  │ │ (Filling)│ │  (Full)  │  │
│  └──────────┘ └──────────┘ └──────────┘  │
├──────────────────────────────────────────┤
│  PAY DIRECTLY TO VENUE                   │
│  (•) Easypaisa   ( ) SadaPay   ( ) Bank  │
│  ┌────────────────────────────────────┐  │
│  │ Title: Brewery Cafe Gulberg        │  │
│  │ Number: 0300-1234567   [Copy]      │  │
│  │ Instructions: Send exact Rs. 870   │  │
│  └────────────────────────────────────┘  │
│  Enter Transaction ID *                  │
│  [ e.g. EP-9876543210                ]  │
│  Upload Receipt Screenshot (Optional)    │
│  [ Drop screenshot or tap here        ]  │
├──────────────────────────────────────────┤
│  [x] I agree to same-day pickup terms &  │
│      30-min no-show policy (TERMS)       │
│  ┌────────────────────────────────────┐  │
│  │       Submit Payment Claim         │  │  <-- Black Pill CTA
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### Wireframe D: Live Order Tracking (Buy Bao Timeline + Digital Counter Ticket)
```
┌──────────────────────────────────────────┐
│  ← Order Details                         │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ COUNTER PICKUP TICKET              │  │
│  │ #108                               │  │  <-- Big bold pickup code
│  │ Pickup Slot: 13:30 (Break Slot #2) │  │
│  │ Show this code at the pickup desk  │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ORDER TIMELINE                          │
│                                          │
│  (●) 13:12 • Awaiting Confirmation       │
│   │  Operator is verifying your payment  │
│   │                                      │
│  (●) 13:14 • Confirmed & Scheduled       │
│   │  Scheduled for 13:30 pickup          │
│   │                                      │
│  (*) 13:20 • Being Prepared (Cooking)    │
│   │  Kitchen active • 10m cook timer     │
│   │                                      │
│  (○) 13:28 • Ready for Pickup            │
│   │  Order placed on pickup acrylic stand│
│   │                                      │
│  (○) 13:30 • Collected                  │
├──────────────────────────────────────────┤
│  [ Cancel Order (Before 13:20) ]         │
└──────────────────────────────────────────┘
```

#### Wireframe E: Customer Authentication Bottom Sheet (Login & Register)
```
┌──────────────────────────────────────────┐
│                   ────                   │  <-- Drag Handle Pill
│  [Logo] QueueLess             [Close]    │
│  Welcome back                            │
│  Sign in to track orders & campus perks  │
├──────────────────────────────────────────┤
│  [ G  Continue with Google   ]           │  <-- Social Login Buttons
│  [ f  Continue with Facebook ]           │
│  ─────────────── or ───────────────      │
├──────────────────────────────────────────┤
│  EMAIL OR MOBILE NUMBER                  │
│  [ student@nu.edu.pk / 0300...        ]  │
│                                          │
│  PASSWORD                                │
│  [ •••••••••••••••••          [Show] ]   │
│                                          │
│  [x] Remember me      Forgot password?   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │              Sign In               │  │  <-- Terracotta / Black Pill CTA
│  └────────────────────────────────────┘  │
│                                          │
│  Don't have an account? Sign up          │
└──────────────────────────────────────────┘
```

#### Wireframe F: 6-Digit Verification & Deferred Onboarding
```
┌──────────────────────────────────────────┐
│                   ────                   │
│  < Back                      [Close]     │
│  [x] Done        (*) Active     ( ) Next │
├──────────────────────────────────────────┤
│             [ Verification ]             │
│  Enter 6-Digit Code                      │
│  Sent to alina.solvaeica@gmail.com       │
│                                          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│  │ 8 │ │ 4 │ │ 9 │ │ 2 │ │ 0 │ │ 1 │     │  <-- Segmented PIN Inputs
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘     │
│                                          │
│  Resend code in 00:49                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        Verify & Continue           │  │  <-- Terracotta Pill CTA
│  └────────────────────────────────────┘  │
│                                          │
│  Code expires in 10 minutes. Check spam. │
└──────────────────────────────────────────┘
```

---

### 3.7 Customer Authentication & Onboarding System (NovaPass & Vela Synthesis)

QueueLess implements an authentication and onboarding workflow synthesized from modern security-first consumer apps (NovaPass and Vela), tailored specifically for the Pakistani campus and cafe ecosystem:

1. **Non-Blocking Guest Browsing:**
   - Scanning a table QR or counter acrylic tag allows instant, anonymous menu browsing.
   - Walk-up in-venue ordering does not force account creation.
   - Authentication is triggered **only** when a customer proceeds to checkout on a scheduled remote pre-order (F1), claims an institutional discount (F2), or accesses their perks wallet (F3).
2. **Form Factor (iOS-Style Bottom Sheet Drawer):**
   - Renders as a tactile bottom sheet on mobile (`rounded-t-[32px]`) with a top drag handle pill (`w-12 h-1.5 rounded-full bg-neutral-300`).
   - Floats with a progressive liquid glass backdrop filter (`backdrop-blur-md bg-black/40`), ensuring the customer can tap outside or hit [X] to dismiss and immediately return to browsing.
3. **Registration Credentials (3-Field Minimum):**
   - **Email:** `CITEXT UNIQUE` (any provider; `.edu.pk` needed only for campus discounts).
   - **Pakistani Mobile Phone:** Format `^(\+92|0)?3[0-9]{9}$` with country badge `PK +92`.
   - **Password:** Minimum 8 characters with criteria indicators, hashed server-side with Argon2id.
4. **Social Sign-In & Sign-Up (Google & Facebook):**
   - Includes official vector-badged **"Continue with Google"** and **"Continue with Facebook"** buttons (and corresponding sign-up variants), catering directly to Pakistani campus diners and young professionals without Apple/OAuth sprawl.
5. **Stepped Verification (Vela-Style Stepper):**
   - `(1) Details ────── (2) Verify Email ────── (3) Profile`
   - High-contrast segmented 6-digit PIN input with automatic advance, backspace recoil, and paste support.
   - 10-minute validity window with a 60-second resend countdown timer.
6. **Deferred Onboarding ("After Hand"):**
   - Display name and optional institutional affiliation are gathered **after** registration.
   - Staff requires `display_name` to call out tickets at the pickup counter (`orders.customer_name_snapshotted`).
   - Campus affiliation (FAST, LUMS, IBA, NUST, SZABIST) can be selected immediately or deferred to the Profile perks tab.
7. **Identity Layer Isolation:**
   - Identity data (`customers`, `email_verification_codes`, `password_reset_tokens`) is managed under the `app_identity_user` role and is completely decoupled from tenant-scoped venue tables (`app_runtime_user`).

### 3.8 Customer Profile & Campus Perks (`ProfileTab.tsx` & `PerksTab.tsx`)
- **Verified Status Badge:** Plain text **"Verified"** rendered in Electric Cobalt (`#1546d9`), discarding green pills and checkmark SVGs for minimal typographic elegance.
- **Perks Wallet:** 5-stamp loyalty punch card with Saffron Amber (`#f9b318`) active stamp circles and institutional student voucher cards (FAST, LUMS, IBA, NUST).
- **Splash Screen Replay:** Accessible on demand from the profile screen to inspect or replay the Apple critically damped launch sequence.
- **Prototype Status:** `PROTOTYPE.html` is officially retired; all user interfaces are active and maintained in `apps/web`.

---

## 4. Unified Staff Dashboard (Toast / Square KDS Style)

The staff interface is restyled from a dark console into a crisp, high-contrast commercial kitchen screen:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  QueueLess  •  Brewery Cafe Gulberg                                    [Shift Active]      [Remote: Active]      [Admin]   │
├───────────────────────┬───────────────────────┬───────────────────────┬───────────────────────┬────────────────────────┤
│  PAYMENTS TO CONFIRM  │       SCHEDULED       │       PREPARING       │         READY         │      REFUNDS OWED      │
│         (1)           │          (2)          │          (1)          │          (1)          │          (0)           │
├───────────────────────┼───────────────────────┼───────────────────────┼───────────────────────┼────────────────────────┤
│ ORDER #108 • 13:30    │ ORDER #105 • 13:20    │ ORDER #102 • 13:10    │ ORDER #99 • 13:00     │ No refunds pending     │
│ Ahmad Ali (FAST)      │ Hamza Khan            │ Bilal Tariq           │ Sara Noor             │                        │
│ Rs. 750.00            │ Rs. 450.00            │ Rs. 1,200.00          │ Rs. 650.00            │                        │
│ Easypaisa: 987654     │ Starts in: 4 mins     │ Elapsed: 6m (Cooking) │ Ready: 2m ago         │                        │
│ [Screenshot]          │                       │ 2x Smash Burger       │ 1x Iced Latte         │                        │
│                       │                       │ • Ziada Cheese        │ • Oat Milk            │                        │
│ [CONFIRM]  [REJECT]   │ [UNDO CONFIRM (5m)]   │ [BUMP READY]          │ [MARK SERVED]         │                        │
└───────────────────────┴───────────────────────┴───────────────────────┴───────────────────────┴────────────────────────┤
```

### 4.1 Staff Interaction Rules
- **High-Contrast Touch Targets:** Big minimum 48px tactile buttons for busy, greasy kitchen environments.
- **Timer Color Coding:** Green ($\le$10m), Amber (10–20m), Red (>20m) measured from `kitchen_start_at`.
- **5-Minute Undo:** Reversible confirm or reject via persistent toast.

---

## 5. Offline & Degraded Mode Behavior

| Failure Scenario | Customer Experience | Staff Action & Mitigation |
|---|---|---|
| **Backend down** | PWA serves cached menu (read-only) with *"Ordering unavailable"* banner. Static Cloudflare fallback if origin unreachable. In-flight orders preserved in Postgres. | Staff takes verbal orders directly at counter legacy POS. |
| **Venue Internet down** | Customer orders queue safely in cloud; venue screen alerts when connection drops. | Venue responsibility. Staff hot-spots screen to phone. |
| **Power / Screen outage** | Cloud queue preserves all tickets; screen re-syncs state upon reboot via REST delta fetch. | Venue switches screen/router to 12V backup battery / UPS. |

---

## 6. Documented Decisions & Supersessions

| Area | Decision |
|---|---|
| **Visual Canvas** | Replaced dark slate developer UI with warm cream-cheese `#FFFBF8` / pure white `#FFFFFF` consumer theme. |
| **Brand Palette** | Triad Color Palette: Kinetic Orange `#fd8535` (primary brand anchor & splash canvas), Saffron Amber `#f9b318` (ratings & perk rewards), and Electric Cobalt `#1546d9` (digital tickets & verification) + High-Contrast Black `#121212` buttons. |
| **Order Expiration** | Unreviewed claims expire at `pickup_at` (`EXPIRED_UNREVIEWED`), not `kitchen_start_at`. No strike is recorded. |
| **Strike Trigger** | Strikes originate strictly from un-undone `NOT_FOUND` payment claim rejections. |
| **No Kitchen TRASH in v1** | In v1 remote ordering, rejecting a claim is the discard action. Kitchen TRASH is deferred to post-v1 table service. |
