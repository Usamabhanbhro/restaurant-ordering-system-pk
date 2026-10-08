# DESIGN.md — Product Design Document & Design System

> **Changelog (2026-10-07):** updated visual design system and component architecture inspired by modern consumer food apps (Buy Bao reference, Starbucks, and Uber Eats). Retains all v1 remote ordering lifecycle rules, 5 dashboard lanes, and Pakistani market constraints.

---

## 1. Product Vision

QueueLess is a lean, Pakistan-market-specific digital pre-ordering and kitchen management system that eliminates long counter queues at busy university canteens and fast-casual cafes by providing remote pre-ordering with scheduled counter pickup, and a unified web-based staff dashboard — without replacing the venue's existing Point of Sale (POS), payment bank/wallet accounts, or staff hierarchy.

The product deliberately stops at order dispatch, kitchen display, and payment verification. It does not process card rails directly, calculate taxes, manage reservations, or handle delivery logistics.

---

## 2. Visual Design System (Consumer F&B Standards)

To match the world-class aesthetic of **Starbucks**, **Uber Eats**, and the **Buy Bao** benchmark, QueueLess moves away from dark-mode developer consoles into an appetizing, high-contrast, light-first consumer experience.

### 2.0 Brand Identity & Logo Specification

The official visual identity for QueueLess is based on the **Speed Cup "Q"** emblem:
- **Symbol:** A geometric squircle app icon combining a high-voltage lightning bolt with an espresso/takeout cup silhouette to form the letter **Q**.
- **Metaphor:** Seamless speed, pre-ordering, and skipping physical counter queues at cafes and university canteens.
- **Brand Assets:**
  - PNG Master: [`brand/queueless-logo.png`](file:///f:/projects/restaurant-ordering-system-pk/brand/queueless-logo.png)
  - Vector Mark / Favicon: [`brand/queueless-icon.svg`](file:///f:/projects/restaurant-ordering-system-pk/brand/queueless-icon.svg)
  - Full Vector Horizontal Logo: [`brand/queueless-logo.svg`](file:///f:/projects/restaurant-ordering-system-pk/brand/queueless-logo.svg)
- **Tagline:** *"Fast Pre-Order & Pickup"* (or *"Skip the Line"*).
- **Physical Signage:** Applied to counter acrylic QR stands deployed by Forward-Deployed Engineers (`FDE_RUNBOOK.md`).

### 2.1 Color Tokens & Palette

| Token | Hex Value | Semantic Role & Usage |
|---|---|---|
| `--color-canvas` | `#FFFBF8` / `#FFFFFF` | Warm cream-cheese canvas for customer PWA; eliminates harsh dark grays and makes food imagery pop. |
| `--color-surface` | `#FFFFFF` | Crisp pure white for cards, bottom sheets, and elevated containers. |
| `--color-surface-subtle` | `#F4F4F6` | Subtle off-white for unselected chips, input fields, and stepper backgrounds. |
| `--color-primary` | `#EF5A30` | Vibrant salmon coral — primary brand accent for active badges, notification pings, and delivery nodes. |
| `--color-primary-soft` | `#FEEBE5` | Soft salmon tint for active state backgrounds and highlighted tags. |
| `--color-accent-tuna` | `#FCA9F9` | Tuna pink accent for celebratory banners and student perk badges. |
| `--color-accent-avocado` | `#DBE4B5` | Avocado sage for dietary/vegan modifier tags. |
| `--color-accent-mint` | `#34B5AD` | Cucumber mint for pickup timer countdowns and success states. |
| `--color-text-main` | `#121212` | Jet black for ultra-readable headings, prices, and primary labels. |
| `--color-text-muted` | `#6B7280` | Neutral slate for secondary descriptions, English subtitles, and timestamps. |
| `--color-cta-black` | `#121212` | Solid jet-black for high-contrast primary pill buttons (`rounded-full`), matching modern food apps. |

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

---

## 3. Component Architecture & UI Anatomy

### 3.1 Customer Discovery & Menu Catalog
- **Venue Hero Header:**
  - Full-width cover image with subtle gradient overlay.
  - Floating venue avatar/logo badge, title (*"Brewery Cafe Gulberg"*), cuisine tags, operating hours, and a clean **"10–15 min Counter Pickup"** badge.
- **Sticky Category Carousel:**
  - Horizontal scrolling pill tabs with custom vector category icons.
  - Active category highlighted with solid black capsule or salmon accent dot.
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

### 3.3 Slot Selection & Pakistani Payment Checkout
- **Pickup Slot Carousel:**
  - Horizontal time chips (`13:30`, `13:45`, `14:00`, `14:15`).
  - Color-coded capacity labels: *"Available"*, *"Filling Fast"*, or disabled *"Full"*.
- **Direct Venue Payment Card:**
  - Tabbed or radio selection between venue's registered accounts: **Easypaisa**, **SadaPay**, **Meezan Bank / Raast**.
  - Account Title, Account Number with 1-tap **"Copy Number"** button, and venue instructions.
  - Transaction ID input field + optional receipt screenshot dropzone.
  - Pre-payment terms display with required acknowledgment checkbox per `TERMS_DRAFT.md`.

### 3.4 Customer Live Order Timeline (5-Stage Tracker)
Matches the reference design's vertical chronological stepper with solid circular time nodes:
1. **Awaiting Payment Confirmation:** Node active with pulse; message shows operator is verifying transaction ID.
2. **Confirmed, Scheduled for HH:MM:** Node locked; displays scheduled pickup slot and target kitchen start time.
3. **Being Prepared:** Active cooking animation; timer counting down to pickup time.
4. **Ready for Pickup:** Prominent high-contrast **Digital Counter Ticket Card** displaying large order code (e.g. **#108**) with instructions to show at the pickup counter.
5. **Collected:** Terminal `SERVED` state with transaction receipt summary.
- **Cancelled / Expired:** Neutral, dignity-preserving card (*"This order could not be completed"*) without exposing technical error codes.

---

### 3.5 Detailed Screen Wireframe Specifications

#### Wireframe A: Customer PWA — Menu & Discovery
```
┌──────────────────────────────────────────┐
│  [⚡ Logo]  Brewery Cafe Gulberg    [👤] │
│  Pickup at Counter • 10-15m • 🟢 Open    │
├──────────────────────────────────────────┤
│  [ 🔍 Search coffee, burgers, fries... ] │
├──────────────────────────────────────────┤
│  (🔥 All) (🍔 Burgers) (☕ Coffee) (🍟)   │  <-- Sticky Pill Carousel
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
│        │ (⌂)   (🎁)   (⏱)   (👤)  │       │  <-- Frosted Capsule with Circular Tabs
│        └─────────────────────────┘       │
│                                          │
│  [State 2: Scrolled Down — Attached Dock]│
│  ┌────────────────────────────────────┐  │
│  │   ⌂         🎁        ⏱        👤   │  │  <-- Docked Flush Edge Bar
│  │  Menu     Perks    Tracker   Profile│  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 3.6 Adaptive Bottom Navigation & Vector Icon System
- **Adaptive Dual-State Dock Architecture:**
  - **Scroll-Up / Initial View (Floating Pill):**
    - Transforms into a detached, elevated glassmorphism capsule centered horizontally (`bottom-3.5 left-1/2 -translate-x-1/2 rounded-full p-1.5 bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_14px_36px_rgba(0,0,0,0.16)]`).
    - **Active Tab:** Solid black circular button (`w-11 h-11 rounded-full bg-neutral-950 text-white shadow-md scale-105`).
    - **Inactive Tabs:** White circular buttons with subtle borders (`w-11 h-11 rounded-full bg-white text-neutral-700 shadow-sm border border-neutral-100/80 hover:bg-neutral-50`).
    - **Active Order Dot:** Glowing `#EF5A30` pulse indicator on Tracker button when an order is in progress.
  - **Scroll-Down View (Attached Dock):**
    - Smoothly anchors flush against the bottom edge (`bottom-0 left-0 right-0 h-16 rounded-none bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-none px-6 flex items-center justify-around`).
    - Displays clean vector icon above text label with Coral Salmon active highlight.
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
│  │ Number: 0300-1234567   [📋 Copy]   │  │
│  │ Instructions: Send exact Rs. 870   │  │
│  └────────────────────────────────────┘  │
│  Enter Transaction ID *                  │
│  [ e.g. EP-9876543210                ]  │
│  Upload Receipt Screenshot (Optional)    │
│  [ 📎 Drop screenshot or tap here    ]  │
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
│  │ ⚡ COUNTER PICKUP TICKET           │  │
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
│  (🟢) 13:20 • Being Prepared             │
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
│  [⚡ Logo] QueueLess       [✕ Close]     │
│  Welcome back                            │
│  Sign in to track orders & campus perks  │
├──────────────────────────────────────────┤
│  [ G  Continue with Google ]             │  <-- Social Login Button
│  ─────────────── or ───────────────      │
├──────────────────────────────────────────┤
│  EMAIL OR MOBILE NUMBER                  │
│  [ student@nu.edu.pk / 0300...        ]  │
│                                          │
│  PASSWORD                                │
│  [ •••••••••••••••••            👁️ ]     │
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
│  < Back                    [✕ Close]     │
│  (1) Details ─── (2) Verify ─── (3) Callout
│  ✓ Done          ● Active       ○ Next   │
├──────────────────────────────────────────┤
│             [ 🛡️ Verification ]           │
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
   - Floats with a progressive liquid glass backdrop filter (`backdrop-blur-md bg-black/40`), ensuring the customer can tap outside or hit `✕` to dismiss and immediately return to browsing.
3. **Registration Credentials (3-Field Minimum):**
   - **Email:** `CITEXT UNIQUE` (any provider; `.edu.pk` needed only for campus discounts).
   - **Pakistani Mobile Phone:** Format `^(\+92|0)?3[0-9]{9}$` with country badge `🇵🇰 +92`.
   - **Password:** Minimum 8 characters with criteria indicators, hashed server-side with Argon2id.
4. **Social Sign-In (Google-Only):**
   - Includes a clean **"Continue with Google"** button per project direction, matching youth demographic expectations while avoiding Apple/OAuth sprawl.
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

---

## 4. Unified Staff Dashboard (Toast / Square KDS Style)

The staff interface is restyled from a dark console into a crisp, high-contrast commercial kitchen screen:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ QueueLess  •  Brewery Cafe Gulberg                                 [Shift Active 🔔]   [Remote: Active 🟢]   [Admin ⚙️] │
├───────────────────────┬───────────────────────┬───────────────────────┬───────────────────────┬────────────────────────┤
│  PAYMENTS TO CONFIRM  │       SCHEDULED       │       PREPARING       │         READY         │      REFUNDS OWED      │
│         (1)           │          (2)          │          (1)          │          (1)          │          (0)           │
├───────────────────────┼───────────────────────┼───────────────────────┼───────────────────────┼────────────────────────┤
│ ORDER #108 • 13:30    │ ORDER #105 • 13:20    │ ORDER #102 • 13:10    │ ORDER #99 • 13:00     │ No refunds pending     │
│ Ahmad Ali (FAST)      │ Hamza Khan            │ Bilal Tariq           │ Sara Noor             │                        │
│ Rs. 750.00            │ Rs. 450.00            │ Rs. 1,200.00          │ Rs. 650.00            │                        │
│ Easypaisa: 987654     │ Starts in: 4 mins     │ ⏱️ Elapsed: 6m (🟢)   │ ⏱️ Ready: 2m ago      │                        │
│ [Screenshot 👁️]      │                       │ 2x Smash Burger       │ 1x Iced Latte         │                        │
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
| **Primary Accent** | Vibrant Salmon Coral `#EF5A30` + High-Contrast Black `#121212` buttons inspired by the Buy Bao reference. |
| **Order Expiration** | Unreviewed claims expire at `pickup_at` (`EXPIRED_UNREVIEWED`), not `kitchen_start_at`. No strike is recorded. |
| **Strike Trigger** | Strikes originate strictly from un-undone `NOT_FOUND` payment claim rejections. |
| **No Kitchen TRASH in v1** | In v1 remote ordering, rejecting a claim is the discard action. Kitchen TRASH is deferred to post-v1 table service. |
