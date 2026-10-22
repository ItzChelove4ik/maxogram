# Maxogram icon

Editable source: `maxogram-icon.svg` (1024 × 1024, opaque, full bleed).

The white message mark and circular opening take inspiration from MAX. A folded message tail, blue gradient, and subtle violet finish connect it to the Telegram and ExteraGram style. The operating system supplies the launcher mask; the source contains no rounded corners or transparent border.

Regenerate all Tauri platform icons:

```sh
bun run tauri icon assets/branding/icon-manifest.json
```

The web favicon is a 256 × 256 copy of the generated icon. The Android adaptive foreground uses the plane without the blue background, within the adaptive-icon safe area. The assets follow the repository's MIT license.
