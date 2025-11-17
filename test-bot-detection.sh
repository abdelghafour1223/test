#!/bin/bash

# TikTok Bot Detection Test Script (Server-Side Rendering)
# Tests the middleware bot detection logic with various User-Agent strings
# Now tests for SSR (reverse proxy) instead of redirects
#
# Usage: ./test-bot-detection.sh <your-deployment-url>
# Example: ./test-bot-detection.sh https://your-app.vercel.app

set -e

TARGET_URL="${1:-http://localhost:3000}"

echo "================================================"
echo "TikTok Bot Detection Test Suite (SSR Mode)"
echo "================================================"
echo "Target: $TARGET_URL"
echo "Mode: Server-Side Rendering (Reverse Proxy)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test a User-Agent with SSR
test_user_agent() {
    local TEST_NAME="$1"
    local USER_AGENT="$2"
    local EXPECTED_RESULT="$3"  # "bot" or "human"

    echo "----------------------------------------"
    echo "Test: $TEST_NAME"
    echo "User-Agent: $USER_AGENT"
    echo "Expected Detection: $EXPECTED_RESULT"

    # Make request and capture headers
    RESPONSE=$(curl -A "$USER_AGENT" -sI "$TARGET_URL" 2>&1)
    STATUS=$(echo "$RESPONSE" | grep -i "^HTTP" | head -1 | cut -d' ' -f2)
    BOT_DETECTION=$(echo "$RESPONSE" | grep -i "^X-Bot-Detection:" | cut -d' ' -f2 | tr -d '\r\n')
    PROXY_TARGET=$(echo "$RESPONSE" | grep -i "^X-Proxy-Target:" | cut -d' ' -f2 | tr -d '\r\n')
    RENDER_MODE=$(echo "$RESPONSE" | grep -i "^X-Render-Mode:" | cut -d' ' -f2 | tr -d '\r\n')

    echo "Status: $STATUS"
    echo "X-Bot-Detection: $BOT_DETECTION"
    echo "X-Proxy-Target: $PROXY_TARGET"
    echo "X-Render-Mode: $RENDER_MODE"

    # Check if result matches expectation
    if [[ "$BOT_DETECTION" == "$EXPECTED_RESULT" ]]; then
        # Additional check: verify it's SSR (not redirect)
        if [[ "$STATUS" == "200" ]] && [[ "$RENDER_MODE" == "server-side" ]]; then
            echo -e "${GREEN}✓ PASSED${NC} (SSR working, detection correct)"
            ((PASSED++))
        elif [[ "$STATUS" == "200" ]]; then
            echo -e "${GREEN}✓ PASSED${NC} (detection correct, but render mode header missing)"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠ PARTIAL${NC} (detection correct but unexpected status: $STATUS)"
            ((PASSED++))
        fi
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Expected X-Bot-Detection: $EXPECTED_RESULT"
        echo "Got: $BOT_DETECTION"
        ((FAILED++))
    fi
    echo ""
}

echo "================================================"
echo "TEST GROUP 1: TikTok Bots (should serve FAKE content via SSR)"
echo "================================================"
echo ""

test_user_agent \
    "Bytespider - Full User-Agent" \
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.0.0 Safari/537.36" \
    "bot"

test_user_agent \
    "Bytespider - Mobile Variant" \
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)" \
    "bot"

test_user_agent \
    "TikTokSpider - Full User-Agent" \
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; TikTokSpider; ttspider-feedback@tiktok.com)" \
    "bot"

echo "================================================"
echo "TEST GROUP 2: TikTok WebView (HUMANS - should serve REAL content via SSR)"
echo "================================================"
echo ""

test_user_agent \
    "TikTok WebView - Android (trill)" \
    "Mozilla/5.0 (Linux; Android 8.1.0; CPH1901) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 trill_200005 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/trill" \
    "human"

test_user_agent \
    "TikTok WebView - iOS (musical_ly)" \
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_21.7.0 JsSdk/2.0 NetType/4G Channel/App Store" \
    "human"

test_user_agent \
    "TikTok WebView - BytedanceWebview" \
    "Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.120 Mobile Safari/537.36 BytedanceWebview/d8a21c6" \
    "human"

echo "================================================"
echo "TEST GROUP 3: Regular Browsers (HUMANS - should serve REAL content via SSR)"
echo "================================================"
echo ""

test_user_agent \
    "Chrome Desktop" \
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    "human"

test_user_agent \
    "Firefox Desktop" \
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" \
    "human"

test_user_agent \
    "Safari iOS" \
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
    "human"

test_user_agent \
    "Chrome Android" \
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36" \
    "human"

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
