# OrderDrawer Refactoring Plan

## Current State
- **File:** `order-drawer.tsx`
- **Size:** 45KB (1,300+ lines)
- **Complexity:** High - 15+ useState hooks, 10+ Convex mutations
- **Status:** ⚠️ Requires refactoring

## Problem
Mega-component with multiple responsibilities:
- Customer info editing
- Line items management
- Status transitions with validation
- Call logging
- Notes management
- Delivery editing
- History timeline
- Fraud/ban controls

## Proposed Structure

```
order-drawer/
├── index.tsx                    # Main wrapper (orchestration)
├── use-order-drawer.ts          # Custom hook for shared state
├── order-drawer-header.tsx      # Title, status badge, close button
├── order-drawer-actions.tsx     # Status action buttons + confirmation
├── order-drawer-items.tsx       # Line items display/edit
├── order-drawer-delivery.tsx    # Delivery info editor
├── order-drawer-customer.tsx    # Customer info form
├── order-drawer-risk.tsx        # Fraud score + ban toggle
├── order-drawer-call-log.tsx    # Call logging interface
├── order-drawer-notes.tsx       # Internal notes section
├── order-drawer-history.tsx     # Timeline toggle/display
└── order-drawer-footer.tsx      # Primary action + close
```

## State Management Strategy

### Option 1: Context Provider (Recommended)
```tsx
const OrderDrawerContext = createContext<{
  order: Order;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  formData: FormData;
  setFormData: (v: FormData) => void;
  // ... other shared state
}>();
```

### Option 2: Custom Hook
```tsx
function useOrderDrawer(order: Order) {
  // All state + mutations here
  // Return { state, actions }
}
```

## Migration Steps

### Phase 1: Extract Sub-Components (No State Changes)
1. Create `order-drawer/` folder
2. Extract pure display components first:
   - `order-drawer-header.tsx` (props: order, onClose)
   - `order-drawer-footer.tsx` (props: primaryAction, onClose)
3. Test: Ensure drawer still works

### Phase 2: Extract Sections with Props
4. Extract sections that receive props:
   - `order-drawer-customer.tsx` (props: order, formData, isEditing, handlers)
   - `order-drawer-risk.tsx` (props: order, onToggleBan)
5. Test: Functionality intact

### Phase 3: Introduce State Management
6. Create `use-order-drawer.ts` hook
7. Move all useState + useMutation calls
8. Refactor main component to use hook
9. Test: State updates work correctly

### Phase 4: Final Split
10. Extract remaining components using hook
11. Update imports in parent files
12. Add tests for each component
13. Performance audit

## Benefits After Refactoring
- ✅ Each component < 200 lines
- ✅ Easier to test in isolation
- ✅ Better code reusability
- ✅ Improved maintainability
- ✅ Clearer separation of concerns

## Risks
- State synchronization bugs
- Performance regression if context rerenders
- Breaking existing imports

## Estimate
- **Time:** 2-3 days
- **Complexity:** High
- **Priority:** Medium (works fine, but hard to maintain)

## Status
📋 **Documented** - Ready for implementation in dedicated sprint
