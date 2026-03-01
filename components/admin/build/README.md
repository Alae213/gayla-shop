# Build Mode Components

**Visual page builder interface for editing the storefront.**

This folder contains components for the Build Mode - a live editing interface that allows admins to customize the hero section, manage product displays, and reorder items via drag-and-drop.

---

## 📋 Component Catalog

### Hero Section (`/hero`)

Components for editing the hero banner at the top of the storefront.

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| **HeroEditor** | Main hero section editor | • Inline text editing<br>• Image upload/cropping<br>• Real-time preview |
| **ImageCropDialog** | Image cropping modal | • Aspect ratio controls<br>• Zoom/pan<br>• Preview |
| **InlineEditText** | Editable text fields | • Click-to-edit<br>• Auto-save<br>• Validation |
| **UnsavedChangesDialog** | Exit confirmation | • Prevent data loss<br>• Save/discard options |

### Products (`/products`)

Components for managing product displays and layout.

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| **ProductGrid** | Static product gallery | • Responsive grid<br>• Product cards<br>• Quick actions |
| **DndProductGrid** | Drag-and-drop reordering | • Drag handles<br>• Live preview<br>• Persist order |
| **ProductDrawer** | Product edit side panel | • Full product form<br>• Image gallery<br>• Variant editor |
| **ProductModal** | Quick add product | • Search existing<br>• Fast creation<br>• Minimal fields |
| **StatsCards** | Dashboard metrics | • Product count<br>• Sales stats<br>• Trend indicators |

### Navigation

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| **BuildModeNav** | Build mode tabs | • Hero/Products tabs<br>• Save status<br>• Exit button |

---

## 📦 Installation & Usage

### Basic Example

```tsx
import { HeroEditor, DndProductGrid, BuildModeNav } from '@/components/admin/build';

export function BuildModePage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'products'>('hero');

  return (
    <div>
      <BuildModeNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'hero' && (
        <HeroEditor onSave={handleHeroSave} />
      )}
      
      {activeTab === 'products' && (
        <DndProductGrid products={products} onReorder={handleReorder} />
      )}
    </div>
  );
}
```

### Hero Section Editing

```tsx
import { HeroEditor, InlineEditText } from '@/components/admin/build';

function HeroSection() {
  return (
    <HeroEditor
      title="Welcome to Our Store"
      subtitle="Best products at great prices"
      imageUrl="/hero-bg.jpg"
      onSave={async (data) => {
        await updateHero(data);
      }}
    />
  );
}
```

### Product Management

```tsx
import { 
  DndProductGrid, 
  ProductDrawer, 
  ProductModal 
} from '@/components/admin/build';

function ProductsEditor() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddModalOpen(true)}>
        Add Product
      </Button>

      <DndProductGrid 
        products={products}
        onProductClick={setSelectedProduct}
        onReorder={handleReorder}
      />

      <ProductDrawer 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
```

---

## 🏛️ Architecture

### Data Flow

```
[BuildModePage]
      │
      ├── [BuildModeNav] ←─ Tab state
      │
      ├── [HeroEditor]
      │      ├── [InlineEditText]
      │      ├── [ImageCropDialog]
      │      └── [UnsavedChangesDialog]
      │
      └── [DndProductGrid]
             ├── [ProductDrawer]
             └── [ProductModal]
```

### State Management

- **Hero data:** Managed by `HeroEditor` component
- **Product list:** Passed as props to grids
- **Product order:** Persisted via `onReorder` callback
- **Active product:** Lifted to parent for drawer control

### Persistence

All components use **optimistic updates** with rollback on failure:

```tsx
// Example pattern used throughout
const handleSave = async (data) => {
  const prev = current; // Store previous state
  setCurrent(data);     // Update UI immediately
  
  try {
    await api.update(data);
  } catch (e) {
    setCurrent(prev);   // Rollback on error
    toast.error('Failed to save');
  }
};
```

---

## 🔄 Feature Matrix

| Feature | Hero | Products |
|---------|------|----------|
| Live editing | ✅ | ✅ |
| Auto-save | ✅ | ❌ |
| Image upload | ✅ | ✅ |
| Drag-and-drop | ❌ | ✅ |
| Variants | ❌ | ✅ |
| Unsaved warning | ✅ | ✅ |
| Undo/Redo | ❌ | ❌ |

---

## 🛠️ Development

### Adding a New Component

1. Create component file in appropriate subfolder
2. Export from subfolder's `index.ts`
3. Export from main `/build/index.ts`
4. Update this README

### Testing

```bash
# Run component tests
npm test -- components/admin/build

# Visual testing with Storybook (if configured)
npm run storybook
```

### Common Patterns

**Editing State:**
```tsx
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState(initialData);
```

**Unsaved Changes:**
```tsx
const hasUnsavedChanges = !isEqual(formData, savedData);

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

---

## 📌 Related

- [`/admin/shared`](../shared/README.md) - Shared admin utilities
- [`/admin/orders`](../orders/README.md) - Order management
- [`/public`](../../public/README.md) - Customer-facing components

---

## 📝 Notes

- Build mode is **admin-only** - requires authentication
- Changes are **not versioned** - no undo history (yet)
- Images are **optimized** on upload (WebP, compressed)
- Product order is **stored in database** (not client-side)

**Last updated:** March 2026
