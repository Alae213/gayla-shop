# Product Requirements Document (PRD)
# Gayla Shop → Multi-Store SaaS Platform

**Version**: 1.0  
**Last Updated**: February 27, 2026  
**Status**: Single Source of Truth  
**Owner**: Belkhiri Abdessamad

---

## Executive Summary

Transform Gayla Shop (single e-commerce storefront) into a multi-tenant SaaS platform enabling Algerian entrepreneurs to create and manage multiple COD-based online stores with zero technical knowledge required.

**Mission**: Democratize e-commerce for early-stage Algerian businesses by removing technical barriers, payment friction, and tool complexity.

---

## Problem Statement

### Target Customer
**Early-stage Algerian e-commerce business owners** (merchants, influencers, agencies) who:
- Struggle to build their own online stores
- Find existing platforms (Shopify, WooCommerce) too complex or expensive
- Pay for multiple fragmented tools (plugins, hosting, analytics)
- Cannot easily pay in USD (dollar conversion barriers in Algeria)
- Need COD (Cash on Delivery) workflows built-in
- Lack technical skills but want professional stores

### Pain Points
1. **Complexity**: Existing platforms have steep learning curves
2. **Cost**: Multiple subscriptions + plugins = expensive overhead
3. **Payment Friction**: USD payments difficult in Algeria
4. **COD Support**: Generic platforms don't understand Algerian COD workflows
5. **Technical Dependency**: Need developers for customizations

---

## Solution: Core Value Proposition

**"We help early-stage e-commerce businesses build their own stores so they can manage orders easily for non-technical users."**

### Unique Differentiators

#### 1. Algeria-Specific
- Pay in Algerian Dinar (via Chargily Pay) – no USD conversion hassle
- COD workflows built-in (call logs, confirmation flows, fraud detection)
- Wilaya-based delivery cost calculation
- Integration with Algerian delivery companies (ZR Express, Yalidine)

#### 2. Pay-When-You-Succeed Model
- **First 50 orders FREE** per store per month
- **2000 DZD/month** only after success (50+ orders)
- No upfront costs, no credit card required to start

#### 3. Zero Learning Curve
- Dump-simple UX designed for non-technical users
- No templates, no overwhelming options
- Just works: Build Mode + Tracking Mode

#### 4. Multi-Store Management
- One user can create and manage multiple stores
- Each store is independent (products, orders, billing)
- Perfect for agencies managing client stores or merchants with multiple brands

---

## Business Model

### Pricing Structure

#### Free Tier
- **Allowance**: First 50 orders per month **per store**
- **What's included**: Full access to all features (Build Mode + Tracking Mode)
- **Billing cycle**: Rolling 30-day window from first order

#### Paid Tier
- **Price**: 2000 DZD/month per store
- **Trigger**: Automatically locked after 50 orders in a 30-day rolling window
- **Billing cycle**: 30 days from payment date
- **Renewal**: Manual (merchant must pay each cycle, no auto-renewal)

### Billing Logic Details

#### Scenario 1: First Time Hitting 50 Orders
1. Store gets **1st order on March 1st** → Starts 30-day window (March 1 - March 30)
2. Store gets **50th order on March 20th** → Store locks
3. Merchant pays **2000 DZD on March 21st**
4. Store unlocks until **April 20th** (30 days from payment date)
5. On April 20th, a new 50-order window starts (counter resets to 0)

#### Scenario 2: User with Multiple Stores
User owns 3 stores:
- **Store A**: 60 orders in March → Pays 2000 DZD, unlocked until payment date + 30 days
- **Store B**: 20 orders in March → Still free (under 50 limit)
- **Store C**: 10 orders in March → Still free (under 50 limit)

**Each store has independent billing** – they don't share the 50-order allowance.

#### What Happens When Locked (After 50 Orders, No Payment)
- **Public storefront**: Continues to work (customers can place orders)
- **Merchant admin (Tracking Mode)**:
  - Orders appear in order list
  - Customer name, phone, address are **hidden** (replaced with "***")
  - All action buttons are **disabled** (Confirm, Package, Ship, Cancel)
  - Call logs disabled
  - Merchant sees message: "Unlock your store: Pay 2000 DZD to see customer data and manage orders"
- **Merchant admin (Build Mode)**: Full access (can still edit products, add new products)

### Payment Method
- **Chargily Pay** (Algerian payment gateway)
- Merchants pay in **Algerian Dinar (DZD)**
- Payment methods: CIB card, Edahabia, bank transfer

### Revenue Model
- Recurring subscription revenue (2000 DZD/month per active store)
- Target: 200 merchants Year 1, 3,000 merchants Year 2
- Estimated ARR Year 2: 3,000 stores × 50% paid (1,500) × 2,000 DZD × 12 = 36M DZD (~$270K USD)

---

## User Personas

### Primary Persona: Solo Merchant ("Fatima")
- Age: 25-35
- Business: Sells handmade jewelry online
- Technical skill: Low (uses Instagram, Facebook)
- Pain: Struggles with Shopify complexity, can't afford plugins
- Goal: Simple store to take orders, manage COD confirmations
- Success metric: Gets 50+ orders/month without hiring a developer

### Secondary Persona: Influencer ("Yacine")
- Age: 20-30
- Business: Sells merch to followers (t-shirts, hoodies)
- Technical skill: Medium (comfortable with social media tools)
- Pain: Gumroad/Shopify takes high transaction fees
- Goal: Quick store setup, focus on marketing not tech
- Success metric: Launch store in under 30 minutes

### Tertiary Persona: Agency Owner ("Riad")
- Age: 30-40
- Business: Manages e-commerce for 5-10 small business clients
- Technical skill: Medium-high (knows basic web tools)
- Pain: Expensive to set up separate Shopify accounts for each client
- Goal: Manage multiple client stores from one dashboard
- Success metric: Saves $500/month on tools, faster client onboarding

