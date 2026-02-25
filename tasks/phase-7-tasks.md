# Phase 7: Advanced Admin Features & System Optimization

> **Timeline**: 3-4 weeks  
> **Status**: Ready to Start  
> **Completion**: 0/41 tasks (0%)

---

## Week 1: Bulk Operations & Analytics (12 tasks)

### 7.1: Bulk Operations System (6 tasks)

#### Task 7.1.1: Multi-Select UI
- [ ] Add checkbox column to OrdersTable
- [ ] Implement "Select All" checkbox in header
- [ ] Add individual row checkboxes
- [ ] Create selection state management (useState + context)
- [ ] Add selected count badge UI
- [ ] Persist selection across pagination

**Files**: `components/admin/orders-table.tsx`

#### Task 7.1.2: Bulk Actions Toolbar
- [ ] Create `components/admin/bulk-actions-toolbar.tsx`
- [ ] Floating toolbar at bottom (sticky)
- [ ] Action buttons: Confirm, Package, Ship, Cancel, Delete, Export
- [ ] Clear selection button
- [ ] Loading states for async operations
- [ ] Success/error toasts

**Component**: `BulkActionsToolbar`

#### Task 7.1.3: Backend Bulk Mutations
- [ ] Create `convex/bulkOperations.ts`
- [ ] Implement `bulkUpdateStatus` mutation (generic)
- [ ] Implement `bulkUpdateDelivery` mutation
- [ ] Implement `bulkDelete` mutation
- [ ] Add transaction-like error handling
- [ ] Return success/failure counts

**Backend**: New mutations

#### Task 7.1.4: Bulk Delivery Editor
- [ ] Create bulk delivery modal component
- [ ] Wilaya/commune selectors (same as single edit)
- [ ] Delivery type toggle
- [ ] Cost preview for all selected orders
- [ ] "Apply to N orders" button
- [ ] Error handling (show which orders failed)

**Component**: `BulkDeliveryEditModal`

#### Task 7.1.5: Bulk Export Integration
- [ ] Add "Export Selected" button to toolbar
- [ ] Pass selected order IDs to export function
- [ ] Show progress indicator for large selections
- [ ] Auto-download when ready

**Integration**: Connect to 7.4.1 (CSV export)

#### Task 7.1.6: Testing & Polish
- [ ] Test multi-select with pagination
- [ ] Test bulk operations with 50+ orders
- [ ] Test error scenarios (some succeed, some fail)
- [ ] Test keyboard shortcuts (Shift+Click for range select)
- [ ] UI polish and animations

---

### 7.2: Analytics Dashboard (6 tasks)

#### Task 7.2.1: Dashboard Page Structure
- [ ] Create `app/admin/dashboard/page.tsx`
- [ ] Layout: 4 overview cards + 2 charts + 2 tables
- [ ] Responsive grid (1 col mobile, 2 cols tablet, 4 cols desktop)
- [ ] Loading skeletons
- [ ] Error boundaries

**Page**: `/admin/dashboard`

#### Task 7.2.2: Overview Cards
- [ ] Create `components/admin/dashboard/overview-cards.tsx`
- [ ] Revenue card (today/week/month tabs)
- [ ] Orders count card
- [ ] Average order value card
- [ ] Success rate card
- [ ] Add sparklines (mini line charts)
- [ ] Add % change indicators (vs previous period)

**Component**: 4 stat cards

#### Task 7.2.3: Revenue Chart
- [ ] Create `components/admin/dashboard/revenue-chart.tsx`
- [ ] Install Recharts: `npm install recharts`
- [ ] Line chart with gradient fill
- [ ] Time range selector: 7d, 30d, 90d, 1y
- [ ] Tooltip with exact values
- [ ] Export as PNG button

**Library**: Recharts

#### Task 7.2.4: Orders Donut Chart
- [ ] Create `components/admin/dashboard/orders-donut-chart.tsx`
- [ ] Donut/pie chart showing status breakdown
- [ ] Color-coded segments (match status colors)
- [ ] Center: total count
- [ ] Legend with percentages
- [ ] Click segment to filter orders table (future)

