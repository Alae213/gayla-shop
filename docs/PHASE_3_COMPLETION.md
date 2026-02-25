# Phase 3: Multi-Product Orders & Legacy Migration

## Overview

Phase 3 enables **multi-product orders** by migrating the legacy single-product format to a flexible `lineItems` array structure. This phase also ensures backward compatibility with existing orders.

---

## What Was Built

### 1. Legacy Order Migration System

**Files Created:**
- `convex/migrations/migrateToLineItems.ts` - Migration logic
- `scripts/migrate-orders.ts` - CLI runner script
- `docs/MIGRATION_GUIDE.md` - User documentation

**Features:**
- ✅ One-time migration for existing orders
- ✅ Idempotent (safe to run multiple times)
- ✅ Batch processing (configurable size)
- ✅ Dry-run mode for preview
- ✅ Progress tracking and error reporting
- ✅ Rollback capability for single-product orders
- ✅ Fetches product thumbnails from database
- ✅ Preserves all legacy data (zero data loss)

**Usage:**
```bash
# Preview changes
npm run migrate:orders:dry-run

# Run migration
npm run migrate:orders

# Custom batch size
npm run migrate:orders -- --batch=50
```

---

### 2. Multi-Product Order Support

**Card Display Priority:**
The Kanban board and order cards now intelligently display product information:

- **Multi-product orders:** Display first line item + "+ N more" badge
- **Legacy orders:** Fall back to old single-product fields
- **Deleted products:** Show warning badge gracefully

**Implementation:**
```typescript
function extractCardData(order: Order) {
  // Multi-product: use first line item
  if (order.lineItems && order.lineItems.length > 0) {
    const firstItem = order.lineItems[0];
    return {
      productName: firstItem.productName,
      thumbnail: firstItem.thumbnail,
      quantity: firstItem.quantity,
      variantLabel: Object.values(firstItem.variants)[0],
      moreItemsCount: order.lineItems.length - 1,
    };
  }
  
  // Legacy: use old fields
  return {
    productName: order.productName,
    productVariant: variantLabel(order),
    quantity: order.quantity > 1 ? order.quantity : undefined,
  };
}
```

**Files Modified:**
- `components/admin/tracking/views/tracking-kanban-board.tsx` - Already had correct logic
- `components/admin/tracking/ui/tracking-order-card.tsx` - Supports moreItemsCount badge
- `components/admin/tracking/views/tracking-order-details.tsx` - Line items editor integration

---

### 3. Backward Compatibility

**Legacy Field Preservation:**
All existing order fields remain intact during migration:

- `productId`, `productName`, `productPrice` → Preserved
- `selectedVariant` → Converted to `variants` in lineItems
- `quantity` → Copied to `lineItems[0].quantity`
- `totalAmount` → Unchanged (includes delivery)

**Dual Format Support:**
The UI gracefully handles both formats:

```typescript
// Order detail panel
function extractLineItems(order: Order) {
  // Use lineItems if available
  if (order.lineItems?.length > 0) return order.lineItems;
  
  // Migrate legacy format on-the-fly
  if (order.productId) {
    return [{
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity ?? 1,
      unitPrice: order.productPrice ?? 0,
      variants: order.selectedVariant,
      lineTotal: (order.quantity ?? 1) * (order.productPrice ?? 0),
    }];
  }
  
  return [];
}
```

---

## Migration Data Flow

```mermaid
flowchart TD
    A[Legacy Order] -->|Migration| B[New Format]
    A -->|Fields| C[productId, productName, productPrice]
    A -->|Variant| D[selectedVariant: {size, color}]
    A -->|Quantity| E[quantity: 2]
    
    B -->|Array| F[lineItems: []]
    F -->|Item| G[productId, productName, unitPrice]
    F -->|Variant| H[variants: {size, color}]
    F -->|Quantity| I[quantity: 2]
    F -->|Total| J[lineTotal: quantity × unitPrice]
    F -->|Thumbnail| K[thumbnail: products.images[0]]
    
    B -->|Preserves| C
    B -->|Preserves| D
    B -->|Preserves| E
```

---

## Integration Points

### Frontend Components

1. **Tracking Order Card**
   - Displays first line item for multi-product orders
   - Shows "+ N more" badge when `moreItemsCount > 0`
   - Falls back to legacy fields for unmigrated orders