---

## Product Features

### 1. Authentication & User Management

#### Clerk Auth Integration (NEW)
- **Auth Provider**: Clerk
- **Sign-in Method**: Google OAuth only (no email/password, no phone)
- **User Flow**:
  1. Landing page → "Sign in with Google" button
  2. Clerk handles OAuth flow
  3. After sign-in → Redirect to Home Dashboard (`/[userId]`)
- **Session Management**: Clerk handles tokens, session refresh
- **User Data Stored**:
  - `clerkId` (primary key)
  - `email` (from Google)
  - `name` (from Google profile)
  - `profileImageUrl` (from Google)
  - `createdAt`

---

### 2. Home Dashboard (`/[userId]`)

#### Purpose
Centralized hub where users see all their stores and create new ones.

#### Layout
- **Header**:
  - Logo (top left)
  - User profile dropdown (top right): Name, email, "Sign out"
- **Main Content**:
  - Large prominent button: **"+ Create Store"** (center or top)
  - **Store Gallery** (grid layout):
    - Each store = card with:
      - Store name
      - Store slug (public URL preview: `gayla.dz/[slug]`)
      - Order count badge (e.g., "42 orders this month")
      - Subscription status badge ("Free" / "Active" / "Locked")
      - Click card → Enter store admin

#### Create Store Flow
1. User clicks **"+ Create Store"**
2. Dialog appears:
   - **Store Name** (text input, required)
   - **Store Slug** (text input, required, unique, lowercase, alphanumeric + hyphens)
   - Validation: Slug must be unique across all stores
   - "Cancel" and "Create" buttons
3. User clicks **"Create"**
4. System:
   - Creates store in database
   - Creates empty product catalog
   - Creates default site content
   - Redirects to Build Mode: `/[userId]/[storeId]`

#### Edge Cases
- **Empty State**: If user has 0 stores, show: "No stores yet. Create your first store to get started!"
- **Slug Conflict**: If slug already exists, show error: "This slug is taken. Try another."

---

### 3. Store Admin (`/[userId]/[storeId]`)

**Old route**: `/admin`  
**New route**: `/[userId]/[storeId]`

#### Purpose
Main workspace for managing a single store. Has two modes: **Build Mode** (store management) and **Tracking Mode** (order management).

#### Navigation Structure
- **Top Bar**:
  - Left: Back arrow → Return to Home Dashboard (`/[userId]`)
  - Center: Store name + store slug
  - Right: Mode toggle ("Build Mode" / "Tracking Mode")
- **Mode Toggle**: Switch between Build and Tracking (UI toggle, updates URL query param: `?mode=build` or `?mode=track`)

---

### 4. Build Mode (Store Management)

**Keep all existing features from current `/admin` Build Mode.**

#### Features (Do Not Change)

##### 4.1 Product Management
- **Add Product**:
  - Product name (text)
  - Description (rich text editor)
  - Base price (number)
  - Images (drag-and-drop upload, multiple images, reorder)
  - Variants (size, color, custom)
  - Stock tracking (optional)
  - Archive product (soft delete)
- **Edit Product**: Inline editing or modal
- **Product List**:
  - Grid or list view
  - Search by name
  - Filter by archived/active
  - Sort by created date, name, price

##### 4.2 Site Content Editor
- **Homepage Hero Section**:
  - Hero title (text)
  - Hero subtitle (text)
  - Hero image (upload)
  - CTA button text and link
- **About Section** (rich text editor)
- **Footer Settings**:
  - Contact info
  - Social media links

##### 4.3 Product Catalog
- Visual catalog of all products
- Drag-and-drop reordering
- Quick actions: Edit, Archive, Duplicate

##### 4.4 Variant Management
- Add/edit product variants (size: S/M/L, color: Red/Blue)
- Set variant-specific pricing (+$5 for XL, etc.)
- Variant stock management

##### 4.5 Image Management
- Upload multiple images per product
- Drag to reorder images
- Set featured image
- Delete images

#### Build Mode UI Principles
- Clean, minimal interface
- No overwhelming settings
- Inline editing where possible
- Visual feedback (loading states, success toasts)

---

### 5. Tracking Mode (Order Management)

**Keep all existing features from current `/admin` Tracking Mode.**

#### Features (Do Not Change)

##### 5.1 Order Dashboard
- **Order List**:
  - Table view with columns:
    - Order ID
    - Customer name (hidden if locked)
    - Phone (hidden if locked)
    - Wilaya (visible)
    - Status (badge)
    - Total amount
    - Date
  - Filters:
    - Status: All, New, Confirmed, Packaged, Shipped, Canceled, Blocked, Hold
    - Date range
    - Search by order ID or customer name
  - Sort by: Date, Total, Status

##### 5.2 Order Status Machine
**Existing statuses** (keep exactly as-is):
1. **new**: Customer placed order, waiting for merchant confirmation
2. **confirmed**: Merchant called customer and confirmed order
3. **packaged**: Order is packaged, ready to ship
4. **shipped**: Order sent to delivery company
5. **canceled**: Order canceled by merchant or customer
6. **blocked**: Customer flagged as fraudulent (banned)
7. **hold**: Wrong number detected, on hold

**Status Flow**:
```
new → confirmed → packaged → shipped
  ↓       ↓          ↓
canceled / blocked / hold
```

##### 5.3 Call Center Tools
- **Call Log** (per order):
  - Call attempt counter (1st attempt, 2nd attempt, 3rd attempt)
  - Call outcomes:
    - **Answered**: Customer confirmed (move to "confirmed" status)
    - **No Answer**: Customer didn't pick up (increment attempt counter)
    - **Wrong Number**: Incorrect phone (move to "hold" status)
    - **Refused**: Customer refused order (move to "canceled" status)
  - Timestamp for each call attempt
  - Notes field (merchant can add notes per call)

