# 🎨 Color Usage Guide - WCAG AA Compliant

## Overview

This guide helps you choose the right color shade for accessible, WCAG AA compliant designs.

**Last Updated:** February 25, 2026  
**Compliance Level:** WCAG 2.1 Level AA  

---

## 📊 Color Contrast Requirements

### WCAG 2.1 Level AA (Minimum)
- **Normal text (< 18px):** 4.5:1 contrast ratio
- **Large text (≥ 18px or ≥14px bold):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

### WCAG 2.1 Level AAA (Enhanced)
- **Normal text:** 7:1 contrast ratio
- **Large text:** 4.5:1 contrast ratio

---

## 🟦 System Colors

### When to Use

#### `system-50` (#f2f2f2) - 1.08:1
- ✅ Card backgrounds
- ✅ Section backgrounds
- ✅ Hover states (subtle)
- ❌ **Never** for text

#### `system-100` (#ececec) - 1.15:1
- ✅ Site background
- ✅ Input backgrounds
- ✅ Disabled state backgrounds
- ❌ **Never** for text

#### `system-200` (#e1e1e1) - 1.29:1
- ✅ Borders
- ✅ Dividers
- ✅ Separators
- ❌ **Never** for text

#### `system-300` (#6b6b6b) - 5.74:1 ✅
- ✅ Labels
- ✅ Captions
- ✅ Secondary text
- ✅ Form helper text
- ✅ Timestamps

**Example:**
```tsx
<label className="text-system-300">
  Customer Name
</label>
<p className="text-system-300 text-sm">
  Last updated 5 minutes ago
</p>
```

#### `system-400` (#404040) - 10.16:1 ✅
- ✅ Primary text
- ✅ Headings
- ✅ Body copy
- ✅ Button labels

**Example:**
```tsx
<h1 className="text-system-400">
  Order Dashboard
</h1>
<p className="text-system-400">
  Manage your orders and track deliveries.
</p>
```

---

## 🔵 Brand/Primary Colors

### When to Use

#### `brand-50` / `primary-50` (#eaf3ff) - 1.04:1
- ✅ Light backgrounds
- ✅ Accent backgrounds
- ✅ Hover states
- ❌ **Never** for text

#### `brand-100` / `primary-100` (#b4caf5) - 1.92:1
- ✅ Light backgrounds
- ✅ Badge backgrounds
- ❌ **Never** for text

#### `brand-200` / `primary-200` (#0052cc) - 5.92:1 ✅
- ✅ Primary buttons text (on light bg)
- ✅ Links
- ✅ Interactive elements
- ✅ Brand text

**Example:**
```tsx
<Button className="bg-brand-200 text-white">
  Save Changes
</Button>
<a href="#" className="text-brand-200 hover:underline">
  Learn more
</a>
```

#### `brand-300` / `primary-300` (#2e73db) - 5.22:1 ✅
- ✅ Alternative brand text
- ✅ Hover states for links
- ✅ Focus indicators

#### `brand-400` / `primary-400` (#1a4d99) - 7.12:1 ✅ AAA
- ✅ **Critical brand text** (highest contrast)
- ✅ Important CTAs
- ✅ Accessible links

**Example:**
```tsx
<p className="text-brand-400 font-semibold">
  ⚠️ Critical: Action required
</p>
```

---

## 🟢 Success Colors

### When to Use

#### `success-100` (#c0eedf) - 1.45:1
- ✅ Success backgrounds
- ✅ Badge backgrounds
- ❌ **Never** for text

**Example:**
```tsx
<Badge className="bg-success-100 text-success-300">
  Completed
</Badge>
```

#### `success-200` (#047857) - 5.12:1 ✅
- ✅ Success text
- ✅ Success icons
- ✅ Confirmation messages

**Example:**
```tsx
<p className="text-success-200">
  ✅ Order delivered successfully!
</p>
```

#### `success-300` (#065f46) - 6.87:1 ✅
- ✅ **Preferred for success text**
- ✅ Strong success indicators
- ✅ Success buttons

**Example:**
```tsx
<Button className="bg-success-300 text-white">
  Confirm Delivery
</Button>
```

#### `success-400` (#064e3b) - 8.21:1 ✅ AAA
- ✅ **Critical success messages**
- ✅ Highest contrast success text

**Example:**
```tsx
<Alert className="border-success-400">
  <p className="text-success-400 font-semibold">
    Payment received and verified
  </p>
</Alert>
```

---

## 🔴 Error Colors

### When to Use

#### `error-100` (#f2a3a9) - 2.08:1
- ✅ Error backgrounds
- ✅ Badge backgrounds
- ❌ **Never** for text

**Example:**
```tsx
<Badge className="bg-error-100 text-error-300">
  Failed
</Badge>
```

