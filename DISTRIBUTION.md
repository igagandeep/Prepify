# Distribution Guide

This guide explains how to create executable files for Prepify that non-technical users can download and run.

## Quick Start

```bash
# Test the build process
npm run test:build

# Create Windows executable
npm run dist:win

# Create executables for all platforms
npm run dist
```

## What Gets Built

The distribution process creates:

1. **Backend**: Node.js server bundled with the app
2. **Frontend**: Static Next.js files (HTML/CSS/JS)
3. **Electron**: Desktop wrapper that runs both

## Output Files

After running `npm run dist`, check `electron/dist-electron/`:

- **Windows**: `Prepify Setup 1.0.0.exe` - Installer for Windows
- **macOS**: `Prepify-1.0.0.dmg` - Disk image for macOS
- **Linux**: `Prepify-1.0.0.AppImage` - Portable app for Linux

## For End Users

1. Download the appropriate file for your operating system
2. Run the installer (Windows/macOS) or the AppImage (Linux)
3. The app will start with both backend and frontend included

No need to install Node.js, npm, or any dependencies - everything is bundled.

## Troubleshooting

- If build fails, run `npm run test:build` first
- Make sure all workspaces install correctly: `npm install`
- Check that all three parts build individually:
  - `npm run build --workspace=backend`
  - `npm run export --workspace=frontend`
  - `npm run build --workspace=electron`

## Adding Icons

Replace placeholder icons in `electron/assets/`:

- Create 512x512 PNG source image
- Convert to ICO (Windows), ICNS (macOS), PNG (Linux)
- Use online tools or `electron-icon-builder`

## Automated Builds

GitHub Actions automatically builds releases when you:

1. Create a version tag: `git tag v1.0.0 && git push origin v1.0.0`
2. Or manually trigger from GitHub Actions tab

Built files are available as artifacts in the GitHub Actions run.