- **Customer Fraud Scoring** (existing logic):
  - Track customer behavior across orders
  - Flag customers with:
    - Multiple "no answer" orders
    - Multiple "refused" orders
    - Suspicious patterns
  - Merchant can block customer (move all their orders to "blocked")

##### 5.4 Order Actions
- **View Order Details** (modal or side panel):
  - Customer info (name, phone, address, wilaya, commune)
  - Products ordered (list with quantities, variants, prices)
  - Delivery type (Stopdesk / Domicile)
  - Delivery cost
  - Total amount
  - Order timeline (status changes log)
  - Call log
  - Admin notes

- **Action Buttons** (context-aware based on status):
  - **New orders**:
    - "Confirm" (opens call log dialog)
    - "Cancel"
    - "Block Customer"
  - **Confirmed orders**:
    - "Package"
    - "Cancel"
  - **Packaged orders**:
    - "Ship" (with optional delivery company integration)
    - "Cancel"
  - **Shipped orders**:
    - "View Tracking" (if delivery API integrated)
  - **All orders**:
    - "Add Note"
    - "View Change Log"

##### 5.5 Order Change Log (Audit Trail)
- Tracks every action on an order:
  - Status changes (who, when)
  - Call attempts (outcome, timestamp)
  - Notes added (who, when)
  - Edits to order details
- Immutable log (cannot be deleted)

##### 5.6 Admin Notes
- Merchant can add internal notes to orders
- Notes not visible to customers
- Use cases: "Customer asked for blue variant", "Special delivery instructions"

#### Tracking Mode When Locked (After 50 Orders, No Payment)
- Order list shows all orders
- Customer name, phone, address replaced with: `***`
- All action buttons disabled (grayed out)
- Overlay message: **"Unlock your store to manage orders: Pay 2000 DZD"**
- Call log disabled
- Cannot add notes
- Can still view order count and order IDs

---

### 6. NEW FEATURE: Delivery Company API Integration (Optional)

#### Purpose
Allow merchants to optionally integrate with Algerian delivery companies (ZR Express, Yalidine) to automate shipping.

#### User Flow
1. Merchant goes to **Settings** (new section in Build Mode)
2. Section: **"Delivery Integration" (Optional)**
3. Fields:
   - Select delivery company (dropdown: ZR Express, Yalidine, None)
   - API Key (text input, secure)
   - "Test Connection" button
   - "Save" button
4. If configured:
   - In Tracking Mode, merchant can:
     - Select multiple "packaged" orders (checkbox)
     - Click **"Send to Delivery Company"** button
     - System sends order data to delivery API
     - Returns tracking number
     - Order status → "shipped"
     - Tracking number stored in order record

#### Implementation Notes
- This is **optional** – merchant can manage deliveries manually without API
- If not configured, "Ship" button just changes status to "shipped" (no API call)
- Delivery API credentials stored securely per store

---

### 7. Public Storefront (`gayla.dz/[store-slug]`)

**Keep all existing features from current public storefront.**

#### URL Structure
- Format: `gayla.dz/[store-slug]`
- Example: `gayla.dz/fatima-jewelry`
- **NOT**: `gayla.dz/store/[slug]` (no `/store/` prefix)

#### Features (Do Not Change)

##### 7.1 Product Catalog Page
- Hero section (from site content editor)
- Product grid:
  - Product image (first image from product)
  - Product name
  - Price (base price or "From $X" if variants)
  - "View Details" button
- Product filtering (if implemented)
- Product search (if implemented)

##### 7.2 Product Detail Page
- Image gallery (multiple images, carousel)
- Product name
- Product description (rich text)
- Price
- Variant selector (dropdown or buttons for size, color)
- Quantity selector
- **"Add to Cart"** button
- Related products (optional)

##### 7.3 Shopping Cart
- Cart icon (top right, shows item count)
- Cart sidebar or page:
  - List of cart items:
    - Product image
    - Product name
    - Variant (if selected)
    - Quantity (with +/- buttons)
    - Price
    - Remove button
  - Subtotal (products only)
  - **"Proceed to Checkout"** button

##### 7.4 Checkout Page
- **Customer Information Form**:
  - Full Name (required)
  - Phone Number (required, Algerian format validation)
  - Wilaya (dropdown, required)
  - Commune (dropdown, dependent on wilaya, required)
  - Full Address (textarea, required)

- **Delivery Type** (radio buttons):
  - Stopdesk (pickup from delivery company office)
  - Domicile (home delivery)

- **Real-Time Delivery Cost Calculation**:
  - Based on: Wilaya + Delivery Type
  - Uses `deliveryCosts` table (global, shared across all stores)
  - Displayed: "Delivery: X DZD"

- **Order Summary**:
  - Products subtotal
  - Delivery cost
  - **Total** (bold, large font)

- **Place Order Button** (prominent)

- **Payment Method**:
  - Display: "Cash on Delivery (COD)" (read-only, no online payment for MVP)

##### 7.5 Order Confirmation Page
- After customer clicks "Place Order":
  - Order created in database (status: "new")
  - Customer sees confirmation message:
    - **"Order Confirmed!"**
    - **"We'll call you at {phone} to confirm your order."**
    - Order ID displayed
    - "Continue Shopping" button → Back to catalog

#### Public Storefront Behavior When Store is Locked
- **Storefront continues to work** (customers can browse, add to cart, place orders)
- Orders are created in database (status: "new")
- Customer sees normal confirmation message
- Merchant in admin sees orders but cannot manage them until payment

---

## Data Model

### New Tables

