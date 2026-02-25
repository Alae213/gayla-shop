#!/bin/bash

################################################################################
# QA Test Runner Script
# 
# Automates QA testing for Sprint 1 optimizations:
# - Builds production bundle
# - Runs Lighthouse audits
# - Checks bundle size
# - Verifies no errors
# - Generates report
################################################################################

set -e  # Exit on error

echo ""
echo "🧪 ================================="
echo "🧪    QA Test Runner - Sprint 1"
echo "🧪 ================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
test_result() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

################################################################################
# 1. Build Production Bundle
################################################################################

echo "🔨 Step 1: Building production bundle..."
echo ""

if npm run build > build.log 2>&1; then
  test_result 0 "Production build successful"
else
  test_result 1 "Production build failed"
  echo "See build.log for details"
  exit 1
fi

echo ""

################################################################################
# 2. Check Bundle Size
################################################################################

echo "📊 Step 2: Checking bundle size..."
echo ""

# Check if .next exists
if [ ! -d ".next" ]; then
  test_result 1 "Build output not found"
  exit 1
fi

test_result 0 "Build output exists"

# Calculate total bundle size
if command -v du &> /dev/null; then
  BUNDLE_SIZE=$(du -sk .next/static/chunks | cut -f1)
  BUNDLE_SIZE_MB=$(echo "scale=2; $BUNDLE_SIZE / 1024" | bc)
  
  echo "Total bundle size: ${BUNDLE_SIZE_MB} MB"
  
  # Check if under 500KB (512 KB = 0.5 MB)
  if (( $(echo "$BUNDLE_SIZE_MB < 0.5" | bc -l) )); then
    test_result 0 "Bundle size < 500 KB target"
  else
    test_result 1 "Bundle size exceeds 500 KB target (${BUNDLE_SIZE_MB} MB)"
  fi
else
  echo -e "${YELLOW}⚠️  du command not found, skipping bundle size check${NC}"
fi

echo ""

################################################################################
# 3. Check for Console Errors in Build
################################################################################

echo "🔍 Step 3: Checking for build errors..."
echo ""

if grep -i "error" build.log > /dev/null; then
  test_result 1 "Build contains errors"
  grep -i "error" build.log | head -5
else
  test_result 0 "No build errors found"
fi

if grep -i "warning" build.log > /dev/null; then
  WARNING_COUNT=$(grep -i "warning" build.log | wc -l)
  echo -e "${YELLOW}⚠️  Found $WARNING_COUNT warnings${NC}"
else
  test_result 0 "No build warnings found"
fi

echo ""

################################################################################
# 4. Verify Key Files Exist
################################################################################

echo "📝 Step 4: Verifying optimizations applied..."
echo ""

# Check if optimization files exist
FILES=(
  "lib/lazy-imports.ts"
  "lib/fonts.ts"
  "styles/safari-fixes.css"
  "lib/utils/safe-date-format.ts"
  "components/admin/workspace-skeleton.tsx"
  "sentry.client.config.ts"
  "sentry.server.config.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    test_result 0 "File exists: $file"
  else
    test_result 1 "Missing file: $file"
  fi
done

echo ""

################################################################################
# 5. Start Server and Run Lighthouse (Optional)
################################################################################

echo "💡 Step 5: Lighthouse audit (optional)..."
echo ""
echo "To run Lighthouse audit:"
echo "  1. npm start"
echo "  2. npx lighthouse http://localhost:3000 --view"
echo ""
echo -e "${YELLOW}Skipping automated Lighthouse (requires server running)${NC}"
echo ""

################################################################################
# 6. Generate Report
################################################################################

echo ""
echo "====================================="
echo "         TEST RESULTS SUMMARY"
echo "====================================="
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
else
  echo "Failed:       $FAILED_TESTS"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Run: npm start"
  echo "  2. Test manually with QA_CHECKLIST.md"
  echo "  3. Run Lighthouse audit"
  echo "  4. Deploy to staging"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "Please fix the issues and run again."
  exit 1
fi
