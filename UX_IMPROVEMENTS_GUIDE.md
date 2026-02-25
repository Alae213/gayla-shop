# 🎨 UX Improvements Guide

**Project:** Gayla Shop  
**Goal:** Better user experience through clear feedback and confirmations  
**Date:** February 25, 2026  

---

## 🎯 Overview

This guide covers UX improvements for:
- User-friendly error messages
- Confirmation dialogs
- Loading states
- Success feedback
- Accessibility

---

## ✍️ User-Friendly Error Messages

### Error Formatter Usage

**Basic Usage:**
```typescript
import { formatError } from '@/lib/utils/error-formatter';
import { toast } from 'sonner';

try {
  await createOrder(data);
  toast.success('Order created successfully!');
} catch (error) {
  const formatted = formatError(error, 'create order');
  
  toast.error(formatted.message, {
    action: formatted.retryable ? {
      label: 'Try Again',
      onClick: () => retry(),
    } : undefined,
  });
}
```

**With Context:**
```typescript
import { getErrorMessage, contextErrorMessages } from '@/lib/utils/error-formatter';

// Instead of:
try {
  await deleteProduct(id);
} catch (error) {
  toast.error(error.message); // ❌ Technical error
}

// Do this:
try {
  await deleteProduct(id);
} catch (error) {
  const message = getErrorMessage(error, contextErrorMessages.deleteProduct);
  toast.error(message); // ✅ "Unable to delete product. Please try again."
}
```

### Validation Errors

**Single Field:**
```typescript
import { formatValidationError } from '@/lib/utils/error-formatter';

const emailError = formatValidationError('email', 'email');
// "Please enter a valid email address"

const phoneError = formatValidationError('phoneNumber', 'phone');
// "Please enter a valid phone number"

const minError = formatValidationError('password', 'min', 8);
// "Password must be at least 8 characters"
```

**Multiple Fields:**
```typescript
import { formatValidationErrors } from '@/lib/utils/error-formatter';

const errors = {
  email: 'Invalid email',
  phone: 'Invalid phone number',
  password: ['Too short', 'Must contain number'],
};

const messages = formatValidationErrors(errors);
// ['Invalid email', 'Invalid phone number', 'Too short', 'Must contain number']

// Display all errors
messages.forEach(msg => toast.error(msg));
```

---

## ✅ Confirmation Dialogs

### Basic Confirmation

```typescript
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useState } from 'react';

function DeleteButton({ orderId }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'delete order'));
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Order
      </button>

      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Order?"
        message="Are you sure you want to delete this order? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
```

### With Impact Preview

```typescript
<ConfirmationDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Product?"
  message="This will permanently delete the product and all related data."
  impact={[
    'Remove product from catalog',
    'Cancel all pending orders',
    'Delete 12 product images',
    'Remove from 3 collections',
  ]}
  variant="danger"
  confirmText="Delete Product"
/>
```

### Using the Hook

```typescript
import { useConfirmation, ConfirmationDialog } from '@/components/confirmation-dialog';

function MyComponent() {
  const confirmation = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Item?',
      message: 'This action cannot be undone.',
      impact: ['Remove from database', 'Notify users'],
      variant: 'danger',
    });

    if (confirmed) {
      await deleteItem();
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      
      <ConfirmationDialog
        {...confirmation}
        onClose={confirmation.close}
      />
    </>
  );
}
```

---

## ⏳ Loading States

### Button Loading State

```typescript
function SaveButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveData();
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'save'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className="relative"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner />
          Saving...
        </span>
      ) : (
        'Save'
      )}
    </button>
  );
}
```

### Page Loading State

```typescript
import { Suspense } from 'react';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-system-200 rounded w-1/3"></div>
      <div className="h-64 bg-system-200 rounded"></div>
    </div>
  );
}

function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DataComponent />
    </Suspense>
  );
}
```

---

## ✅ Success Feedback

### Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Order created successfully!');

// Error
toast.error('Failed to create order');

// Warning
toast.warning('This action will affect 5 items');

// Info
toast.info('New updates available');

// With action
toast.success('Order deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreOrder(),
  },
});

// With duration
toast.success('Saved!', {
  duration: 2000, // 2 seconds
});
```

### Inline Success Messages

```typescript
function Form() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    await saveData();
    setSaved(true);
    
    // Hide after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {saved && (
        <div 
          role="status" 
          aria-live="polite"
          className="text-success-300 flex items-center gap-2"
        >
          <CheckIcon />
          Changes saved successfully
        </div>
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 👍 Best Practices

### 1. Always Provide Feedback

**❌ Bad:**
```typescript
function handleDelete() {
  deleteItem();
  // User doesn't know if it worked
}
```

**✅ Good:**
```typescript
async function handleDelete() {
  try {
    await deleteItem();
    toast.success('Item deleted successfully');
  } catch (error) {
    toast.error(getErrorMessage(error, 'delete item'));
  }
}
```

### 2. Show Progress for Long Operations

```typescript
function UploadButton() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);
      },
    });

    toast.success('File uploaded!');
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-system-200 rounded-full h-2">
          <div 
            className="bg-primary-300 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}
```

### 3. Confirm Destructive Actions

**Always confirm:**
- Delete operations
- Bulk updates
- Irreversible changes
- Actions affecting multiple items

**Optional confirmation:**
- Save operations
- Create operations
- Navigation (if unsaved changes)

### 4. Disable Actions Appropriately

```typescript
// Disable when offline
const { isOnline } = useOnlineStatus();

<button disabled={!isOnline}>
  {!isOnline ? 'Offline - Cannot Save' : 'Save'}
</button>

// Disable during loading
<button disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Disable with validation
<button disabled={!isValid}>
  Submit
</button>
```

### 5. Use ARIA Live Regions

```typescript
// For dynamic updates
<div role="status" aria-live="polite">
  {itemCount} items in cart
</div>

// For errors
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// For loading
<div role="status" aria-live="polite" aria-busy="true">
  Loading...
</div>
```

---

## ⌨️ Keyboard Shortcuts

### Common Shortcuts

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Escape to cancel/close
    if (e.key === 'Escape') {
      handleCancel();
    }
    
    // Enter to confirm
    if (e.key === 'Enter' && isConfirmDialog) {
      e.preventDefault();
      handleConfirm();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Show Keyboard Hints

```typescript
<button>
  Save <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-system-100 rounded">
    ⌘S
  </kbd>
</button>

<p className="text-xs text-system-300">
  Press <kbd>Enter</kbd> to confirm or <kbd>Esc</kbd> to cancel
</p>
```

---

## ✅ Testing Checklist

### Error Messages
- [ ] Technical errors converted to user-friendly
- [ ] Context provided (what failed)
- [ ] Action suggested (what to do)
- [ ] No jargon or stack traces
- [ ] Validation errors clear

### Confirmations
- [ ] Shown for destructive actions
- [ ] Impact preview displayed
- [ ] Keyboard shortcuts work (Enter/Escape)
- [ ] Cancel button present
- [ ] Loading state during confirm
- [ ] Focus trapped in dialog

### Loading States
- [ ] Buttons disabled when loading
- [ ] Loading indicator visible
- [ ] Progress shown for long operations
- [ ] User can cancel if appropriate

### Feedback
- [ ] Success messages shown
- [ ] Error messages actionable
- [ ] ARIA live regions used
- [ ] Toast notifications appropriate
- [ ] Inline feedback where needed

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color not only indicator

---

## 📚 References

- [Error Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [Confirmation Dialog Best Practices](https://www.nngroup.com/articles/confirmation-dialog/)
- [Loading State Patterns](https://www.nngroup.com/articles/progress-indicators/)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