#### `users`
```typescript
users: defineTable({
  clerkId: v.string(),           // Primary key from Clerk
  email: v.string(),              // From Google OAuth
  name: v.string(),               // From Google profile
  profileImageUrl: v.optional(v.string()), // From Google
  createdAt: v.number(),          // Timestamp
})
  .index('by_clerk_id', ['clerkId'])
```

#### `stores`
```typescript
stores: defineTable({
  userId: v.id('users'),          // Owner
  name: v.string(),               // "Fatima's Jewelry"
  slug: v.string(),               // "fatima-jewelry" (unique, URL-safe)
  
  // Subscription & Billing
  subscriptionStatus: v.union(
    v.literal('trial'),           // First 50 orders free
    v.literal('active'),          // Paid and unlocked
    v.literal('locked'),          // Hit 50 orders, needs payment
  ),
  firstOrderAt: v.optional(v.number()),  // Timestamp of 1st order in current cycle
  orderCount: v.number(),         // Rolling count (resets after payment)
  subscriptionPaidUntil: v.optional(v.number()), // Timestamp (null if never paid)
  
  // Chargily Integration
  chargilyCustomerId: v.optional(v.string()),
  chargilyInvoiceId: v.optional(v.string()),
  
  // Delivery API (Optional)
  deliveryProvider: v.optional(v.union(
    v.literal('zr_express'),
    v.literal('yalidine'),
    v.literal('none'),
  )),
  deliveryApiKey: v.optional(v.string()), // Encrypted
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_slug', ['slug'])  // Unique index
```

### Modified Tables

#### `products` (Add `storeId`)
```typescript
products: defineTable({
  storeId: v.id('stores'),        // NEW: Foreign key
  name: v.string(),
  description: v.string(),
  basePrice: v.number(),
  images: v.array(v.string()),    // Image URLs
  variants: v.optional(v.array(v.object({
    name: v.string(),             // "Size"
    options: v.array(v.string()), // ["S", "M", "L"]
    priceModifier: v.number(),    // +500 for XL
  }))),
  archived: v.boolean(),          // Soft delete
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_store', ['storeId'])
  .index('by_store_active', ['storeId', 'archived'])
```

#### `orders` (Add `storeId`)
```typescript
orders: defineTable({
  storeId: v.id('stores'),        // NEW: Foreign key
  
  // Customer Info
  customerName: v.string(),
  customerPhone: v.string(),
  customerWilaya: v.string(),
  customerCommune: v.string(),
  customerAddress: v.string(),
  
  // Order Details
  items: v.array(v.object({
    productId: v.id('products'),
    productName: v.string(),
    quantity: v.number(),
    variant: v.optional(v.string()),
    pricePerUnit: v.number(),
  })),
  
  deliveryType: v.union(
    v.literal('stopdesk'),
    v.literal('domicile'),
  ),
  deliveryCost: v.number(),
  subtotal: v.number(),           // Products only
  total: v.number(),              // Subtotal + delivery
  
  // Status
  status: v.union(
    v.literal('new'),
    v.literal('confirmed'),
    v.literal('packaged'),
    v.literal('shipped'),
    v.literal('canceled'),
    v.literal('blocked'),
    v.literal('hold'),
  ),
  
  // Call Log
  callAttempts: v.array(v.object({
    attemptNumber: v.number(),    // 1, 2, 3
    timestamp: v.number(),
    outcome: v.union(
      v.literal('answered'),
      v.literal('no_answer'),
      v.literal('wrong_number'),
      v.literal('refused'),
    ),
    notes: v.optional(v.string()),
  })),
  
  // Fraud Scoring
  customerFraudScore: v.optional(v.number()),
  
  // Delivery Tracking
  trackingNumber: v.optional(v.string()),
  deliveryProvider: v.optional(v.string()),
  
  // Audit Trail
  changeLog: v.array(v.object({
    timestamp: v.number(),
    action: v.string(),           // "status_changed", "note_added", "call_attempted"
    details: v.string(),          // "new → confirmed", "1st call attempt: answered"
    userId: v.optional(v.id('users')),
  })),
  
  // Admin Notes
  adminNotes: v.array(v.object({
    timestamp: v.number(),
    userId: v.id('users'),
    note: v.string(),
  })),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_store', ['storeId'])
  .index('by_store_status', ['storeId', 'status'])
  .index('by_store_date', ['storeId', 'createdAt'])
```

#### `siteContent` (Add `storeId`)
```typescript
siteContent: defineTable({
  storeId: v.id('stores'),        // NEW: Foreign key (each store has own content)
  
  // Hero Section
  heroTitle: v.string(),
  heroSubtitle: v.string(),
  heroImage: v.optional(v.string()),
  heroCtaText: v.string(),
  heroCtaLink: v.string(),
  
  // About Section
  aboutText: v.string(),
  
  // Footer
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  socialLinks: v.optional(v.object({
    facebook: v.optional(v.string()),
    instagram: v.optional(v.string()),
    twitter: v.optional(v.string()),
  })),
  
  updatedAt: v.number(),
})
  .index('by_store', ['storeId'])
```

### Existing Tables (Keep As-Is, Global)

#### `deliveryCosts`
```typescript
// Global table, shared across all stores
deliveryCosts: defineTable({
  wilaya: v.string(),             // "Alger", "Oran", "Sétif"
  stopdesk: v.number(),           // 400 DZD
  domicile: v.number(),           // 600 DZD
})
  .index('by_wilaya', ['wilaya'])
```

---

## Technical Architecture

### Tech Stack:

#### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context (for cart) + Convex real-time (for orders)

#### Backend
- **BaaS**: Convex (keep all existing Convex functions)
- **Database**: Convex (serverless, real-time)
- **File Storage**: Convex (for product images)

#### Auth
- **Provider**: Clerk (NEW)
- **Method**: Google OAuth only

