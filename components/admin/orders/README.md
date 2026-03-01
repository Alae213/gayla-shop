# Order Management Components

**Complete order tracking and management system for the admin dashboard.**

This folder contains all components for viewing, editing, and tracking customer orders through their lifecycle - from placement to delivery.

---

## 📋 Component Catalog

### Main Components

| Component | Size | Purpose | Key Features |
|-----------|------|---------|-------------|
| **OrderDrawer** | 45KB | Complete order editor | • Full order details<br>• Status transitions<br>• Call logging<br>• Customer editing<br>• Line items management |
| **OrderDetailsModal** | 21KB | Quick order view | • Read-only details<br>• Print-friendly<br>• Status history |
| **OrderDeliveryEditor** | 13KB | Delivery info editor | • Wilaya/commune picker<br>• Delivery cost calc<br>• Stop desk vs home |
| **OrderLineItemEditor** | 11KB | Edit order items | • Add/remove products<br>• Quantity adjustment<br>• Variant selection |
| **OrderHistoryTimeline** | 11KB | Status changelog | • Timeline view<br>• Admin actions<br>• Timestamps |

### Submodules

#### `/components` - UI Primitives
- `OrderCard` - Order card display
- `StatusPill` - Status badge
- `CallLogIndicator` - Call attempt badge
- `Button`, `Checkbox`, `Panel` - Custom UI elements

#### `/features` - Feature Modules
- Order kanban board
- Bulk actions
- Filters & search

#### `/hooks` - Custom Hooks
- `useOrders` - Order data fetching
- `useOrderFilters` - Filter state management
- `useOrderActions` - Mutation helpers

#### `/views` - Page Components
- Order list view
- Kanban view
- Analytics dashboard

---

## 📦 Installation & Usage

### Basic Order Display

```tsx
import { OrderDrawer, OrderCard } from '@/components/admin/orders';
import { useState } from 'react';

function OrdersList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = useOrders();

  return (
    <>
      <div className="grid gap-4">
        {orders.map(order => (
          <OrderCard 
            key={order._id}
            order={order}
            onClick={() => setSelectedOrder(order)}
          />
        ))}
      </div>

      <OrderDrawer 
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSuccess={() => refetchOrders()}
      />
    </>
  );
}
```

### Order Status Management

```tsx
import { OrderDrawer } from '@/components/admin/orders';

function OrderManagement() {
  const updateStatus = useMutation(api.orders.updateStatus);

  return (
    <OrderDrawer 
      order={order}
      onStatusChange={async (newStatus) => {
        await updateStatus({ 
          id: order._id, 
          status: newStatus 
        });
      }}
    />
  );
}
```

### Delivery Editing

```tsx
import { OrderDeliveryEditor } from '@/components/admin/orders';

function DeliverySection({ order }) {
  return (
    <OrderDeliveryEditor
      currentWilaya={order.customerWilaya}
      currentCommune={order.customerCommune}
      currentDeliveryType={order.deliveryType}
      currentDeliveryCost={order.deliveryCost}
      onSave={async (updates) => {
        await updateDelivery({
          id: order._id,
          ...updates
        });
      }}
    />
  );
}
```

---

## 🏛️ Architecture

### Order Status Flow

```
Pending → Confirmed → Packaged → Shipped → Delivered
   │         │
   └─────────┼─────────> Cancelled
             │
Shipped ─────> Retour (returned)
```

### Call Logging System

**Rules:**
- Max 2 call attempts
- If customer answers: Can confirm or cancel
- If 2 no-answers: Must cancel (confirm disabled)

```tsx
// Call log structure
interface CallLog {
  timestamp: number;
  outcome: 'answered' | 'no_answer';
  note?: string;
}
```

### Data Model

```typescript
interface Order {
  _id: Id<'orders'>;
  orderNumber: string;        // e.g., "ORD-12345"
  status: OrderStatus;
  
  // Customer
  customerName: string;
  customerPhone: string;
  customerWilaya: string;     // Province
  customerCommune: string;    // City/town
  customerAddress: string;
  
  // Delivery
  deliveryType: 'Domicile' | 'Stopdesk';
  deliveryCost: number;
  
  // Products (new format)
  lineItems?: LineItem[];     // Multiple products
  
  // Legacy (single product)
  productName?: string;
  productPrice?: number;
  selectedVariant?: { size?: string; color?: string };
  
  // Totals
  totalAmount: number;
  
  // Tracking
  callAttempts?: number;
  callLog?: CallLog[];
  statusHistory?: StatusHistory[];
  adminNotes?: AdminNote[];
  
  // Risk
  fraudScore?: number;        // 0=safe, 3+=high risk
  isBanned?: boolean;
  
  // Courier integration
  courierTrackingId?: string;
  courierError?: string;
  retourReason?: string;
}
```

---

## 🔄 Order Lifecycle

### 1. **New Order (Pending)**
- Customer places order
- Admin receives notification
- Call customer to confirm

### 2. **Confirmation**
- Log call outcome (answered/no answer)
- If answered: Move to "Confirmed"
- If 2 no-answers: Must cancel

### 3. **Fulfillment**
- Mark as "Packaged" when ready
- Send to courier
- Update to "Shipped" with tracking ID

### 4. **Delivery**
- Mark as "Delivered" when complete
- OR "Retour" if returned (with reason)

### 5. **Cancellation**
- Can cancel at any stage before shipped
- Must provide reason
- Increments fraud score if repeated

---

## 🛡️ Fraud Prevention

### Fraud Score System

- **0**: Safe customer
- **1-2**: Caution (some cancelled/returned orders)
- **3+**: High risk

**Score increments when:**
- Order cancelled after confirmation (+1)
- Order returned (+1)
- Customer unreachable (+0.5)

### Ban System

```tsx
// Ban a customer
await banCustomer({
  phone: order.customerPhone,
  isBanned: true
});

// Future orders from banned number = auto-cancelled
```

---

## 📊 Analytics

### Metrics Tracked

- Orders per status
- Conversion rate (pending → delivered)
- Average order value
- Cancellation reasons
- Delivery time by wilaya
- Top products

---

## 🛠️ Development

### Component Refactoring

⚠️ **OrderDrawer** needs splitting (see `order-drawer/REFACTOR_PLAN.md`)

### Testing Orders

```bash
# Unit tests
npm test -- components/admin/orders

# Integration tests
npm test:e2e -- orders
```

### Common Mutations

```typescript
// Update order status
const updateStatus = useMutation(api.orders.updateStatus);
await updateStatus({ id, status: 'confirmed' });

// Log call
const logCall = useMutation(api.orders.logCallOutcome);
await logCall({ orderId: id, outcome: 'answered' });

// Add note
const addNote = useMutation(api.orders.addNote);
await addNote({ orderId: id, text: 'Customer confirmed delivery address' });

// Ban customer
const banCustomer = useMutation(api.orders.banCustomer);
await banCustomer({ phone: '0555123456', isBanned: true });
```

---

## 📌 Related

- [`/admin/build`](../build/README.md) - Build mode components
- [`/admin/shared`](../shared/README.md) - Shared utilities
- [`/admin/tracking`](../tracking/README.md) - Courier integration

---

## 📝 Notes

- Orders use **Convex** for real-time updates
- **Optimistic updates** for better UX
- **Change log** tracks all admin actions
- **Phone numbers** are primary customer identifier
- Supports both **legacy** (single product) and **new** (line items) format

**Last updated:** March 2026
