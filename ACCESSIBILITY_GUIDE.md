# ♿ Accessibility Implementation Guide

**Project:** Gayla Shop  
**Standard:** WCAG 2.1 Level AA + Keyboard Navigation  
**Date:** February 25, 2026  

---

## 🎯 Overview

This guide covers implementing accessible patterns for:
- ARIA labels and attributes
- Keyboard navigation
- Focus management
- Screen reader support
- Modal/dialog accessibility

---

## 🏷️ ARIA Labels & Attributes

### Interactive Elements

#### Buttons
```tsx
import { generateButtonLabel } from '@/lib/utils/aria-utils';

// ✅ Icon-only buttons need labels
<button aria-label={generateButtonLabel('Delete', 'order #12345')}>
  <TrashIcon />
</button>

// ✅ Toggle buttons need pressed state
<button
  aria-label="Toggle sidebar"
  aria-pressed={isOpen ? 'true' : 'false'}
  onClick={toggle}
>
  <MenuIcon />
</button>

// ❌ Don't forget labels
<button>
  <EditIcon />  {/* Screen readers can't read this */}
</button>
```

#### Links
```tsx
// ✅ Descriptive link text
<a href="/orders/123" aria-label="View order #123 details">
  View Details
</a>

// ✅ External links should indicate
<a 
  href="https://example.com" 
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Visit example.com (opens in new tab)"
>
  Learn More
</a>
```

### Form Fields

```tsx
import { generateFieldDescription } from '@/lib/utils/aria-utils';

// ✅ Proper labeling and descriptions
<div>
  <label htmlFor="customer-name" id="name-label">
    Customer Name
    {isRequired && <span aria-label="required">*</span>}
  </label>
  
  <input
    id="customer-name"
    name="customerName"
    aria-labelledby="name-label"
    aria-describedby="name-description name-error"
    aria-required="true"
    aria-invalid={hasError ? 'true' : 'false'}
  />
  
  <div id="name-description" className="text-sm text-system-300">
    Enter the customer's full name
  </div>
  
  {hasError && (
    <div id="name-error" role="alert" className="text-error-300">
      Name is required
    </div>
  )}
</div>
```

### Status Indicators

```tsx
import { generateStatusLabel } from '@/lib/utils/aria-utils';

// ✅ Status badges with labels
<Badge
  className="bg-success-100 text-success-300"
  aria-label={generateStatusLabel('Completed', 'Order delivered on Jan 15')}
>
  ✓ Completed
</Badge>

// ✅ Loading states
<div 
  role="status" 
  aria-live="polite" 
  aria-label="Loading orders"
>
  <Spinner />
  <span className="sr-only">Loading...</span>
</div>
```

### Dynamic Updates

```tsx
// ✅ Live regions for updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {itemCount} items in cart
</div>

// ✅ Assertive for critical updates
<div
  role="alert"
  aria-live="assertive"
>
  Payment failed. Please try again.
</div>
```

---

## ⌨️ Keyboard Navigation

### General Patterns

| Key | Action |
|-----|--------|
| **Tab** | Move focus forward |
| **Shift+Tab** | Move focus backward |
| **Enter** | Activate buttons/links |
| **Space** | Activate buttons, toggle checkboxes |
| **Escape** | Close modals/dialogs |
| **Arrow Keys** | Navigate lists, menus, tabs |
| **Home** | Jump to first item |
| **End** | Jump to last item |

### Implementation Examples

#### Card List Navigation

```tsx
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useRef } from 'react';

function OrderList({ orders }) {
  const listRef = useRef<HTMLDivElement>(null);
  
  useKeyboardNavigation({
    containerRef: listRef,
    direction: 'vertical',
    enableArrowKeys: true,
    enableHomeEnd: true,
    onActivate: (element) => {
      // Navigate to order details when Enter pressed
      const orderId = element.dataset.orderId;
      router.push(`/orders/${orderId}`);
    },
  });
  
  return (
    <div ref={listRef} role="list">
      {orders.map((order) => (
        <div
          key={order.id}
          role="listitem"
          tabIndex={0}
          data-order-id={order.id}
          aria-label={`Order #${order.id}, ${order.status}`}
        >
          <OrderCard order={order} />
        </div>
      ))}
    </div>
  );
}
```

#### Modal with Focus Trap

```tsx
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useFocusTrap({
    containerRef: modalRef,
    enabled: isOpen,
    autoFocus: true,
    restoreFocus: true,
    onEscape: onClose,
    preventScroll: true,
  });
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div>
        <h2 id="modal-title">Confirm Action</h2>
        <p id="modal-description">Are you sure you want to proceed?</p>
        
        {children}
        
        <div>
          <button onClick={onClose} aria-label="Cancel">
            Cancel
          </button>
          <button onClick={handleConfirm} aria-label="Confirm action">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Dropdown Menu