#### Payments
- **Gateway**: Chargily Pay (NEW, for merchant subscriptions)
- **Customer Orders**: COD only (no online payment)

#### Email
- **Provider**: Resend (keep existing)
- **Use cases**: Order confirmations, merchant notifications

#### Delivery APIs (Optional)
- **ZR Express API** (if merchant provides API key)
- **Yalidine API** (if merchant provides API key)

### Infrastructure
- **Hosting**: Vercel (Next.js)
- **Database**: Convex Cloud
- **CDN**: Vercel Edge Network
- **Domain**: `gayla.dz` (main domain)

### Middleware & Routing

#### Route Structure
```
/ (landing page)
/sign-in (Clerk sign-in page)
/[userId] (Home Dashboard)
/[userId]/[storeId] (Store Admin)
  ?mode=build (Build Mode)
  ?mode=track (Tracking Mode)
/[store-slug] (Public Storefront)
/[store-slug]/products/[productId] (Product Detail)
/[store-slug]/checkout (Checkout Page)
/[store-slug]/order-confirmed (Order Confirmation)
```

#### Middleware Logic
1. **Auth Middleware** (Clerk):
   - Public routes: `/`, `/[store-slug]`, `/sign-in`
   - Protected routes: `/[userId]`, `/[userId]/[storeId]`
   - If not authenticated → Redirect to `/sign-in`

2. **Store Middleware**:
   - For `/[userId]/[storeId]`:
     - Verify `userId` matches authenticated user
     - Verify `storeId` belongs to user
     - If not → 404

3. **Subscription Middleware** (Tracking Mode only):
   - Check store subscription status
   - If `locked` (50+ orders, no payment):
     - Hide customer data
     - Disable action buttons
     - Show unlock CTA

4. **Public Storefront Middleware**:
   - For `/[store-slug]`:
     - Resolve `store-slug` to `storeId`
     - If store not found → 404
     - If store exists → Load products, site content
     - Store can be in any subscription status (public storefront always works)

---

## User Flows

### Flow 1: New User Onboarding

1. User visits `gayla.dz`
2. Clicks **"Get Started"** or **"Sign In"**
3. Redirected to Clerk sign-in page
4. Clicks **"Continue with Google"**
5. Google OAuth flow (user approves)
6. Clerk creates user session
7. Redirected to **Home Dashboard** (`/[userId]`)
8. Empty state: **"No stores yet. Create your first store!"**
9. User clicks **"+ Create Store"**
10. Dialog appears:
    - Name: "Fatima's Jewelry"
    - Slug: "fatima-jewelry"
11. User clicks **"Create"**
12. System:
    - Creates store in DB
    - Sets `subscriptionStatus: 'trial'`
    - Sets `orderCount: 0`
    - Creates empty site content
13. Redirected to **Build Mode** (`/[userId]/[storeId]?mode=build`)
14. User adds first product
15. Clicks **"View Store"** → Opens public storefront in new tab (`gayla.dz/fatima-jewelry`)

**Time to first store**: ~5 minutes

---

### Flow 2: Customer Places Order (COD)

1. Customer visits `gayla.dz/fatima-jewelry`
2. Browses products
3. Clicks product → Product detail page
4. Selects variant (if applicable)
5. Clicks **"Add to Cart"**
6. Cart icon updates (shows "1")
7. Customer clicks cart icon → Cart sidebar opens
8. Reviews cart items
9. Clicks **"Proceed to Checkout"**
10. Checkout page loads
11. Customer fills form:
    - Name: "Ahmed Benali"
    - Phone: "0555123456"
    - Wilaya: "Alger" (dropdown)
    - Commune: "Bab El Oued" (dropdown, filtered by wilaya)
    - Address: "Rue de la liberté, Bâtiment 12, Appt 5"
    - Delivery Type: **Domicile** (radio button)
12. System calculates delivery cost:
    - Looks up `deliveryCosts` table (Alger + Domicile = 600 DZD)
    - Displays: "Delivery: 600 DZD"
13. Order Summary shows:
    - Subtotal: 3,000 DZD (products)
    - Delivery: 600 DZD
    - **Total: 3,600 DZD**
14. Customer clicks **"Place Order"**
15. System:
    - Creates order in DB (status: "new")
    - Increments store `orderCount` (+1)
16. Customer sees **"Order Confirmed!"** page:
    - "We'll call you at 0555123456 to confirm your order."
    - Order ID: `#1234`
    - "Continue Shopping" button

**Time to order**: ~3 minutes

---

### Flow 3: Merchant Confirms Order (Tracking Mode)

1. Merchant checks admin manually
2. Merchant goes to **Home Dashboard** (`/[userId]`)
3. Clicks store card ("Fatima's Jewelry")
4. Lands in **Build Mode** by default
5. Toggles to **Tracking Mode**
6. Sees order list
7. New order badge on order row (status: "new")
8. Merchant clicks order row → Order details modal opens
9. Sees customer info:
   - Name: Ahmed Benali
   - Phone: 0555123456
   - Address: Rue de la liberté, Bâtiment 12, Appt 5, Bab El Oued, Alger
   - Delivery: Domicile
   - Total: 3,600 DZD
10. Merchant clicks **"Confirm"** button
11. Call log dialog appears:
    - "Call Attempt #1"
    - Radio buttons:
      - **Answered** (customer confirmed)
      - No Answer
      - Wrong Number
      - Refused
    - Notes field (optional)
12. Merchant selects **"Answered"**
13. Adds note: "Customer confirmed, wants blue variant"
14. Clicks **"Save"**
15. System:
    - Updates order status: `new` → `confirmed`
    - Adds call log entry
    - Adds to change log: "Status changed: new → confirmed by [merchant name] at [timestamp]"
