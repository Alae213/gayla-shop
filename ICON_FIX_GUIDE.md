# 🔧 Icon Fix Guide - lucide-react Compatibility

**Issue:** lucide-react changed icon exports in recent versions  
**Fix:** Replace `X` with `XIcon` and `XCircle` with `CircleX`

---

## ✅ Already Fixed

- `components/ui/dialog.tsx` ✅
- `components/ui/sheet.tsx` ✅
- `components/admin/tracking/ui/status-pill.tsx` ✅

---

## 🔴 Files Still Need Fixing

### 1. `components/layout/header.tsx`

**Find:**
```typescript
import { ShoppingBag, ShoppingCart, Menu, X } from "lucide-react";
```

**Replace with:**
```typescript
import { ShoppingBag, ShoppingCart, Menu, XIcon } from "lucide-react";
```

**Find:**
```typescript
<X className="h-6 w-6" />
```

**Replace with:**
```typescript
<XIcon className="h-6 w-6" />
```

---

### 2. `components/admin/inline-edit-text.tsx`

**Find:**
```typescript
import { Check, X, Edit2, Loader2 } from "lucide-react";
```

**Replace with:**
```typescript
import { Check, XIcon, Edit2, Loader2 } from "lucide-react";
```

**Find all instances of:**
```typescript
<X
```

**Replace with:**
```typescript
<XIcon
```

---

### 3. `components/admin/hero-editor.tsx`

**Find:**
```typescript
import { Upload, X, Loader2, Save } from "lucide-react";
```

**Replace with:**
```typescript
import { Upload, XIcon, Loader2, Save } from "lucide-react";
```

**Find:**
```typescript
<X className="h-4 w-4" />
```

**Replace with:**
```typescript
<XIcon className="h-4 w-4" />
```

---

### 4. `components/admin/product-drawer.tsx`

**Find:**
```typescript
import {
  X, Plus, ImageIcon, Loader2, Save,
  Bold, Italic, List,
} from "lucide-react";
```

**Replace with:**
```typescript
import {
  XIcon, Plus, ImageIcon, Loader2, Save,
  Bold, Italic, List,
} from "lucide-react";
```

**Find all instances of:**
```typescript
<X
```

**Replace with:**
```typescript
<XIcon
```

---

### 5. `components/admin/variant-group-editor.tsx`

**Find:**
```typescript
import {
  GripVertical,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
```

**Replace with:**
```typescript
import {
  GripVertical,
  Plus,
  XIcon,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
```

**Find all:**
```typescript
<X
```

**Replace with:**
```typescript
<XIcon
```

---

### 6. `components/admin/tracking/ui/tracking-panel.tsx`

**Find:**
```typescript
import { X } from "lucide-react";
```

**Replace with:**
```typescript
import { XIcon } from "lucide-react";
```

**Find:**
```typescript
<X className="h-4 w-4" />
```

**Replace with:**
```typescript
<XIcon className="h-4 w-4" />
```

---

### 7. `components/admin/tracking/ui/order-line-items-editor.tsx`

**Find:**
```typescript
import { Plus, Save, X, Loader2 } from "lucide-react";
```

**Replace with:**
```typescript
import { Plus, Save, XIcon, Loader2 } from "lucide-react";
```

**Find all:**
```typescript
<X
```

**Replace with:**
```typescript
<XIcon
```

---

### 8. `components/admin/tracking/views/tracking-bulk-action-bar.tsx`

**Find:**
```typescript
import { X, CheckCircle2, Package, Printer, Trash2, ShieldOff } from "lucide-react";
```

**Replace with:**
```typescript
import { XIcon, CheckCircle2, Package, Printer, Trash2, ShieldOff } from "lucide-react";
```

**Find:**
```typescript
<X className="h-4 w-4" />
```

**Replace with:**
```typescript
<XIcon className="h-4 w-4" />
```

---

### 9. `components/admin/tracking/views/tracking-order-details.tsx`

**Find:**
```typescript
import {
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  ArrowRight,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Clock,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  ShieldOff,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
```

**Replace with:**
```typescript
import {
  Phone,
  MapPin,
  Edit2,
  Check,
  XIcon,
  ArrowRight,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Clock,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  ShieldOff,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
```

**Find all instances of:**
```typescript
<X
```

**Replace with:**
```typescript
<XIcon
```

---

## 💡 Quick Fix with VS Code

### Method 1: Find & Replace in Files

1. Press `Ctrl+Shift+H` (Windows) or `Cmd+Shift+H` (Mac)
2. **Find:** `import { ([^}]*), X,` 
3. **Replace:** `import { $1, XIcon,`
4. Enable regex mode (.*)
5. Click "Replace All"

### Method 2: Find & Replace in Files (JSX)

1. Press `Ctrl+Shift+H`
2. **Find:** `<X className`
3. **Replace:** `<XIcon className`
4. Click "Replace All"

### Method 3: Multi-cursor editing

1. Select `X` in an import
2. Press `Ctrl+D` to select next occurrence
3. Keep pressing to select all
4. Type `XIcon` to replace all

---

## ⚡ Automated Fix Script

### PowerShell (Windows)

```powershell
# Run from project root
.\scripts\fix-lucide-icons.ps1
```

### Bash (Linux/Mac)

```bash
# Run from project root
chmod +x scripts/fix-lucide-icons.sh
./scripts/fix-lucide-icons.sh
```

---

## ✅ Verification

After fixing, search your project for remaining issues:

```bash
# Search for remaining X imports (should find 0)
grep -r "import.*{ X }\|import.*{ X,\|,X }" components/

# Search for XCircle (should find 0)
grep -r "XCircle" components/
```

---

## 📝 Summary of Changes

| Old Icon | New Icon | Reason |
|----------|----------|--------|
| `X` | `XIcon` | Avoid conflict with variable name X |
| `XCircle` | `CircleX` | Consistent naming convention |

---

## 🚀 After Fixing

1. Save all files
2. Run build:
   ```bash
   npm run build
   ```
3. Should see:
   ```
   ✓ Creating an optimized production build
   ✓ Compiled successfully
   ```

---

**Last Updated:** February 25, 2026  
**Status:** 3/12 files fixed, 9 remaining
