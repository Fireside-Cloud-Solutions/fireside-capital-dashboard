# PWA App Icons

## Required Icons

The following icon files are required for full PWA functionality:

### Critical (Required for Installability)
- **icon-192x192.png** - 192x192px PNG (minimum size for installability)
- **icon-512x512.png** - 512x512px PNG (used for splash screen and app drawer)

### Recommended for Best Experience
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png (for Windows tiles)
- icon-152x152.png (for iOS devices)
- icon-384x384.png

## Design Guidelines

### Colors
- **Primary:** #01a4ef (Fireside blue)
- **Background:** #0a0e27 (dark mode background)
- **Accent:** #f44e24 (orange)

### Content
Use the Fireside Capital logo or a simplified "FC" monogram on the primary blue background.

### Maskable Icons
Icons should have a **10% safe zone** (padding) for Android adaptive icons to prevent clipping when system applies masks.

## How to Generate Icons

### Option 1: Using Sharp (Node.js)
```bash
npm install sharp
node scripts/generate-pwa-icons.js
```

### Option 2: Using Online Tools
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWABuilder Image Generator](https://www.pwabuilder.com/imageGenerator)

### Option 3: Manual Creation
Create a 512x512px canvas in design tool (Figma, Photoshop, etc.):
1. Fill background with #01a4ef
2. Center logo/monogram with 10% padding (51px on all sides)
3. Export as PNG at 512x512
4. Use image editor to resize to other required sizes

## Current Status

⚠️ **Icons not yet created.** Manifest.json is configured and ready, but placeholder icon files need to be generated.

PWA will not be fully installable until icon-192x192.png and icon-512x512.png are created.