16. Order row updates (status badge: "Confirmed")
17. Merchant can now:
    - Click **"Package"** when ready to ship
    - Later click **"Ship"** (optionally send to delivery API)

**Time to confirm**: ~2 minutes per order

---

### Flow 4: Store Hits 50 Orders (Subscription Lock)

1. Store has 49 orders in current 30-day window
2. Customer places 50th order
3. System:
   - Creates order (status: "new")
   - Increments `orderCount` to 50
   - Checks: `orderCount >= 50` → **TRUE**
   - Updates store:
     - `subscriptionStatus: 'trial'` → `'locked'`
4. Merchant goes to **Tracking Mode**
5. Sees orders in list, but:
   - Customer name: `***`
   - Customer phone: `***`
   - Customer address: `***`
6. Clicks order → Order details modal opens
7. Customer data hidden
8. All action buttons disabled (grayed out)
9. Overlay message appears:
   - **"Unlock Your Store"**
   - "You've reached 50 orders this month. Pay 2000 DZD to unlock and continue managing orders."
   - **"Pay Now"** button (prominent)
10. Merchant clicks **"Pay Now"**
11. Redirected to **Chargily Pay checkout page**
12. Merchant pays 2000 DZD via CIB card
13. Chargily webhook received
14. System:
    - Updates store:
      - `subscriptionStatus: 'locked'` → `'active'`
      - `subscriptionPaidUntil: Date.now() + 30 days`
      - `orderCount: 0` (resets counter)
      - `firstOrderAt: null` (resets for next cycle)
15. Merchant redirected back to Tracking Mode
16. Customer data now visible
17. Action buttons enabled
18. Merchant can manage orders normally
19. After 30 days (subscription expires):
    - Next order increments `orderCount` again
    - After 50 orders, locks again (repeat flow)

**Time to unlock**: ~5 minutes (payment flow)

---

### Flow 5: User with Multiple Stores

1. User has Store A ("Fatima's Jewelry") already created
2. User goes to **Home Dashboard** (`/[userId]`)
3. Sees Store A card in gallery:
   - Name: "Fatima's Jewelry"
   - Slug: `fatima-jewelry`
   - Badge: "42 orders this month" (green)
   - Badge: "Active" (subscription status)
4. User clicks **"+ Create Store"**
5. Dialog appears
6. User enters:
   - Name: "Yacine Merch"
   - Slug: "yacine-merch"
7. Clicks **"Create"**
8. System:
   - Creates Store B
   - Each store has **independent billing**:
     - Store A: 42 orders (still on free tier)
     - Store B: 0 orders (new store, free tier)
9. User redirected to Store B Build Mode
10. User adds products to Store B
11. User returns to Home Dashboard
12. Sees both stores:
   - Store A: 42 orders, Active
   - Store B: 0 orders, Trial
13. User clicks Store A card → Enters Store A admin
14. User clicks back → Returns to Home
15. User clicks Store B card → Enters Store B admin

**Each store is completely isolated**:
- Separate products
- Separate orders
- Separate billing (Store A can be locked while Store B is free)

---

## Subscription & Billing Logic (Detailed)

### Billing State Machine

```
[Store Created]
     ↓
subscriptionStatus: 'trial'
orderCount: 0
     ↓
[Customer places order]
     ↓
orderCount++
     ↓
[orderCount < 50?]
  Yes → Continue (status: 'trial')
  No  → subscriptionStatus: 'locked'
     ↓
[Merchant pays 2000 DZD]
     ↓
subscriptionStatus: 'active'
subscriptionPaidUntil: now + 30 days
orderCount: 0 (reset)
firstOrderAt: null (reset)
     ↓
[Time passes, subscription expires]
     ↓
[now > subscriptionPaidUntil?]
  No → Continue (status: 'active')
  Yes → Wait for next order
     ↓
[Next order after expiry]
     ↓
firstOrderAt: now (start new 30-day window)
orderCount: 1
subscriptionStatus: 'trial' (back to free tier)
     ↓
[Repeat cycle]
```

### Key Rules

1. **50-order limit is per store, per 30-day rolling window**
2. **Window starts on first order** after subscription expires or for new store
3. **Payment unlocks for 30 days from payment date** (not from first order)
4. **After 30 days, if merchant doesn't pay again, store goes back to free tier** (new 50-order allowance)
5. **Public storefront always works** (even if merchant is locked)
6. **No auto-renewal** (merchant must manually pay each cycle)

### Edge Cases

#### Edge Case 1: Store gets 49 orders, then no orders for 45 days
- Day 1: First order (starts 30-day window)
- Day 20: 49th order
- Day 31: Window expires, `orderCount` resets to 0
- Day 45: Next order → Starts new 30-day window (back to free tier)

