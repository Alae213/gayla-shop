# OrderDrawer Components

**Modular components for the order management drawer.**

This folder contains sub-components extracted from the original `order-drawer.tsx` mega-component (45KB). Each component handles a specific section of the order drawer interface.

---

## 📋 Component Catalog

| Component | Lines | Purpose | State |
|-----------|-------|---------|-------|
| **OrderDrawerHeader** | ~60 | Title, status badge, close button | Props-only |
| **OrderDrawerCustomer** | ~120 | Customer info (view + edit) | Controlled |
| **OrderDrawerRisk** | ~80 | Fraud score + ban toggle | Controlled |
| **OrderDrawerFooter** | ~40 | Primary action + close button | Props-only |
| **OrderDrawerActions** | ~140 | Status transitions + confirmation | Controlled |
| **OrderDrawerNotes** | ~80 | Internal notes management | Controlled |

---

## 📦 Usage

### Individual Components

```tsx
import {
  OrderDrawerHeader,
  OrderDrawerCustomer,
  OrderDrawerActions,
  OrderDrawerRisk,
  OrderDrawerNotes,
  OrderDrawerFooter,
} from '@/components/admin/orders/order-drawer';

function CustomOrderDrawer({ order }) {
  return (
    <Sheet>
      <OrderDrawerHeader
        order={order}
        statusConfig={getStatusConfig(order.status)}
        onClose={handleClose}
      />
      
      <div className="p-6 space-y-4">
        <OrderDrawerActions
          actionBtns={getAvailableActions(order)}
          pendingAction={pendingAction}
          actionReason={actionReason}
          isActioning={isActioning}
          twoNoAnswers={callAttempts >= 2}
          onActionClick={handleActionClick}
          onReasonChange={setActionReason}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
        
        <OrderDrawerCustomer
          order={order}
          isEditing={isEditing}
          formData={formData}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing(true)}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          onFormChange={setFormData}
        />
        
        <OrderDrawerRisk
          order={order}
          isBanning={isBanning}
          onToggleBan={handleToggleBan}
        />
        
        <OrderDrawerNotes
          notes={order.adminNotes || []}
          newNote={newNote}
          isSaving={isSavingNote}
          onNoteChange={setNewNote}
          onSave={handleSaveNote}
        />
      </div>
      
      <OrderDrawerFooter
        orderNumber={order.orderNumber}
        primaryAction={primaryAction}
        isActioning={isActioning}
        onActionClick={handleActionClick}
        onClose={handleClose}
      />
    </Sheet>
  );
}
```

---

## 🏛️ Component Architecture

### State Management Pattern

**Props-Only Components:**
- `OrderDrawerHeader`
- `OrderDrawerFooter`

These receive all data via props and have no internal state.

**Controlled Components:**
- `OrderDrawerCustomer`
- `OrderDrawerActions`
- `OrderDrawerNotes`
- `OrderDrawerRisk`

These components:
1. Receive state via props
2. Emit changes via callback props
3. Parent component manages actual state

### Data Flow

```
[OrderDrawer] (Main Component)
      │
      ├── Manages State:
      │   - isEditing, formData, isSaving
      │   - pendingAction, actionReason
      │   - newNote, isSavingNote
      │   - isBanning
      │
      ├──> [OrderDrawerHeader] (display)
      ├──> [OrderDrawerActions] (controlled)
      ├──> [OrderDrawerCustomer] (controlled)
      ├──> [OrderDrawerRisk] (controlled)
      ├──> [OrderDrawerNotes] (controlled)
      └──> [OrderDrawerFooter] (display)
```

---

## 🔄 Component Interfaces

### OrderDrawerHeader

```typescript
interface OrderDrawerHeaderProps {
  order: Order;
  statusConfig: { color: string; bg: string; icon: string };
  onClose: () => void;
}
```

### OrderDrawerCustomer

```typescript
interface OrderDrawerCustomerProps {
  order: Order;
  isEditing: boolean;
  formData: CustomerFormData;
  isSaving: boolean;
  onEditToggle: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormChange: (updates: Partial<CustomerFormData>) => void;
}
```

### OrderDrawerActions

```typescript
interface OrderDrawerActionsProps {
  actionBtns: ActionBtn[];
  pendingAction: ActionBtn | null;
  actionReason: string;
  isActioning: boolean;
  twoNoAnswers: boolean;
  onActionClick: (btn: ActionBtn) => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}
```

### OrderDrawerRisk

```typescript
interface OrderDrawerRiskProps {
  order: Order;
  isBanning: boolean;
  onToggleBan: () => void;
}
```

### OrderDrawerNotes

```typescript
interface OrderDrawerNotesProps {
  notes: AdminNote[];
  newNote: string;
  isSaving: boolean;
  onNoteChange: (note: string) => void;
  onSave: () => void;
}
```

### OrderDrawerFooter

```typescript
interface OrderDrawerFooterProps {
  orderNumber: string;
  primaryAction: ActionBtn | null;
  isActioning: boolean;
  onActionClick: (action: ActionBtn) => void;
  onClose: () => void;
}
```

---

## 🛠️ Development

### Testing Individual Components

```tsx
// Test OrderDrawerHeader
import { render, screen } from '@testing-library/react';
import { OrderDrawerHeader } from './order-drawer-header';

test('displays order number', () => {
  render(
    <OrderDrawerHeader
      order={mockOrder}
      statusConfig={{ color: 'text-blue-700', bg: 'bg-blue-50', icon: '✓' }}
      onClose={jest.fn()}
    />
  );
  expect(screen.getByText(/Order #ORD-123/)).toBeInTheDocument();
});
```

### Adding a New Section

1. Create new component file (e.g., `order-drawer-shipping.tsx`)
2. Define clear props interface
3. Extract relevant JSX from main component
4. Add to `index.ts` exports
5. Update main `order-drawer.tsx` to use it
6. Update this README

---

## 📊 Before & After

### Before (Mega Component)

```
order-drawer.tsx
- 1,300+ lines
- 15+ useState hooks
- 10+ useMutation calls
- Mixed concerns
- Hard to test
- Slow to understand
```

### After (Modular)

```
order-drawer/
  ├── order-drawer-header.tsx      (60 lines)
  ├── order-drawer-customer.tsx    (120 lines)
  ├── order-drawer-actions.tsx     (140 lines)
  ├── order-drawer-risk.tsx        (80 lines)
  ├── order-drawer-notes.tsx       (80 lines)
  └── order-drawer-footer.tsx      (40 lines)

+ Main component manages orchestration
+ Clear separation of concerns
+ Easy to test in isolation
+ Better code reusability
```

---

## 📝 Notes

- **Main OrderDrawer** still exists in parent folder (will be refactored to use these components)
- All components use **controlled component pattern**
- State management remains in main component
- Each component is **independently testable**
- Components can be **reused** in other contexts (e.g., OrderDetailsModal)

**Status:** ✅ Extraction complete, awaiting integration

**Last updated:** March 2026
