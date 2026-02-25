# Line Items Migration Guide

## Overview

This guide covers migrating legacy single-product orders to the new `lineItems` array format, which supports multi-product orders and improved line item editing.

---

## What Changes?

### Before (Legacy Format)
```typescript
{
  productId: Id<"products">,
  productName: "T-shirt",
  productPrice: 2000,
  productSlug: "t-shirt",
  selectedVariant: { size: "M", color: "Red" },
  quantity: 2,
  totalAmount: 4600 // includes delivery
}
```

### After (New Format)
```typescript
{
  lineItems: [
    {
      productId: Id<"products">,
      productName: "T-shirt",
      productSlug: "t-shirt",
      unitPrice: 2000,
      quantity: 2,
      variants: { size: "M", color: "Red" },
      lineTotal: 4000,
      thumbnail: "https://..."
    }
  ],
  totalAmount: 4600 // still includes delivery
}
```

**Key Differences:**
- ✅ `lineItems` array can contain multiple products
- ✅ `variants` replaces `selectedVariant` (more flexible)
- ✅ `unitPrice` + `lineTotal` separate from order total
- ✅ `thumbnail` extracted from product images
- ⚠️ Legacy fields preserved for backward compatibility

---

## Migration Steps

### 1. Backup Your Database

**Convex automatically backs up data**, but you can export manually:

```bash
# Export all orders before migration
npx convex export --table orders --output orders-backup.json
```

### 2. Preview Migration (Dry Run)

**Always run dry-run first** to see what will change:

```bash
npm run migrate:orders:dry-run
```

Output:
```
📊 Analyzing orders...

Total orders:          150
Already migrated:      0 ✓
Needs migration:       150
Batch size:            100

🔍 DRY RUN MODE - No changes will be made

Would migrate 100 orders
```

### 3. Run Migration

**Execute the migration** (processes 100 orders by default):

```bash
npm run migrate:orders
```

Output:
```
⚙️  Running migration...

────────────────────────────────────────
📊 MIGRATION RESULTS

Total orders:          150
✅ Migrated:           100
⏭️  Skipped:            50
❌ Failed:             0

✅ Migration completed successfully!

ℹ️  50 orders remaining. Run migration again to continue.
```

### 4. Process Remaining Batches

If you have more orders than the batch size:

```bash
# Run again for next batch
npm run migrate:orders

# Or increase batch size
npm run migrate:orders -- --batch=500
```

### 5. Verify Migration

Check your admin panel:

1. Open any migrated order in the tracking workspace
2. Verify the **Line Items Editor** appears correctly
3. Confirm product name, quantity, and variants are correct
4. Check that thumbnails display properly

---

## Rollback (If Needed)

**Only works for single-product orders migrated in this batch.**

Multi-product orders **cannot** be automatically rolled back.

```typescript
// In Convex dashboard, run this mutation:
api.migrations.migrateToLineItems.rollbackLineItemsMigration({})
```

Or restore from backup:

```bash
npx convex import --table orders --file orders-backup.json --mode replace
```

---

## Troubleshooting

### ❌ "Module not found: convex/migrations"

**Solution:** The migration script is in `convex/migrations/migrateToLineItems.ts`. Ensure your Convex deployment is up to date:

```bash
npx convex deploy
```

### ⚠️ "X orders failed"

**Cause:** Usually deleted products or corrupted data.

**Solution:** Check the error log in the output, then manually fix affected orders:

```typescript
// In Convex dashboard
api.orders.get({ id: "<order-id>" })
```

### 🐛 Thumbnails Not Showing

**Cause:** Legacy products may not have images.

**Solution:** This is expected. Thumbnails will only appear for products with uploaded images. You can add images retroactively via the Products page.

### 🔄 Migration Stuck

**Cause:** Large batch size causing timeout.

**Solution:** Use smaller batches:

```bash
npm run migrate:orders -- --batch=25
```

---

## Post-Migration Checklist

- [ ] All orders have `lineItems` field
- [ ] Line Items Editor displays correctly in order details
- [ ] Product names and variants match legacy data
- [ ] Order totals unchanged (subtotal + delivery = total)
- [ ] Thumbnails display for products with images
- [ ] Legacy orders (single product) work in tracking board
- [ ] Multi-product orders (if any) display "+ N more" badge
- [ ] No console errors when opening order details

---

## FAQ

**Q: Will this break existing orders?**  
A: No. The migration preserves all legacy fields for backward compatibility. The UI gracefully handles both formats.

**Q: What happens to orders placed during migration?**  
A: New orders created after deploying the new code will automatically use `lineItems` format. Legacy orders are migrated separately.

**Q: Can I run the migration multiple times?**  
A: Yes! Already-migrated orders are automatically skipped. It's safe and idempotent.

**Q: Do I need to migrate immediately?**  
A: No. The system supports both formats indefinitely. However, multi-product features require `lineItems`.

**Q: What if a product is deleted?**  
A: The migration still works. It uses stored product data from the order. Deleted products show a warning badge in the UI.

---

## Support

If you encounter issues not covered here:

1. Check Convex logs: `npx convex logs`
2. Review error messages in migration output
3. Test with dry-run mode first
4. Contact your dev team with the error log

---

## Technical Notes

- Migration uses `internalMutation` for batch safety
- Original fields are preserved (no data loss)
- Thumbnails fetched from `products.images[0]`
- Variants converted from `selectedVariant` to `variants` object
- Legacy UI fallback ensures zero downtime

**Migration Script:** `convex/migrations/migrateToLineItems.ts`  
**Runner Script:** `scripts/migrate-orders.ts`