#### Edge Case 2: Merchant pays, then gets 0 orders for 30 days
- Merchant pays 2000 DZD → unlocked for 30 days
- 30 days pass with 0 orders
- Subscription expires
- Next order → Starts new free 50-order window (merchant doesn't need to pay again)

#### Edge Case 3: Merchant never pays after hitting 50 orders
- Store locks after 50 orders
- Merchant ignores payment prompt
- Orders keep coming, but merchant can't manage them
- Public storefront still works
- After 30 days from first order, window resets
- **But**: Previous 50 orders still locked (hidden data)
- New orders start fresh counter (merchant gets another 50 free orders)
- **Design decision**: Should old locked orders become visible after window reset? **No** – data stays hidden until merchant pays.

---

## Security & Privacy

### Authentication
- **Clerk** handles all auth (Google OAuth)
- No passwords stored
- Session tokens managed by Clerk (JWT)
- Refresh tokens handled automatically

### Authorization
- User can only access their own stores (`userId` check in middleware)
- User cannot access other users' stores (403 Forbidden)
- Public storefront is public (no auth required)

### Data Isolation
- All database queries filter by `storeId`
- Convex functions enforce tenant isolation:
  ```typescript
  // Example: Get products for a store
  export const listProducts = query({
    args: { storeId: v.id('stores') },
    handler: async (ctx, args) => {
      const store = await ctx.db.get(args.storeId)
      if (!store) throw new Error('Store not found')
      
      const user = await ctx.auth.getUserIdentity()
      if (!user) throw new Error('Unauthorized')
      
      const dbUser = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', user.subject))
        .first()
      
      // Verify user owns store
      if (store.userId !== dbUser._id) {
        throw new Error('Forbidden')
      }
      
      // Return products for this store only
      return await ctx.db
        .query('products')
        .withIndex('by_store', (q) => q.eq('storeId', args.storeId))
        .collect()
    },
  })
  ```

### Locked Store Data Protection
- When store is locked, customer data is **hidden** (replaced with `***`)
- Data is **not deleted** (still in database)
- Only **displayed data** is masked (API returns `***` for sensitive fields)
- After payment, data is revealed again
- Implement in Convex function:
  ```typescript
  // Example: Get order with conditional masking
  export const getOrder = query({
    args: { orderId: v.id('orders') },
    handler: async (ctx, args) => {
      const order = await ctx.db.get(args.orderId)
      if (!order) throw new Error('Order not found')
      
      const store = await ctx.db.get(order.storeId)
      
      // If store is locked, mask customer data
      if (store.subscriptionStatus === 'locked') {
        return {
          ...order,
          customerName: '***',
          customerPhone: '***',
          customerAddress: '***',
        }
      }
      
      return order
    },
  })
  ```

### Delivery API Keys
- Stored encrypted in database
- Never exposed in frontend
- Used server-side only (Convex actions)

### HTTPS Everywhere
- All traffic over HTTPS (enforced by Vercel)
- Clerk session cookies are `Secure` and `HttpOnly`

---

## Integrations

### Clerk Auth

#### Setup
1. Create Clerk account
2. Create application in Clerk dashboard
3. Enable Google OAuth provider
4. Get API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Configure redirect URLs:
   - Sign-in: `/sign-in`
   - After sign-in: `/[userId]`
6. Install Clerk SDK:
   ```bash
   npm install @clerk/nextjs
   ```
7. Wrap app with `ClerkProvider` in `app/layout.tsx`
8. Protect routes with `auth()` middleware

#### User Sync
- On first sign-in, create user record in Convex:
  ```typescript
  // Convex function
  export const createOrGetUser = mutation({
    args: {
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      profileImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .first()
      
      if (existing) return existing._id
      
      return await ctx.db.insert('users', {
        ...args,
        createdAt: Date.now(),
      })
    },
  })
  ```
- Call this function in `app/[userId]/page.tsx` on load

---

### Chargily Pay

#### Setup
1. Create Chargily account (merchant account)
2. Get API keys:
   - `CHARGILY_API_KEY`
   - `CHARGILY_WEBHOOK_SECRET`
3. Create product in Chargily:
   - Name: "Gayla Shop Monthly Subscription"
   - Price: 2000 DZD
   - Get product ID

#### Payment Flow
1. User clicks "Pay Now" in locked store overlay
2. Frontend calls Convex action:
   ```typescript
   export const createPaymentLink = action({
     args: { storeId: v.id('stores') },
     handler: async (ctx, args) => {
       const store = await ctx.runQuery(internal.stores.get, { id: args.storeId })
       
       // Call Chargily API to create invoice
       const response = await fetch('https://api.chargily.com/v2/invoices', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.CHARGILY_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           amount: 2000,
           currency: 'DZD',
           description: `Monthly subscription for store: ${store.name}`,
           customer: {
             email: store.ownerEmail,
             name: store.ownerName,
           },
           metadata: {
             storeId: args.storeId,
           },
           success_url: `https://gayla.dz/${store.userId}/${store._id}?payment=success`,
           cancel_url: `https://gayla.dz/${store.userId}/${store._id}?payment=cancel`,
           webhook_url: 'https://gayla.dz/api/webhooks/chargily',
         }),
       })
       
       const data = await response.json()
       return { checkoutUrl: data.checkout_url }
     },
   })
   ```
3. Frontend redirects user to `checkoutUrl`
4. User completes payment on Chargily
5. Chargily sends webhook to `/api/webhooks/chargily`

#### Webhook Handler
```typescript
// app/api/webhooks/chargily/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/convex/_generated/api'
import { fetchMutation } from 'convex/nextjs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-chargily-signature')
  
  // Verify webhook signature
  const isValid = verifyChargilySignature(body, signature, process.env.CHARGILY_WEBHOOK_SECRET)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const payload = JSON.parse(body)
  
  if (payload.event === 'invoice.paid') {
    const storeId = payload.metadata.storeId
    
    // Update store subscription in Convex
    await fetchMutation(api.stores.unlockStore, {
      storeId,
      paidUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 days
    })
  }
  
  return NextResponse.json({ success: true })
}
```

#### Convex Mutation
```typescript
export const unlockStore = mutation({
  args: {
    storeId: v.id('stores'),
    paidUntil: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storeId, {
      subscriptionStatus: 'active',
      subscriptionPaidUntil: args.paidUntil,
      orderCount: 0, // Reset counter
      firstOrderAt: null, // Reset window
    })
  },
})
```

---

### Delivery APIs (Optional)

#### ZR Express API (if merchant configures)

**Endpoint**: `POST https://api.zrexpress.dz/v1/shipments`