**Component**: Donut chart

#### Task 7.2.5: Top Products & Recent Orders
- [ ] Create `components/admin/dashboard/top-products-table.tsx`
- [ ] Show top 5 products by order count
- [ ] Columns: Rank, Product, Orders, Revenue
- [ ] Create `components/admin/dashboard/recent-orders-table.tsx`
- [ ] Show 5 most recent orders
- [ ] Auto-refresh every 30 seconds

**Components**: 2 tables

#### Task 7.2.6: Backend Analytics Queries
- [ ] Create `convex/analytics.ts`
- [ ] `getOverviewStats` query (revenue, orders, avg, success rate)
- [ ] `getRevenueTimeSeries` query (7d, 30d, 90d, 1y)
- [ ] `getOrdersByStatus` query (count per status)
- [ ] `getTopProducts` query (group by product, count orders)
- [ ] `getRecentOrders` query (order by createdAt desc, limit 5)
- [ ] Add indexes for performance

**Backend**: New queries

---

## Week 2: Search & Export (10 tasks)

### 7.3: Advanced Search & Filters (5 tasks)

#### Task 7.3.1: Filter Panel UI
- [ ] Create `components/admin/orders-filter-panel.tsx`
- [ ] Slide-out panel (Sheet component)
- [ ] Filter inputs: Status, Date range, Wilaya, Commune, Delivery type, Total range, Product, Risk level, Banned
- [ ] Apply Filters button
- [ ] Clear All button
- [ ] Show active filter count badge

**Component**: Filter panel

#### Task 7.3.2: Filter State Management
- [ ] Create filter context (FilterContext)
- [ ] FilterState interface
- [ ] Apply filters to orders query
- [ ] Persist filters in URL query params
- [ ] Clear filters functionality

**State**: Context + URL sync

#### Task 7.3.3: Saved Filters System
- [ ] Create saved filters UI (dropdown)
- [ ] Pre-defined filters: "Pending", "Ready to Ship", "High Value", etc.
- [ ] Custom filter saving (modal: name + filters)
- [ ] Edit/delete saved filters
- [ ] Store in localStorage or backend

**Feature**: Saved filters

#### Task 7.3.4: Global Search Enhancement
- [ ] Enhance search bar in OrdersTable
- [ ] Multi-field search: Order number, Customer name, Phone, Product name, Wilaya, Commune
- [ ] Debounced input (300ms)
- [ ] Clear button (X icon)
- [ ] Keyboard shortcut: Cmd/Ctrl + K
- [ ] Results count badge

**Enhancement**: Search bar

#### Task 7.3.5: Backend Query Enhancements
- [ ] Update `convex/orders.ts` list query
- [ ] Add filter parameters: status[], dateFrom, dateTo, wilaya, commune, deliveryType, totalMin, totalMax, productId, riskLevel[], isBanned
- [ ] Implement filtering logic
- [ ] Add search parameter (multi-field)
- [ ] Optimize with indexes
- [ ] Test performance with 10,000+ orders

**Backend**: Enhanced query

---

### 7.4: Export & Reporting (5 tasks)

#### Task 7.4.1: CSV Export
- [ ] Create `lib/utils/export-csv.ts`
- [ ] Install papaparse: `npm install papaparse @types/papaparse`
- [ ] Export all orders or filtered subset
- [ ] Configurable columns
- [ ] UTF-8 BOM for Excel compatibility
- [ ] Auto-download file
- [ ] Include line items (expanded rows)

**Library**: papaparse

#### Task 7.4.2: Excel Export
- [ ] Create `lib/utils/export-excel.ts`
- [ ] Install exceljs: `npm install exceljs`
- [ ] Multi-sheet workbook: Summary, Orders, Line Items, Analytics
- [ ] Formatted headers (bold, colored)
- [ ] Number/date formatting
- [ ] Conditional formatting (status colors)
- [ ] Auto-column width

**Library**: exceljs

