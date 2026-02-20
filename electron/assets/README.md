# App Icons

This directory contains the application icons for different platforms:

- `icon.ico` - Windows icon (256x256 or multiple sizes)
- `icon.icns` - macOS icon (512x512)
- `icon.png` - Linux icon (512x512)

## Icon Requirements

**Windows (.ico):**

- Multiple sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- Format: ICO file

**macOS (.icns):**

- Size: 512x512 (and other sizes for Retina displays)
- Format: ICNS file

**Linux (.png):**

- Size: 512x512
- Format: PNG file

## Creating Icons

You can use online tools like:

- https://www.icoconverter.com/
- https://iconverticons.com/
- Or design tools like Figma/Photoshop

## Temporary Setup

For now, electron-builder will use default icons if these files are missing.
Add proper icons before final release.
