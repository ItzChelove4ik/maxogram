# Maxogram — iOS interface

Tauri 2 / Svelte 5 messenger. Keep every route, settings section, folder, configurable navigation item, action and backend integration. Presentation may change; account/chat data and API behavior must not.

## Direction

Native iOS hierarchy with Telegram-style conversation lists. Use SF Pro through the system font stack, a single blue accent, inset grouped lists, 16px cards, 28px sheets and translucent navigation chrome. Reserve glass for navigation; keep content readable on opaque surfaces. No marketing hero layouts or externally downloaded fonts.

The ui-ux-pro-max search `social messaging mobile minimal --design-system --variance 2 --density 6` verified Minimalism & Swiss Style and a messenger palette. Adapt those recommendations to Apple's platform conventions; the generated landing-page pattern is irrelevant to this app. `safe area bottom navigation --domain web` verified safe-area insets and bottom-tab guidance. `reactivity accessibility transitions --stack svelte` verified built-in transitions; preserve the supported legacy Svelte component mode rather than migrate unrelated logic to runes.

## Tokens

`src/lib/styles/ios.css` defines semantic surfaces, text, accent, status, bubbles, separators, radii and motion for both themes. Default follows the system; Settings offers System / Light / Dark. Never hardcode a dark text or surface color in an ordinary page. Playback surfaces may intentionally stay black with white controls.

## Layout

Phone gutters 16px; tablet content width up to 680px for settings/forms. Large page titles 34px, list names and body 17px, secondary text 15px, metadata 13px. Use rem units so text responds to platform sizing. Touch targets >=44px, visible keyboard focus, selected/expanded state semantics, native form controls where possible.

Keep the full configurable navigation catalog. A horizontally scrollable tab bar supports configurations with more than five items without removing or shrinking categories. Reserve its height and the home-indicator inset in page content. Settings subpages and chats remain above the tab bar and retain back/swipe behavior.

Menu editing retains add/remove/default/drag actions and also offers a select control with previous/next buttons. Search, messages, attachments, calls, contacts, QR, Digital ID, Sferum, plugins and every settings group continue to use the existing integrations.

The user's requirement to avoid stubs also removes the diagnostic simulated-stream switch and automatic noise/video substitution from calls. Device failures show an error; calls can continue with the microphone muted or camera disabled. Voice encoding rejects unavailable browser capabilities rather than producing a fabricated silent file.

## Verification

Check 375px portrait, landscape and tablet widths, both themes, enlarged text and reduced motion. Verify navigation catalog editing, folder switching, settings back navigation, search, composer controls, sheets, authentication and representative specialist pages. All screens use the existing account, API and native integrations; do not replace them with fixtures or stubs. Device-dependent actions require verification in the native app.

Validated locally: production Vite build, Node voice-encoder failure tests, JavaScript syntax, Git whitespace checks, and 56 text/background contrast pairs (minimum 4.61:1 light and 4.55:1 dark). The source-wide Svelte typecheck has thousands of pre-existing diagnostics; compare against the original baseline rather than claim it passes. No new UI diagnostics remain. Native iOS compilation and IPA archive validation use `.github/workflows/ios.yml`. Device interactions and visual layout on iPhone still require device testing; a successful build does not certify them.