#### Task 7.4.3: PDF Invoice Generator
- [ ] Create `lib/utils/generate-invoice-pdf.ts`
- [ ] Install jsPDF: `npm install jspdf jspdf-autotable`
- [ ] Invoice template with company branding
- [ ] Order details section
- [ ] Line items table
- [ ] Totals breakdown
- [ ] Footer with terms & conditions

**Library**: jsPDF

#### Task 7.4.4: Export Dialog UI
- [ ] Create `components/admin/export/export-dialog.tsx`
- [ ] Format selector: CSV, Excel, PDF
- [ ] Column selector (for CSV/Excel)
- [ ] Filter selector (all, filtered, selected)
- [ ] Progress indicator for large exports
- [ ] Export history (last 10 exports)

**Component**: Export dialog

#### Task 7.4.5: Backend Export Actions
- [ ] Create `convex/exports.ts`
- [ ] `exportOrders` action (handles large datasets)
- [ ] Store exports in Convex file storage
- [ ] `getExportHistory` query
- [ ] Cleanup old exports (cron job, 7 days retention)

**Backend**: Export actions

---

## Week 3: Performance & Mobile (11 tasks)

### 7.5: Performance Optimization (6 tasks)

#### Task 7.5.1: Pagination Implementation
- [ ] Create `components/admin/pagination-controls.tsx`
- [ ] Page size selector: 25, 50, 100
- [ ] Previous/Next buttons
- [ ] Page number input (jump to page)
- [ ] Total count display
- [ ] Keyboard shortcuts (← →)
- [ ] Persist page in URL

**Component**: Pagination

#### Task 7.5.2: Cursor-Based Pagination Backend
- [ ] Update `convex/orders.ts` list query
- [ ] Implement cursor-based pagination (Convex best practice)
- [ ] Return: results, nextCursor, prevCursor, totalCount
- [ ] Handle page size changes
- [ ] Test with 10,000+ orders

**Backend**: Cursor pagination

#### Task 7.5.3: Query Optimization
- [ ] Add indexes to `convex/schema.ts`:
  - orders.by_status
  - orders.by_customer_phone
  - orders.by_wilaya
  - orders.by_date_created
- [ ] Limit fields in list query (exclude changeLog, adminNotes)
- [ ] Fetch full details only in drawer
- [ ] Test query performance (aim for < 500ms)

**Optimization**: Indexes + field limiting

#### Task 7.5.4: Component Optimization
- [ ] Add React.memo to pure components
- [ ] useMemo for expensive calculations (cart totals)
- [ ] useCallback for event handlers
- [ ] Lazy load OrderDrawer
- [ ] Lazy load AddProductModal
- [ ] Code splitting for analytics charts

**Optimization**: React performance

#### Task 7.5.5: Image Optimization
- [ ] Replace <img> with Next.js Image component
- [ ] Optimize thumbnail sizes: 40x40 (list), 80x80 (drawer)
- [ ] Add lazy loading
- [ ] Add placeholder images
- [ ] Test with slow 3G network

**Optimization**: Images

#### Task 7.5.6: Performance Testing & Benchmarking
- [ ] Lighthouse audit (aim for 90+ performance score)
- [ ] Measure page load time (< 2s target)
- [ ] Measure Time to Interactive (< 3s target)
- [ ] Test with 10,000+ orders
- [ ] Profile with React DevTools
- [ ] Document performance metrics

**Testing**: Benchmarks

---

### 7.6: Mobile Admin Panel (5 tasks)

#### Task 7.6.1: Responsive Navigation
- [ ] Update `components/admin/sidebar-nav.tsx`
- [ ] Mobile: Hamburger menu button
- [ ] Mobile: Slide-out drawer with Sheet
- [ ] Mobile: Full-screen overlay
- [ ] Touch-friendly tap targets (44px min)
- [ ] Test on iOS and Android

**Component**: Mobile nav

#### Task 7.6.2: Mobile Orders Table
- [ ] Create card-based layout for mobile
- [ ] Replace table with vertical cards
- [ ] Show key info: Order #, Customer, Total, Status, Time
- [ ] Swipe actions (left: call, right: edit)
- [ ] Pull to refresh
- [ ] Infinite scroll

