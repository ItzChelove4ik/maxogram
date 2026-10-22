# Maxogram icon

Editable source: `maxogram-icon.svg` (1024 × 1024, opaque, full bleed).

The white mark reuses the original MaxPlus vector geometry supplied with this project. A solid Telegram-style blue background replaces the original multicolor background. No shadows, folds, or effects are applied. The operating system supplies the launcher mask; the source contains no rounded corners or transparent border. Original attribution remains in the repository LICENSE.

Regenerate all Tauri platform icons:

```sh
bun run tauri icon assets/branding/icon-manifest.json
```

The web favicon is a 256 × 256 copy of the generated icon. The Android adaptive foreground uses the plane without the blue background, within the adaptive-icon safe area. The assets follow the repository's MIT license.
