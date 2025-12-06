# IdeaForge Quick Capture - Browser Extension

A Chrome/Edge extension for quickly capturing ideas to IdeaForge.

## Features

- **Quick Popup**: Click the extension icon or use `Ctrl+Shift+I` to capture ideas
- **Context Menu**: Right-click to capture selected text or entire page
- **Auto-fill**: Automatically captures the current page URL, title, and selected text
- **Offline Queue**: Captures are queued when offline (coming soon)
- **Self-hosted Support**: Configure custom IdeaForge instance URLs

## Installation

### From Source (Developer Mode)

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder

### Setup

1. Click the extension icon and select "Configure Extension"
2. Get an API token from IdeaForge:
   - Go to Settings → API Tokens
   - Click "Create Token"
   - Copy the token (shown only once!)
3. Paste the token in the extension options
4. (Optional) For self-hosted instances, enter your IdeaForge URL

## Usage

### Popup Capture

1. Click the extension icon (or press `Ctrl+Shift+I`)
2. Enter a title for your idea
3. Optionally add more details
4. Click "Capture" to send to inbox, or check "Create as project immediately"

### Context Menu

- **Capture selected text**: Select text on any page, right-click, and choose "Capture to IdeaForge"
- **Capture page**: Right-click anywhere on a page and choose "Capture this page to IdeaForge"

## Icons

The extension requires icon files. Create or add:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

You can use any icon generator or create simple icons with the IdeaForge logo.

## Development

The extension is built with vanilla JavaScript (no build step required).

Files:
- `manifest.json` - Extension manifest (Manifest V3)
- `popup.html/js` - Popup UI
- `options.html/js` - Settings page
- `background.js` - Service worker for context menus

## Privacy

- API tokens are stored securely in Chrome's sync storage
- No data is collected except what you explicitly capture
- All captures are sent directly to your IdeaForge instance