**Component**: Mobile table

#### Task 7.6.3: Mobile Order Drawer
- [ ] Update OrderDrawer for mobile
- [ ] Full-screen modal on mobile (< 768px)
- [ ] Header with back button
- [ ] Fixed bottom action bar
- [ ] Swipe down to close
- [ ] Test on various screen sizes

**Component**: Mobile drawer

#### Task 7.6.4: Touch Gestures
- [ ] Install react-swipeable: `npm install react-swipeable`
- [ ] Swipe right: Call customer
- [ ] Swipe left: Quick edit
- [ ] Long press: Multi-select mode
- [ ] Pull down: Refresh list
- [ ] Test gesture interactions

**Library**: react-swipeable

#### Task 7.6.5: Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] Test landscape orientation
- [ ] Test with touch events (not just responsive)
- [ ] Document mobile UX issues

**Testing**: Mobile devices

---

## Week 4: Reliability & Polish (8 tasks)

### 7.7: System Reliability (4 tasks)

#### Task 7.7.1: Error Boundaries
- [ ] Create `components/error-boundary.tsx`
- [ ] Wrap major sections: OrdersTable, OrderDrawer, Dashboard
- [ ] Friendly error fallback UI
- [ ] Retry button
- [ ] Log errors to console (or Sentry)
- [ ] Test with intentional errors

**Component**: Error boundary

#### Task 7.7.2: Optimistic Updates
- [ ] Implement optimistic UI for status changes
- [ ] Update UI immediately
- [ ] Revert on mutation error
- [ ] Show error toast on failure
- [ ] Test network failure scenarios

**Pattern**: Optimistic UI

#### Task 7.7.3: Audit Logging System
- [ ] Add `auditLogs` table to `convex/schema.ts`
- [ ] Log all admin actions: create, update, delete
- [ ] Include: userId, action, resource, resourceId, details, timestamp
- [ ] Create `convex/auditLogs.ts` with queries
- [ ] Create Audit Log page in admin panel
- [ ] Filter by user, action, date range
- [ ] Export audit log as CSV

**Feature**: Audit logging

#### Task 7.7.4: Data Validation
- [ ] Client-side validation with Zod
- [ ] Backend validation with Convex validators
- [ ] Prevent invalid data entry
- [ ] Show inline validation errors
- [ ] Test edge cases (negative prices, empty fields)

**Validation**: Multi-layer

---

### 7.8: Testing & Documentation (4 tasks)

#### Task 7.8.1: E2E Testing
- [ ] Test bulk operations flow
- [ ] Test analytics dashboard accuracy
- [ ] Test export (CSV, Excel, PDF)
- [ ] Test advanced search and filters
- [ ] Test pagination with large datasets
- [ ] Test mobile workflows
- [ ] Test error scenarios

**Testing**: End-to-end

#### Task 7.8.2: Performance Testing
- [ ] Load test with 10,000+ orders
- [ ] Measure page load times
- [ ] Measure mutation response times
- [ ] Measure export times (1000 orders)
- [ ] Profile memory usage
- [ ] Document benchmarks

**Testing**: Performance

#### Task 7.8.3: Documentation
- [ ] Update `docs/admin-features.md` (new features)
- [ ] Create `docs/analytics-guide.md`
- [ ] Create `docs/bulk-operations-guide.md`
- [ ] Create `docs/export-guide.md`
- [ ] Update `docs/performance-notes.md`
- [ ] Update README with Phase 7 completion

**Docs**: Feature guides

#### Task 7.8.4: Production Deployment
- [ ] Code review (self + team)
- [ ] Merge all Phase 7 branches to main
- [ ] Deploy backend (Convex)
- [ ] Deploy frontend (Vercel)
- [ ] Smoke test in production
- [ ] Monitor for errors (24 hours)
- [ ] Gather admin feedback

**Deploy**: Production

---

## Progress Tracking

