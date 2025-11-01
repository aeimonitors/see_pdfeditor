#!/bin/bash
# Security Check Script
# This script checks for common security issues in the project

echo "========================================="
echo "Security Check Script"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check for secrets in code
echo "1. Checking for secrets in code..."
if grep -r "password\|secret\|api_key\|private_key" --include="*.js" --include="*.html" --include="*.md" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "SECURITY.md" | grep -v "package.json" | head -5; then
    check_warn "Potential secrets found (verify these are not real secrets)"
else
    check_pass "No obvious secrets found in code"
fi

# 2. Check .gitignore
echo ""
echo "2. Checking .gitignore..."
if grep -q "node_modules" .gitignore 2>/dev/null; then
    check_pass "node_modules in .gitignore"
else
    check_fail "node_modules NOT in .gitignore"
fi

if grep -q "\.env" .gitignore 2>/dev/null; then
    check_pass ".env in .gitignore"
else
    check_fail ".env NOT in .gitignore"
fi

# 3. Check for CSP
echo ""
echo "3. Checking Content Security Policy..."
if grep -q "Content-Security-Policy" prototype/index.html 2>/dev/null; then
    check_pass "CSP found in index.html"
else
    check_fail "CSP NOT found in index.html"
fi

if grep -q "Content-Security-Policy" netlify.toml 2>/dev/null; then
    check_pass "CSP found in netlify.toml"
else
    check_warn "CSP NOT found in netlify.toml"
fi

# 4. Check security headers
echo ""
echo "4. Checking security headers..."
if grep -q "X-Frame-Options" netlify.toml 2>/dev/null; then
    check_pass "X-Frame-Options in netlify.toml"
else
    check_fail "X-Frame-Options NOT in netlify.toml"
fi

if grep -q "X-Content-Type-Options" netlify.toml 2>/dev/null; then
    check_pass "X-Content-Type-Options in netlify.toml"
else
    check_fail "X-Content-Type-Options NOT in netlify.toml"
fi

# 5. Check HTTPS usage
echo ""
echo "5. Checking HTTPS usage..."
if grep -r "http://" --include="*.html" --include="*.js" prototype/ 2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1"; then
    check_warn "Found HTTP URLs (should be HTTPS for production)"
else
    check_pass "All external URLs use HTTPS"
fi

# 6. Check dependencies for vulnerabilities
echo ""
echo "6. Checking dependencies..."
if command -v npm &> /dev/null; then
    echo "Running npm audit..."
    npm audit --audit-level=high 2>/dev/null | grep -q "found 0 vulnerabilities" && \
        check_pass "No high-severity vulnerabilities found" || \
        check_warn "Potential vulnerabilities found (run 'npm audit' for details)"
else
    check_warn "npm not available, skipping dependency check"
fi

# 7. Check for sensitive files
echo ""
echo "7. Checking for sensitive files..."
if [ -f ".env" ]; then
    check_fail ".env file exists (should be in .gitignore)"
else
    check_pass ".env file not committed"
fi

if ls *.pem *.key 2>/dev/null | grep -q .; then
    check_fail "Key files found in root"
else
    check_pass "No key files in root directory"
fi

# 8. Check file permissions
echo ""
echo "8. Checking file permissions..."
if [ -f ".htaccess" ]; then
    perms=$(stat -c "%a" .htaccess 2>/dev/null)
    if [ "$perms" = "644" ]; then
        check_pass ".htaccess has correct permissions (644)"
    else
        check_warn ".htaccess permissions: $perms (should be 644)"
    fi
fi

# 9. Check robots.txt
echo ""
echo "9. Checking robots.txt..."
if [ -f "prototype/robots.txt" ]; then
    check_pass "robots.txt exists"
else
    check_warn "robots.txt not found"
fi

# 10. Summary
echo ""
echo "========================================="
echo "Security Check Summary"
echo "========================================="
echo ""
echo "Recommendations:"
echo "1. Run 'npm audit' to check for dependency vulnerabilities"
echo "2. Add Subresource Integrity (SRI) hashes to CDN resources"
echo "3. Enable HSTS after HTTPS is confirmed working"
echo "4. Regular security audits with 'npm audit' and 'npx audit-ci'"
echo ""
echo "For detailed security information, see: SECURITY.md"
echo ""