**Request**:
```json
{
  "api_key": "merchant_api_key",
  "tracking_number": "ZR123456",
  "customer_name": "Ahmed Benali",
  "customer_phone": "0555123456",
  "wilaya": "Alger",
  "commune": "Bab El Oued",
  "address": "Rue de la liberté, Bâtiment 12",
  "delivery_type": "domicile",
  "cod_amount": 3600,
  "products": [
    { "name": "Silver Necklace", "quantity": 1 }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "tracking_number": "ZR123456",
  "status": "pending_pickup"
}
```

**Implementation**:
```typescript
// Convex action
export const shipWithZRExpress = action({
  args: {
    storeId: v.id('stores'),
    orderIds: v.array(v.id('orders')),
  },
  handler: async (ctx, args) => {
    const store = await ctx.runQuery(internal.stores.get, { id: args.storeId })
    
    if (!store.deliveryApiKey || store.deliveryProvider !== 'zr_express') {
      throw new Error('ZR Express not configured')
    }
    
    for (const orderId of args.orderIds) {
      const order = await ctx.runQuery(internal.orders.get, { id: orderId })
      
      const response = await fetch('https://api.zrexpress.dz/v1/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: store.deliveryApiKey,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          wilaya: order.customerWilaya,
          commune: order.customerCommune,
          address: order.customerAddress,
          delivery_type: order.deliveryType,
          cod_amount: order.total,
          products: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
          })),
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        await ctx.runMutation(internal.orders.updateTracking, {
          orderId,
          trackingNumber: data.tracking_number,
          status: 'shipped',
        })
      }
    }
  },
})
```

---

## Non-Functional Requirements

### Performance
- **Page Load Time**: < 2s (LCP)
- **API Response Time**: < 500ms (p95)
- **Real-time Updates**: < 100ms latency (Convex subscriptions)
- **Image Load**: Lazy loading, WebP format, responsive sizes

### Scalability
- **Database**: Convex scales automatically
- **Hosting**: Vercel Edge Network (global CDN)
- **Target**: Support 3,000 stores × 200 orders/month = 600K orders/month by Year 2

### Reliability
- **Uptime**: 99.9% (Vercel + Convex SLA)
- **Backups**: Convex automatic daily backups
- **Error Monitoring**: Sentry integration (future)

### Accessibility
- **WCAG 2.1 Level AA** compliance (future)
- Keyboard navigation
- Screen reader support
- Sufficient color contrast

### Browser Support
- **Desktop**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Mobile (latest 2 versions)

---

## Out of Scope

Explicitly **NOT** building:

1. **Store Templates**: No pre-made themes or layouts
2. **Store Customization**: No color pickers, font selectors, CSS editors
3. **Custom Domains**: Stores only accessible via `gayla.dz/[slug]`
4. **Multi-language**: English only (no Arabic, French)
5. **Admin Platform Dashboard**: No super-admin view of all stores
6. **Store Suspension**: No ability to manually suspend/ban stores
7. **Merchant Approval**: No manual review of new merchants
8. **Analytics Dashboard**: No charts, graphs, revenue reports for merchants
9. **Mobile App**: No iOS/Android app (web only)
10. **Advanced Delivery**: No real-time tracking maps, delivery scheduling
11. **Online Payments**: No credit card payments (COD only)
12. **Inventory Management**: No stock alerts, low-stock warnings
13. **Customer Accounts**: No customer login, order history, wishlists
14. **Marketing Tools**: No email campaigns, discount codes, referral programs
15. **API for Merchants**: No public API for third-party integrations
16. **White-label**: No reselling or agency plans.

---

## Success Metrics (KPIs)

### Business Metrics
1. **Number of Active Stores**: Target 200 by Year 1
2. **Paid Stores**: % of stores that hit 50 orders (target 50%)
3. **Monthly Recurring Revenue (MRR)**: Target 200K DZD/month by Year 1
4. **Customer Lifetime Value (LTV)**: Average months a store stays active
5. **Churn Rate**: % of stores that stop using platform per month

### Product Metrics
1. **Time to First Store**: < 10 minutes from sign-up
2. **Time to First Product**: < 5 minutes in Build Mode
3. **Orders per Store**: Average orders/month per store
4. **Store Growth Rate**: New stores created per week

### User Experience Metrics
1. **Order Confirmation Rate**: % of "new" orders that become "confirmed"
2. **Order Completion Rate**: % of "confirmed" orders that become "shipped"
3. **Support Tickets**: Fewer tickets = better UX

---

## Risks & Mitigations

### Risk 1: Low Adoption (Merchants don't sign up)
- **Mitigation**: Focus on influencer partnerships, Instagram/Facebook ads in Algeria
- **Mitigation**: Free tier is truly free (no credit card required)

### Risk 2: Payment Friction (Chargily Pay fails or has issues)
- **Mitigation**: Test thoroughly in sandbox mode
- **Mitigation**: Provide clear payment instructions in Arabic/French (future)

### Risk 3: Merchants abuse free tier (never pay)
- **Mitigation**: 50-order limit is generous but prevents unlimited free usage
- **Mitigation**: Locked state is strong incentive to pay (can't manage orders)

### Risk 4: Delivery API integrations break
- **Mitigation**: Make delivery APIs optional (merchants can work without them)
- **Mitigation**: Implement error handling and retry logic

### Risk 5: Data leakage (one merchant sees another's data)
- **Mitigation**: Strict tenant isolation in all Convex queries
- **Mitigation**: Security audit before launch

---

## Conclusion

This PRD defines the complete transformation of Gayla Shop from a single storefront into a multi-tenant SaaS platform designed specifically for the Algerian e-commerce market.

**Key Principles**:
- **Simplicity**: Zero learning curve for non-technical users
- **Algeria-First**: COD workflows, Algerian Dinar payments, local delivery integrations
- **Pay-When-You-Succeed**: Free until 50 orders, then 2000 DZD/month
- **Multi-Store**: One user can manage multiple independent stores