### Week 1: Bulk Operations & Analytics
- [ ] 7.1.1: Multi-Select UI
- [ ] 7.1.2: Bulk Actions Toolbar
- [ ] 7.1.3: Backend Bulk Mutations
- [ ] 7.1.4: Bulk Delivery Editor
- [ ] 7.1.5: Bulk Export Integration
- [ ] 7.1.6: Testing & Polish
- [ ] 7.2.1: Dashboard Page Structure
- [ ] 7.2.2: Overview Cards
- [ ] 7.2.3: Revenue Chart
- [ ] 7.2.4: Orders Donut Chart
- [ ] 7.2.5: Top Products & Recent Orders
- [ ] 7.2.6: Backend Analytics Queries

**Completion**: 0/12 (0%)

### Week 2: Search & Export
- [ ] 7.3.1: Filter Panel UI
- [ ] 7.3.2: Filter State Management
- [ ] 7.3.3: Saved Filters System
- [ ] 7.3.4: Global Search Enhancement
- [ ] 7.3.5: Backend Query Enhancements
- [ ] 7.4.1: CSV Export
- [ ] 7.4.2: Excel Export
- [ ] 7.4.3: PDF Invoice Generator
- [ ] 7.4.4: Export Dialog UI
- [ ] 7.4.5: Backend Export Actions

**Completion**: 0/10 (0%)

### Week 3: Performance & Mobile
- [ ] 7.5.1: Pagination Implementation
- [ ] 7.5.2: Cursor-Based Pagination Backend
- [ ] 7.5.3: Query Optimization
- [ ] 7.5.4: Component Optimization
- [ ] 7.5.5: Image Optimization
- [ ] 7.5.6: Performance Testing & Benchmarking
- [ ] 7.6.1: Responsive Navigation
- [ ] 7.6.2: Mobile Orders Table
- [ ] 7.6.3: Mobile Order Drawer
- [ ] 7.6.4: Touch Gestures
- [ ] 7.6.5: Mobile Testing

**Completion**: 0/11 (0%)

### Week 4: Reliability & Polish
- [ ] 7.7.1: Error Boundaries
- [ ] 7.7.2: Optimistic Updates
- [ ] 7.7.3: Audit Logging System
- [ ] 7.7.4: Data Validation
- [ ] 7.8.1: E2E Testing
- [ ] 7.8.2: Performance Testing
- [ ] 7.8.3: Documentation
- [ ] 7.8.4: Production Deployment

**Completion**: 0/8 (0%)

---

## Overall Progress

**Total Tasks**: 41  
**Completed**: 0  
**In Progress**: 0  
**Remaining**: 41  
**Completion**: 0%

---

## Dependencies Checklist

### NPM Packages to Install
- [ ] `npm install recharts` (analytics charts)
- [ ] `npm install papaparse @types/papaparse` (CSV export)
- [ ] `npm install exceljs` (Excel export)
- [ ] `npm install jspdf jspdf-autotable` (PDF generation)
- [ ] `npm install react-swipeable` (mobile gestures)
- [ ] `npm install swr` (optional: query caching)
- [ ] `npm install @sentry/nextjs` (optional: error tracking)

### Convex Schema Changes
- [ ] Add `auditLogs` table
- [ ] Add indexes: by_status, by_customer_phone, by_wilaya, by_date_created

### New Convex Files
- [ ] `convex/bulkOperations.ts` (bulk mutations)
- [ ] `convex/analytics.ts` (analytics queries)
- [ ] `convex/exports.ts` (export actions)
- [ ] `convex/auditLogs.ts` (audit queries)

---

## Success Criteria

### Must Have (MVP)
- [x] Bulk status changes working
- [x] Analytics dashboard with key metrics
- [x] CSV export for orders
- [x] Pagination for orders list
- [x] Mobile-responsive admin panel

### Should Have
- [x] Bulk delivery editor
- [x] Excel export
- [x] Advanced search and filters
- [x] Error boundaries
- [x] Audit logging

### Nice to Have
- [x] PDF invoice generator
- [x] Saved filters
- [x] Touch gestures
- [x] Optimistic updates
- [x] Scheduled reports

---

**Status**: Ready to Start 🚀  
**Next Task**: 7.1.1 - Multi-Select UI  
**Let's build Phase 7!**
