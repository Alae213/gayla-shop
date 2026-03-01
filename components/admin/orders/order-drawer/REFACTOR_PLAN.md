# OrderDrawer Refactoring Plan

## Current State
- **File:** `order-drawer.tsx`
- **Size:** 45KB (1,300+ lines)
- **Complexity:** High - 15+ useState hooks, 10+ Convex mutations
- **Status:** 🚧 In Progress - Sub-components extracted

## ✅ COMPLETED: Component Extraction

### Extracted Components (Task 3.1)

✅ **OrderDrawerHeader** (60 lines)
- Title, status badge, close button
- Pure presentational component
- Status: Ready for integration

✅ **OrderDrawerCustomer** (120 lines)
- Customer info view/edit modes
- Controlled component
- Status: Ready for integration

✅ **OrderDrawerRisk** (80 lines)
- Fraud score display
- Ban toggle
- Status: Ready for integration

✅ **OrderDrawerFooter** (40 lines)
- Primary action button
- Close button
- Status: Ready for integration

✅ **OrderDrawerActions** (140 lines)
- Status transition buttons
- Confirmation flow
- Reason selection
- Status: Ready for integration

✅ **OrderDrawerNotes** (80 lines)
- Internal notes management
- Note history display
- Status: Ready for integration

✅ **Supporting Files**
- `types.ts` - Shared TypeScript interfaces
- `index.ts` - Barrel exports
- `README.md` - Component documentation

---

## 🚧 NEXT: Integration Phase

### Task 3.1.7: Refactor Main Component

Update `order-drawer.tsx` to use the extracted sub-components:

```tsx
import {
  OrderDrawerHeader,
  OrderDrawerCustomer,
  OrderDrawerActions,
  OrderDrawerRisk,
  OrderDrawerNotes,
  OrderDrawerFooter,
} from './order-drawer';

export function OrderDrawer({ isOpen, onClose, order, onSuccess }) {
  // Keep all state management here
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...});
  // ... all other state

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <OrderDrawerHeader
          order={order}
          statusConfig={cfg}
          onClose={onClose}
        />
        
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <OrderDrawerActions
            actionBtns={actionBtns}
            pendingAction={pendingAction}
            // ... other props
          />
          
          {/* Line items section */}
          
          {/* Delivery section */}
          
          <OrderDrawerCustomer
            order={order}
            isEditing={isEditing}
            formData={formData}
            // ... other props
          />
          
          <OrderDrawerRisk
            order={order}
            isBanning={isBanning}
            onToggleBan={handleToggleBan}
          />
          
          {/* Call log section */}
          
          <OrderDrawerNotes
            notes={order.adminNotes || []}
            newNote={newNote}
            // ... other props
          />
          
          {/* History timeline */}
        </div>
        
        <OrderDrawerFooter
          orderNumber={order.orderNumber}
          primaryAction={primaryAction}
          // ... other props
        />
      </SheetContent>
    </Sheet>
  );
}
```

**Benefits:**
- Main component reduces from 1,300 → ~400 lines
- Clear separation of concerns
- Each section independently testable
- No functional changes (safe refactor)

**Estimated Time:** 1-2 hours

---

## 📊 Progress

```
Phase 1: Component Extraction    [██████████] 100% ✅
Phase 2: Integration             [░░░░░░░░░░]   0% ⏸️
Phase 3: Testing                 [░░░░░░░░░░]   0%
Phase 4: Performance Audit       [░░░░░░░░░░]   0%
```

**Overall:** 25% Complete

---

## ✅ Benefits Achieved So Far

1. **Code Organization**
   - 6 focused, single-purpose components
   - Clear file structure
   - Easy to navigate

2. **Maintainability**
   - Each component < 150 lines
   - Well-documented interfaces
   - TypeScript types extracted

3. **Reusability**
   - Components can be used in OrderDetailsModal
   - Can be used in other order management UIs
   - Shared via barrel exports

4. **Testing**
   - Each component can be tested in isolation
   - Mock dependencies easily
   - Unit tests are simpler

---

## 🔄 Rollback Strategy

If integration causes issues:

1. **Immediate:** Git revert to pre-integration commit
2. **Partial:** Keep extracted components, don't delete old code yet
3. **Gradual:** Integrate one component at a time

**Current main component is untouched** - zero risk until integration phase.

---

## 📝 Next Steps

### Immediate (This PR)
- [x] Extract sub-components
- [x] Create types file
- [x] Add barrel exports
- [x] Write documentation
- [ ] Integrate into main component
- [ ] Test functionality
- [ ] Remove old code

### Follow-up (Next PR)
- [ ] Add unit tests for each component
- [ ] Add Storybook stories
- [ ] Performance audit
- [ ] Apply same pattern to OrderDetailsModal

---

## 📅 Timeline

- **March 1, 2026:** Component extraction complete ✅
- **Next session:** Integration phase
- **Target completion:** March 2026

---

## 📝 Notes

- **No breaking changes** until integration
- **Existing order-drawer.tsx still works** as-is
- **Safe to merge** current state (adds files, doesn't modify existing)
- **Integration can be done incrementally**

**Status:** 🟡 Ready for integration

**Last updated:** March 2026
