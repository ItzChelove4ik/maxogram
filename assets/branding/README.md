# Maxogram icon

Editable source: `maxogram-icon.svg` (1024 × 1024, opaque, full bleed).

Red circular icon with a light paper-plane mark on a dark blue background, following the reference supplied by the user. The notification badge and its number are omitted. The operating system supplies the launcher mask; the source contains no rounded corners or transparent border.

Regenerate all Tauri platform icons:

```sh
bun run tauri icon assets/branding/icon-manifest.json
```

The web favicon is a 256 × 256 copy of the generated icon. The Android adaptive foreground uses the plane without the blue background, within the adaptive-icon safe area. The assets follow the repository's MIT license.
