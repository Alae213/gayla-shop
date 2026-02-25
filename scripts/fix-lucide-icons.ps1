# Fix lucide-react icon imports for Windows
# X -> XIcon
# XCircle -> CircleX

Write-Host "🔧 Fixing lucide-react icon imports..." -ForegroundColor Yellow

$files = @(
    "components/ui/dialog.tsx",
    "components/ui/sheet.tsx",
    "components/layout/header.tsx",
    "components/admin/inline-edit-text.tsx",
    "components/admin/hero-editor.tsx",
    "components/admin/product-drawer.tsx",
    "components/admin/variant-group-editor.tsx",
    "components/admin/tracking/ui/tracking-panel.tsx",
    "components/admin/tracking/ui/order-line-items-editor.tsx",
    "components/admin/tracking/ui/status-pill.tsx",
    "components/admin/tracking/views/tracking-bulk-action-bar.tsx",
    "components/admin/tracking/views/tracking-order-details.tsx"
)

$fixedCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  Fixing $file..." -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        
        # Replace X with XIcon (careful not to replace XCircle)
        $content = $content -replace '\bX,', 'XIcon,'
        $content = $content -replace '\bX }', 'XIcon }'
        $content = $content -replace '{ X }', '{ XIcon }'
        $content = $content -replace '<X ', '<XIcon '
        
        # Replace XCircle with CircleX
        $content = $content -replace '\bXCircle\b', 'CircleX'
        
        Set-Content -Path $file -Value $content -NoNewline
        
        Write-Host "  ✅ Fixed $file" -ForegroundColor Green
        $fixedCount++
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Fixed $fixedCount files!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npm run build" -ForegroundColor Yellow
