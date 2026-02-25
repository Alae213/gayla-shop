#!/bin/bash

# Fix lucide-react icon imports
# X -> XIcon
# XCircle -> CircleX

echo "🔧 Fixing lucide-react icon imports..."

# List of files to fix
FILES=(
  "components/ui/dialog.tsx"
  "components/ui/sheet.tsx"
  "components/layout/header.tsx"
  "components/admin/inline-edit-text.tsx"
  "components/admin/hero-editor.tsx"
  "components/admin/product-drawer.tsx"
  "components/admin/variant-group-editor.tsx"
  "components/admin/tracking/ui/tracking-panel.tsx"
  "components/admin/tracking/ui/order-line-items-editor.tsx"
  "components/admin/tracking/ui/status-pill.tsx"
  "components/admin/tracking/views/tracking-bulk-action-bar.tsx"
  "components/admin/tracking/views/tracking-order-details.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing $file..."
    
    # Replace X with XIcon (but not XCircle)
    sed -i 's/\bX,/XIcon,/g' "$file"
    sed -i 's/\bX }/XIcon }/g' "$file"
    sed -i 's/{ X }/{ XIcon }/g' "$file"
    sed -i 's/<X /<XIcon /g' "$file"
    
    # Replace XCircle with CircleX
    sed -i 's/\bXCircle\b/CircleX/g' "$file"
    
    echo "  ✅ Fixed $file"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo "✅ All icon imports fixed!"
echo ""
echo "Now run: npm run build"
