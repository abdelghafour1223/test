#!/bin/bash

echo "🧪 Testing Bot Detection for Vercel Proxy"
echo "=========================================="
echo ""

PROXY_URL="https://test-delta-opal-83.vercel.app/"

echo "1. Testing with TikTok Bot User-Agent:"
echo "   User-Agent: TikTokBot"
echo ""
curl -s -I "$PROXY_URL" -H "User-Agent: TikTokBot" | grep -E "HTTP|location|Location" | head -5
echo ""
echo "---"
echo ""

echo "2. Testing with Bytespider (TikTok Crawler):"
echo "   User-Agent: Bytespider"
echo ""
curl -s -I "$PROXY_URL" -H "User-Agent: Mozilla/5.0 (compatible; Bytespider)" | grep -E "HTTP|location|Location" | head -5
echo ""
echo "---"
echo ""

echo "3. Testing with Normal Browser:"
echo "   User-Agent: Chrome Browser"
echo ""
curl -s -I "$PROXY_URL" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" | grep -E "HTTP|location|Location" | head -5
echo ""
echo "---"
echo ""

echo "4. Testing with TikTok Referer:"
echo "   Referer: tiktok.com"
echo ""
curl -s -I "$PROXY_URL" -H "Referer: https://www.tiktok.com/@user/video/123" | grep -E "HTTP|location|Location" | head -5
echo ""

echo "=========================================="
echo "✅ Test Complete!"
echo ""
echo "📝 What to look for:"
echo "   - Status 302 = Redirect is happening"
echo "   - Location header = Shows where it redirects to"
echo "   - Bot requests should redirect to BOT_URL"
echo "   - Normal requests should redirect to REAL_URL"
