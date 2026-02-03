#!/bin/bash
# Build Teams app package
# Usage: ./build.sh <microsoft-app-id>
# Or: source .env && ./build.sh $MICROSOFT_APP_ID

set -e

APP_ID=${1:-$MICROSOFT_APP_ID}

if [ -z "$APP_ID" ]; then
  echo "Error: Microsoft App ID required"
  echo "Usage: ./build.sh <microsoft-app-id>"
  echo "Or: source ../.env && ./build.sh \$MICROSOFT_APP_ID"
  exit 1
fi

cd "$(dirname "$0")"

BUILD_DIR="build"

# Check for icons
if [ ! -f "color.png" ] || [ ! -f "outline.png" ]; then
  echo "Warning: Icon files missing. Creating placeholders..."
  # Create simple placeholder icons (1x1 purple pixel, will need to be replaced)
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIA5agATwAAAABJRU5ErkJggg==" | base64 -d > color.png 2>/dev/null || echo "Could not create placeholder icons"
  cp color.png outline.png 2>/dev/null || true
  echo "Please replace color.png (192x192) and outline.png (32x32) with real icons"
fi

# Generate manifest with real app ID
mkdir -p "$BUILD_DIR"
sed "s/{{MICROSOFT_APP_ID}}/$APP_ID/g" manifest.json > "$BUILD_DIR/manifest.json"

# Create zip package with manifest.json (Teams requirement)
rm -f "$BUILD_DIR/linear-teams-bot.zip"
zip -j "$BUILD_DIR/linear-teams-bot.zip" "$BUILD_DIR/manifest.json" color.png outline.png

echo ""
echo "Created: $BUILD_DIR/linear-teams-bot.zip"
echo ""
echo "To install in Teams:"
echo "1. Open Teams"
echo "2. Go to Apps > Manage your apps > Upload an app"
echo "3. Select 'Upload a custom app'"
echo "4. Choose linear-teams-bot.zip"