```tsx
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useState, useRef } from 'react';

function Dropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { focusFirst } = useKeyboardNavigation({
    containerRef: menuRef,
    direction: 'vertical',
    enableArrowKeys: true,
    enableEscape: true,
    onEscape: () => setIsOpen(false),
  });
  
  const handleOpen = () => {
    setIsOpen(true);
    // Focus first item when opened
    setTimeout(focusFirst, 10);
  };
  
  return (
    <div>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={handleOpen}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Focus Management

### Focus Indicators

```css
/* globals.css - Focus visible styles */

/* Hide focus for mouse users */
body.using-mouse *:focus {
  outline: none;
}

/* Show focus for keyboard users */
*:focus-visible {
  outline: 2px solid var(--primary-200);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast focus for dark backgrounds */
.dark *:focus-visible {
  outline-color: var(--primary-100);
}
```

### Skip Links

```tsx
// app/layout.tsx
function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-200 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        
        <nav>{/* Navigation */}</nav>
        
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

### Focus Restoration

```tsx
// Automatically handled by useFocusTrap
const modal = useFocusTrap({
  containerRef: modalRef,
  restoreFocus: true, // Returns focus to trigger element
});
```

---

## 🔊 Screen Reader Announcements

### Using the Announce Hook

```tsx
import { useAnnounce } from '@/hooks/use-focus-trap';

function OrderList() {
  const announce = useAnnounce();
  
  const handleDelete = async (orderId: string) => {
    await deleteOrder(orderId);
    
    // Announce success
    announce('Order deleted successfully', 'polite');
  };
  
  const handleError = (error: string) => {
    // Critical announcements use assertive
    announce(`Error: ${error}`, 'assertive');
  };
  
  return (/* ... */);
}
```

### Screen Reader Only Text

```tsx
// Utility class for sr-only
// Already in Tailwind: sr-only

<button>
  <TrashIcon />
  <span className="sr-only">Delete order</span>
</button>
```

---

## 📋 Common Patterns

### Accessible Card

```tsx
function OrderCard({ order }) {
  return (
    <article
      className="card"
      role="article"
      aria-labelledby={`order-${order.id}-title`}
    >
      <h3 id={`order-${order.id}-title`}>
        Order #{order.id}
      </h3>
      
      <div>
        <Badge
          aria-label={`Status: ${order.status}`}
        >
          {order.status}
        </Badge>
      </div>
      
      <a
        href={`/orders/${order.id}`}
        aria-label={`View details for order #${order.id}`}
      >
        View Details
      </a>
    </article>
  );
}
```

### Accessible Table

```tsx
function OrderTable({ orders }) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  return (
    <table role="table" aria-label="Orders table">
      <thead>
        <tr>
          <th
            scope="col"
            aria-sort={sortColumn === 'id' ? getAriaSort(sortDirection) : 'none'}
          >
            <button
              onClick={() => handleSort('id')}
              aria-label={`Sort by order ID, currently ${
                sortColumn === 'id' ? sortDirection : 'unsorted'
              }`}
            >
              Order ID
            </button>
          </th>
          {/* More columns */}
        </tr>
      </thead>
      
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            {/* More cells */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Accessible Form

```tsx
function OrderForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const announce = useAnnounce();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(errors).length > 0) {
      announce(
        `Form has ${Object.keys(errors).length} errors. Please fix them before submitting.`,
        'assertive'
      );
      return;
    }
    
    await submitOrder();
    announce('Order created successfully', 'polite');
  };
  
  return (
    <form onSubmit={handleSubmit} aria-label="Create order form">
      {/* Form fields with proper ARIA */}
      
      <button type="submit" aria-label="Submit order">
        Create Order
      </button>
    </form>
  );
}
```

---

## ✅ Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Focus visible with clear outline
- [ ] Logical tab order (matches visual order)
- [ ] Skip links work
- [ ] Modals trap focus
- [ ] Escape closes modals/dropdowns
- [ ] Enter activates buttons/links
- [ ] Arrow keys navigate lists/menus
- [ ] Home/End keys work in lists

### Screen Readers
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] Form fields have labels
- [ ] Error messages announced
- [ ] Status updates announced
- [ ] Tables have proper headers
- [ ] Lists use proper markup
- [ ] Headings in logical order (h1 > h2 > h3)

### ARIA
- [ ] Roles appropriate (button, link, dialog, etc.)
- [ ] States communicated (expanded, pressed, checked)
- [ ] Properties set (label, describedby, required)
- [ ] Live regions for dynamic content
- [ ] No ARIA where native HTML works

---

## 🛠️ Testing Tools

### Browser Extensions
1. **axe DevTools** - Automated testing
2. **WAVE** - Visual accessibility evaluation
3. **Lighthouse** - Accessibility audit

### Screen Readers
1. **NVDA** (Windows) - Free
2. **JAWS** (Windows) - Commercial
3. **VoiceOver** (Mac/iOS) - Built-in
4. **TalkBack** (Android) - Built-in

### Keyboard Testing
```bash
# Disconnect mouse and navigate with keyboard only
# Test all interactive features
# Verify all functionality accessible
```

---

## 📚 References

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