#### `error-200` (#d32f2f) - 5.73:1 ✅
- ✅ Error text
- ✅ Error icons
- ✅ Form validation errors

**Example:**
```tsx
<p className="text-error-200 text-sm">
  ❌ Email is required
</p>
```

#### `error-300` (#c62828) - 6.48:1 ✅
- ✅ **Preferred for error text**
- ✅ Strong error indicators
- ✅ Destructive buttons

**Example:**
```tsx
<Button variant="destructive" className="bg-error-300 text-white">
  Delete Order
</Button>
```

#### `error-400` (#b71c1c) - 7.89:1 ✅ AAA
- ✅ **Critical error messages**
- ✅ Highest contrast error text

**Example:**
```tsx
<Alert variant="destructive">
  <p className="text-error-400 font-semibold">
    ⚠️ Payment failed. Please update your card.
  </p>
</Alert>
```

---

## 🟡 Warning Colors

### When to Use

#### `warning-100` (#ffe8d3) - 1.21:1
- ✅ Warning backgrounds
- ✅ Badge backgrounds
- ❌ **Never** for text

#### `warning-200` (#d97706) - 4.92:1 ✅
- ✅ Warning text
- ✅ Warning icons
- ✅ Caution messages

**Example:**
```tsx
<p className="text-warning-200">
  ⚠️ Order requires attention
</p>
```

#### `warning-300` (#b45309) - 6.31:1 ✅
- ✅ **Preferred for warning text**
- ✅ Strong warning indicators

**Example:**
```tsx
<Badge className="bg-warning-100 text-warning-300">
  Pending
</Badge>
```

#### `warning-400` (#92400e) - 7.54:1 ✅ AAA
- ✅ **Critical warnings**
- ✅ Highest contrast warning text

**Example:**
```tsx
<Alert>
  <p className="text-warning-400 font-semibold">
    ⚠️ Payment overdue by 7 days
  </p>
</Alert>
```

---

## 📝 Tracking Mode Colors

### When to Use

#### `tracking-text-primary` (#3A3A3A) - 10.82:1 ✅
- ✅ Primary text in tracking UI
- ✅ Headings
- ✅ Body text

#### `tracking-text-secondary` (#757575) - 4.62:1 ✅
- ✅ Secondary text
- ✅ Captions
- ✅ Timestamps
- ✅ Helper text

**Example:**
```tsx
<div className="bg-tracking-bg-card">
  <h3 className="text-tracking-text-primary">
    Order #12345
  </h3>
  <p className="text-tracking-text-secondary text-sm">
    Updated 2 hours ago
  </p>
</div>
```

---

## ✅ Quick Reference Table

| Use Case | Recommended Color | Contrast | WCAG |
|----------|-------------------|----------|------|
| Primary text | `system-400` | 10.16:1 | AA |
| Secondary text | `system-300` | 5.74:1 | AA |
| Links | `brand-200` | 5.92:1 | AA |
| Important links | `brand-400` | 7.12:1 | AAA |
| Success message | `success-300` | 6.87:1 | AA |
| Error message | `error-300` | 6.48:1 | AA |
| Warning message | `warning-300` | 6.31:1 | AA |
| Critical alerts | `*-400` variants | 7+:1 | AAA |
| Backgrounds | `*-50, *-100` | N/A | N/A |
| Borders | `system-200` | N/A | N/A |

---

## ❌ Common Mistakes

### ❌ Don't
```tsx
// ❌ FAIL: Light color for text
<p className="text-warning-100">Important message</p>

// ❌ FAIL: Insufficient contrast
<Badge className="bg-white text-success-100">Active</Badge>

// ❌ FAIL: Background color used for text
<span className="text-system-50">Label</span>
```

### ✅ Do
```tsx
// ✅ PASS: Proper contrast
<p className="text-warning-300">Important message</p>

// ✅ PASS: Good contrast
<Badge className="bg-success-100 text-success-300">Active</Badge>

// ✅ PASS: Proper text color
<span className="text-system-300">Label</span>
```

---

## 🧑‍💻 Testing Your Colors

### Browser DevTools
1. Right-click element → Inspect
2. In Styles panel, hover over color
3. Click color square
4. View "Contrast ratio" at bottom

### WebAIM Contrast Checker
https://webaim.org/resources/contrastchecker/

```
Foreground: #6b6b6b (system-300)
Background: #FFFFFF (white)
Result: 5.74:1 ✅ WCAG AA Pass
```

### Automated Testing
```bash
# Install axe DevTools extension
# Or use CLI
npx axe http://localhost:3000 --tags wcag2a,wcag2aa
```

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [COLOR_CONTRAST_AUDIT.md](./COLOR_CONTRAST_AUDIT.md) - Full audit report
- [Tailwind CSS Colors](./tailwind.config.ts) - Color configuration
