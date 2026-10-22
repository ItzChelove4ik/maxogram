# Orbit icon

Canonical source: `orbit-icon.png` (1024 × 1024, opaque, full bleed).

Monochrome spiral mark on a black background. The operating system supplies the launcher mask; the source contains no rounded corners or transparent border.

Regenerate all Tauri platform icons:

```sh
bun run tauri icon assets/branding/icon-manifest.json
```

For iOS, run this command after `bun run tauri ios init` so it writes into the generated Xcode asset catalog. The iOS workflow applies the icon in this order.

The web favicon is a 256 × 256 copy of the generated icon. The Android adaptive foreground (`orbit-foreground.png`) contains the spiral mark with transparency, within the adaptive-icon safe area. The assets follow the repository's MIT license.
