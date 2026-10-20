# PocketRoute for iPhone

Capacitor shell for the PocketRoute PWA (pocketappstudio). `web/` is a snapshot of the PWA source; `npm run ios:sync` builds `www/` for the native app (all features unlocked as a paid-upfront App Store app, no Gumroad, no service worker) and syncs it into Xcode.

CI (`.github/workflows/ios.yml`): web checks + smoke test, then an unsigned simulator build on every push. The signed TestFlight lane runs only on manual dispatch with `testflight=true`, and needs the App Store Connect app record to exist first.