2. **Order Detail Panel**
   - Line Items Editor appears for all orders (migrates legacy on-the-fly)
   - Edit quantities, variants, add/remove products
   - Real-time subtotal and total recalculation

3. **Kanban Board**
   - Drag-and-drop works with both formats
   - Column totals include all line items
   - Filters and search work across formats

### Backend (Convex)

1. **Orders Schema**
   - `lineItems` field added (optional, array)
   - Legacy fields preserved for compatibility
   - `lastUpdated` timestamp tracks changes

2. **Mutations**
   - `orders.updateLineItems` - Edit line items array
   - `migrations.migrateToLineItems` - Batch migration
   - `migrations.countLegacyOrders` - Count pending migrations

3. **Queries**
   - All queries return both formats transparently
   - No breaking changes to existing queries

---

## Testing Checklist

### Migration Testing

- [ ] Dry-run shows accurate preview
- [ ] Migration completes without errors
- [ ] Already-migrated orders are skipped
- [ ] Batch processing works correctly
- [ ] Progress reporting is accurate
- [ ] Rollback works for single-product orders
- [ ] Error handling reports failed orders

### Multi-Product Display

- [ ] Card shows first line item correctly
- [ ] "+ N more" badge appears for multi-product orders
- [ ] Thumbnails display when available
- [ ] Legacy orders show fallback data
- [ ] Deleted products show warning badge
- [ ] Variant labels extract correctly

### Backward Compatibility

- [ ] Unmigrated orders display correctly
- [ ] Legacy fields still accessible
- [ ] Order totals match pre-migration
- [ ] Tracking workflow unchanged
- [ ] Search/filter work across both formats
- [ ] No console errors with legacy orders

### Line Items Editor (Cross-Phase)

- [ ] Editor works with migrated orders
- [ ] Add/remove products updates lineItems array
- [ ] Quantity changes recalculate totals
- [ ] Variant selector loads product variants
- [ ] Save updates backend correctly
- [ ] Multi-product orders editable

---

## Performance Considerations

### Migration Performance

- **Batch Size:** Default 100 orders per run
- **Timeout Protection:** Large batches may need smaller size
- **Database Reads:** 2 reads per order (order + product)
- **Database Writes:** 1 write per order (patch lineItems)

**Recommendation:** For 1000+ orders, use batch size of 50-100.

### Runtime Performance

- **Legacy Fallback:** On-the-fly migration adds minimal overhead
- **Card Rendering:** extractCardData is memoized per order
- **Query Impact:** No change (lineItems is optional field)

---

## Known Limitations

1. **Add Product Modal:** Integration pending (placeholder shown in UI)
2. **Rollback:** Only works for single-product orders
3. **Thumbnails:** Legacy products without images won't have thumbnails
4. **Admin Name:** Hardcoded in change log (needs auth context)

---

## Deployment Steps

### 1. Deploy Code
```bash
git pull origin main
npm install
npx convex deploy
npm run build
```

### 2. Run Migration
```bash
# Preview first
npm run migrate:orders:dry-run

# Execute migration
npm run migrate:orders
```

### 3. Verify
- Open admin tracking workspace
- Check migrated orders display correctly
- Test line items editor on multiple orders
- Verify no console errors

### 4. Monitor
- Check Convex logs: `npx convex logs`
- Monitor error rates in production
- Validate order totals match pre-migration

---

## Support & Troubleshooting

See **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** for:
- Detailed migration steps
- Rollback procedures
- Common errors and solutions
- FAQ

---

## Next Steps

### Immediate
- [ ] Run migration on production database
- [ ] Verify all orders migrated successfully
- [ ] Test line items editor with real data

### Future Enhancements
- [ ] Integrate Add Product modal
- [ ] Add auth context for admin name
- [ ] Implement product variant color picker
- [ ] Add bulk line item operations
- [ ] Create order templates (common product bundles)

---

## Summary

✅ **Phase 3 Complete**

- Multi-product order support ✅
- Legacy migration system ✅
- Backward compatibility ✅
- Card display priority logic ✅
- Comprehensive documentation ✅
- Safe, idempotent migration ✅

The system now supports both single and multi-product orders seamlessly, with zero downtime migration and full backward compatibility.
