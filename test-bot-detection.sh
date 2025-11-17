#!/bin/bash

# TikTok Bot Detection Test Script
# Tests the middleware bot detection logic with various User-Agent strings
#
# Usage: ./test-bot-detection.sh <your-deployment-url>
# Example: ./test-bot-detection.sh https://your-app.vercel.app

set -e

TARGET_URL="${1:-http://localhost:3000}"
FAKE_URL="https://storelhata.com/pages/miroir"
REAL_URL="https://ecoshopin.store/products/propolis"

echo "================================================"
echo "TikTok Bot Detection Test Suite"
echo "================================================"
echo "Target: $TARGET_URL"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test a User-Agent
test_user_agent() {
    local TEST_NAME="$1"
    local USER_AGENT="$2"
    local EXPECTED_RESULT="$3"  # "bot" or "human"
    local EXPECTED_URL="$4"

    echo "----------------------------------------"
    echo "Test: $TEST_NAME"
    echo "User-Agent: $USER_AGENT"
    echo "Expected: $EXPECTED_RESULT → $EXPECTED_URL"

    # Make request and capture redirect location
    RESPONSE=$(curl -A "$USER_AGENT" -sI "$TARGET_URL" 2>&1)
    LOCATION=$(echo "$RESPONSE" | grep -i "^Location:" | cut -d' ' -f2 | tr -d '\r\n')
    STATUS=$(echo "$RESPONSE" | grep -i "^HTTP" | head -1 | cut -d' ' -f2)

    echo "Status: $STATUS"
    echo "Redirect: $LOCATION"

    # Check if result matches expectation
    if [[ "$LOCATION" == *"$EXPECTED_URL"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Expected URL containing: $EXPECTED_URL"
        echo "Got: $LOCATION"
        ((FAILED++))
    fi
    echo ""
}

echo "================================================"
echo "TEST GROUP 1: TikTok Bots (should redirect to FAKE URL)"
echo "================================================"
echo ""

test_user_agent \
    "Bytespider - Full User-Agent" \
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.0.0 Safari/537.36" \
    "bot" \
    "$FAKE_URL"

test_user_agent \
    "Bytespider - Mobile Variant" \
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)" \
    "bot" \
    "$FAKE_URL"

test_user_agent \
    "TikTokSpider - Full User-Agent" \
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; TikTokSpider; ttspider-feedback@tiktok.com)" \
    "bot" \
    "$FAKE_URL"

echo "================================================"
echo "TEST GROUP 2: TikTok WebView (HUMANS - should redirect to REAL URL)"
echo "================================================"
echo ""

test_user_agent \
    "TikTok WebView - Android (trill)" \
    "Mozilla/5.0 (Linux; Android 8.1.0; CPH1901) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 trill_200005 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/trill" \
    "human" \
    "$REAL_URL"

test_user_agent \
    "TikTok WebView - iOS (musical_ly)" \
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_21.7.0 JsSdk/2.0 NetType/4G Channel/App Store" \
    "human" \
    "$REAL_URL"

test_user_agent \
    "TikTok WebView - BytedanceWebview" \
    "Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.120 Mobile Safari/537.36 BytedanceWebview/d8a21c6" \
    "human" \
    "$REAL_URL"

echo "================================================"
echo "TEST GROUP 3: Regular Browsers (HUMANS - should redirect to REAL URL)"
echo "================================================"
echo ""

test_user_agent \
    "Chrome Desktop" \
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    "human" \
    "$REAL_URL"

test_user_agent \
    "Firefox Desktop" \
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" \
    "human" \
    "$REAL_URL"

test_user_agent \
    "Safari iOS" \
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
    "human" \
    "$REAL_URL"

test_user_agent \
    "Chrome Android" \
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36" \
    "human" \
    "$REAL_URL"

echo "================================================"
echo "TEST SUMMARY"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
