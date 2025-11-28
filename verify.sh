#!/bin/bash

set -e

echo "🔍 TriplyDB Query Portal - Pre-Deployment Verification"
echo "======================================================"
echo ""

ERRORS=0
WARNINGS=0

# Function to print status
check_ok() {
    echo "✅ $1"
}

check_warning() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

check_error() {
    echo "❌ $1"
    ((ERRORS++))
}

# 1. Check configuration file
echo "1️⃣  Checking configuration..."
if [ ! -f "config.json" ]; then
    check_error "config.json not found"
else
    check_ok "config.json exists"
    
    # Check if config has been customized
    if grep -q "Your Organization Name" config.json; then
        check_warning "config.json contains template values - needs customization"
    else
        check_ok "config.json appears to be customized"
    fi
    
    # Validate JSON syntax
    if command -v jq &> /dev/null; then
        if jq empty config.json 2>/dev/null; then
            check_ok "config.json is valid JSON"
        else
            check_error "config.json has invalid JSON syntax"
        fi
    fi
fi
echo ""

# 2. Check TriplyDB endpoint
echo "2️⃣  Testing TriplyDB connection..."
if [ -f "config.json" ] && command -v jq &> /dev/null && command -v curl &> /dev/null; then
    ENDPOINT=$(jq -r '.triplydb.endpoint' config.json)
    
    if [ "$ENDPOINT" != "null" ] && [ -n "$ENDPOINT" ]; then
        # Simple connectivity test
        TEST_QUERY="SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201"
        if curl -sf -o /dev/null "${ENDPOINT}?query=${TEST_QUERY}"; then
            check_ok "TriplyDB endpoint is accessible: $ENDPOINT"
        else
            check_error "Cannot connect to TriplyDB endpoint: $ENDPOINT"
        fi
    else
        check_warning "TriplyDB endpoint not configured"
    fi
else
    check_warning "Skipping endpoint test (missing jq or curl)"
fi
echo ""

# 3. Check queries
echo "3️⃣  Validating queries..."
if [ -f "config.json" ] && command -v jq &> /dev/null; then
    QUERY_COUNT=$(jq '.queries | length' config.json)
    
    if [ "$QUERY_COUNT" -gt 0 ]; then
        check_ok "Found $QUERY_COUNT queries configured"
        
        # Check each query has required fields
        for i in $(seq 0 $((QUERY_COUNT - 1))); do
            QUERY_ID=$(jq -r ".queries[$i].id" config.json)
            QUERY_NAME=$(jq -r ".queries[$i].name" config.json)
            QUERY_SPARQL=$(jq -r ".queries[$i].sparql" config.json)
            
            if [ "$QUERY_ID" != "null" ] && [ "$QUERY_NAME" != "null" ] && [ "$QUERY_SPARQL" != "null" ]; then
                check_ok "Query '$QUERY_NAME' is properly configured"
            else
                check_error "Query at index $i is missing required fields"
            fi
        done
    else
        check_warning "No queries configured"
    fi
else
    check_warning "Skipping query validation (missing jq)"
fi
echo ""

# 4. Check assets
echo "4️⃣  Checking assets..."
if [ -d "assets" ]; then
    check_ok "assets/ directory exists"
    
    # Check for logo
    if [ -f "assets/logo.png" ] || [ -f "assets/logo.png" ]; then
        check_ok "Logo file found"
    else
        check_warning "No logo file found in assets/ (logo.png or logo.png)"
    fi
else
    check_warning "assets/ directory not found"
fi
echo ""

# 5. Check source files
echo "5️⃣  Checking source files..."
REQUIRED_FILES=(
    "index.html"
    "style.css"
    "main.js"
    "package.json"
    "vite.config.js"
    "modules/sparql-client.js"
    "modules/download-manager.js"
    "modules/results-renderer.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_ok "$file exists"
    else
        check_error "$file is missing"
    fi
done
echo ""

# 6. Check dependencies
echo "6️⃣  Checking dependencies..."
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        check_ok "node_modules/ directory exists"
    else
        check_warning "node_modules/ not found - run 'npm install'"
    fi
    
    # Check if npm is available
    if command -v npm &> /dev/null; then
        check_ok "npm is available: $(npm --version)"
    else
        check_error "npm is not installed"
    fi
fi
echo ""

# 7. Check GitHub Actions workflow
echo "7️⃣  Checking deployment configuration..."
if [ -f ".github/workflows/azure-static-web-apps.yml" ]; then
    check_ok "GitHub Actions workflow exists"
else
    check_warning "GitHub Actions workflow not found"
fi

if [ -f "staticwebapp.config.json" ]; then
    check_ok "Azure Static Web Apps config exists"
else
    check_warning "staticwebapp.config.json not found"
fi
echo ""

# 8. Build test
echo "8️⃣  Testing build process..."
if command -v npm &> /dev/null && [ -d "node_modules" ]; then
    echo "   Running build..."
    if npm run build > /dev/null 2>&1; then
        check_ok "Build completed successfully"
        
        if [ -d "dist" ]; then
            check_ok "dist/ directory created"
            
            # Check dist contents
            if [ -f "dist/index.html" ]; then
                check_ok "dist/index.html generated"
            else
                check_error "dist/index.html not found"
            fi
        else
            check_error "dist/ directory not created"
        fi
    else
        check_error "Build failed"
    fi
else
    check_warning "Skipping build test (npm or node_modules not available)"
fi
echo ""

# Summary
echo "======================================================"
echo "📊 Verification Summary"
echo "======================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Your portal is ready for deployment."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Passed with $WARNINGS warning(s)."
    echo "    Review warnings above before deploying."
    exit 0
else
    echo "❌ Found $ERRORS error(s) and $WARNINGS warning(s)."
    echo "    Please fix errors before deploying."
    exit 1
fi
