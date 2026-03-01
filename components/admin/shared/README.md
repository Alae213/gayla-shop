# Shared Admin Components

**Reusable utility components used across admin features.**

This folder contains shared components that are used by multiple admin modules (build, orders, tracking, etc.).

---

## 📋 Component Catalog

| Component | Purpose | Used By |
|-----------|---------|----------|
| **DeleteProductDialog** | Confirm product deletion | Build mode, products |
| **ImageCropDialog** | Crop uploaded images | Hero editor, products |
| **UnsavedChangesDialog** | Warn before exit with unsaved changes | Build mode, order editor |
| **AddProductModal** | Quick product search/add | Build mode, orders |
| **DeliverySettingsModal** | Configure delivery pricing | Settings, orders |
| **InlineEditText** | Click-to-edit text fields | Hero editor, various |
| **VariantGroupEditor** | Edit product variants (size/color) | Product drawer |
| **WorkspaceSkeleton** | Loading placeholder | All admin pages |

---

## 📦 Installation & Usage

### Delete Confirmation

```tsx
import { DeleteProductDialog } from '@/components/admin/shared';
import { useState } from 'react';

function ProductActions({ product }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteProduct = useMutation(api.products.delete);

  return (
    <>
      <Button 
        variant="destructive"
        onClick={() => setIsDeleteOpen(true)}
      >
        Delete Product
      </Button>

      <DeleteProductDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        productName={product.name}
        onConfirm={async () => {
          await deleteProduct({ id: product._id });
        }}
      />
    </>
  );
}
```

### Image Cropping

```tsx
import { ImageCropDialog } from '@/components/admin/shared';

function ImageUploader() {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  return (
    <>
      <input 
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setImageToCrop(url);
          }
        }}
      />

      <ImageCropDialog
        isOpen={!!imageToCrop}
        imageUrl={imageToCrop!}
        onClose={() => setImageToCrop(null)}
        onCrop={async (croppedBlob) => {
          await uploadImage(croppedBlob);
        }}
        aspectRatio={16 / 9}
      />
    </>
  );
}
```

### Inline Editing

```tsx
import { InlineEditText } from '@/components/admin/shared';

function EditableHeading({ title, onSave }) {
  return (
    <InlineEditText
      value={title}
      onSave={onSave}
      placeholder="Enter title..."
      className="text-4xl font-bold"
    />
  );
}
```

### Unsaved Changes Protection

```tsx
import { UnsavedChangesDialog } from '@/components/admin/shared';
import { useRouter } from 'next/navigation';

function Editor() {
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (hasUnsaved) {
      setPendingNavigation(path);
      setShowWarning(true);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      {/* Your editor UI */}
      
      <UnsavedChangesDialog
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onDiscard={() => {
          if (pendingNavigation) {
            router.push(pendingNavigation);
          }
        }}
        onSave={async () => {
          await saveChanges();
          if (pendingNavigation) {
            router.push(pendingNavigation);
          }
        }}
      />
    </>
  );
}
```

### Loading State

```tsx
import { WorkspaceSkeleton } from '@/components/admin/shared';

function AdminPage() {
  const { data, isLoading } = useQuery(api.products.list);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  return <div>{/* Your content */}</div>;
}
```

---

## 🏛️ Design Patterns

### Dialog/Modal Pattern

All dialogs follow this structure:

```tsx
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  // ... specific props
}

export function ExampleDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  ...props 
}: DialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Dialog content */}
    </Dialog>
  );
}
```

### Editor Pattern

Editable components follow this pattern:

```tsx
interface EditorProps<T> {
  value: T;
  onSave: (value: T) => void | Promise<void>;
  onCancel?: () => void;
}

export function ExampleEditor<T>({ value, onSave, onCancel }: EditorProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Render logic...
}
```

---

## 🔄 When to Use

### Use Shared Components When:
- ✅ Same UI pattern used in 2+ places
- ✅ Logic is reusable across domains
- ✅ No domain-specific business logic

### Create Domain-Specific Components When:
- ❌ Tightly coupled to one feature
- ❌ Has domain-specific validation
- ❌ Only used once

---

## 🛠️ Development

### Adding a New Shared Component

1. Create component file in `/admin/shared/`
2. Add to `index.ts` export
3. Update this README
4. Add usage examples
5. Write tests

### Component Checklist

- [ ] TypeScript interfaces exported
- [ ] Loading states handled
- [ ] Error handling with toasts
- [ ] Keyboard shortcuts (ESC to close)
- [ ] Focus management (trap focus in modals)
- [ ] ARIA labels for accessibility
- [ ] Responsive design
- [ ] Dark mode support (if applicable)

### Testing

```bash
# Unit tests
npm test -- components/admin/shared

# Visual testing
npm run storybook
```

---

## 📌 Related

- [`/components/shared`](../../shared/README.md) - App-level shared components
- [`/components/ui`](../../ui/README.md) - Design system primitives
- [`/admin/build`](../build/README.md) - Build mode
- [`/admin/orders`](../orders/README.md) - Orders

---

## 📝 Notes

- Components are **admin-scoped** (not used in public facing pages)
- All use **shadcn/ui** primitives underneath
- Follow **server/client** component patterns (marked with 'use client')
- **Optimistic updates** for better UX

**Last updated:** March 2026
