# CASEFILE: offline Android edition

This build bundles all 150 playable investigations, illustrations, hints, answer keys and game logic in an Android app. It requires no website, Supabase project, account, API key, or internet connection at runtime, including first launch. The website remains a separate Next.js build.

Progress, detective name, settings, notes, scores and achievements are saved in IndexedDB inside the app's WebView. They survive closing/reopening the app. They do not sync with the website or another phone. Clearing app data or uninstalling removes saves. Android cloud backup is disabled. There is no save export/import UI yet.

## What has been prepared

- `src/cases.ts`: bundles every case and solution for local play.
- `src/store.ts`: local transactions, save versions, scoring, ranks and achievements.
- `src/client.ts`: replaces server requests with local operations.
- Vite reuses the current React screens; a small router adapter replaces Next's server routing.
- `android/`: Capacitor Android project, package ID `com.girish.casefile`.
- Network permissions removed during Android manifest merging; a Content Security Policy blocks web connections. No remote `server.url`, analytics, ads, Firebase, database libraries, or service credentials are configured.
- `tests/offline.test.ts`: solves all 150 cases through persistent storage; checks reopening, concurrent saves, reset scope and operation with fetch disabled.
- `.github/workflows/offline-apk.yml`: a manually triggered test APK build.

The game engine still withholds unseen evidence and answers in the normal interface. Since a fully offline game must carry its answers, someone inspecting the APK can extract them. This does not affect the website's server-only solution handling.

## Option A: build through GitHub (no Android Studio installation)

1. Commit and push this project's new mobile files, shared UI changes, both package lockfiles, and `.github/workflows/offline-apk.yml` to your existing GitHub repository. Do not commit `.env`, database passwords, signing keys, `node_modules`, or generated build folders.
2. Open the repository on GitHub, select **Actions**, then **Build offline Android APK**.
3. Click **Run workflow**. This workflow has no automatic push trigger and needs no Supabase, Vercel or signing secrets.
4. Wait for the build to finish. The build machine needs internet to download development tools; the resulting app does not.
5. Open the completed run. Under **Artifacts**, download **casefile-offline-debug-apk** and unzip it.
6. Copy `app-debug.apk` to your Android phone. Open it and allow installation from the file manager/browser you use if Android asks.
7. Turn on airplane mode **before the first launch**. Open CASEFILE, choose case 001, 100 or 150, collect a clue and save a note. Close and reopen the app to confirm the save remains. Test the other screens too.

GitHub Actions usage is subject to your account's included minutes and storage; check its billing limits before running jobs. The workflow is prepared locally; it has not been pushed or executed on your GitHub account.

**This workflow makes a debug/test APK, not a Play Store release.** Hosted runners generate a new debug signing key on each fresh run, so an APK from a later run may not install over the earlier one. Uninstalling to replace it deletes progress. For lasting distribution and updates, use one backed-up release signing key (Option B).

## Option B: build on your Mac

1. Install Node.js 22.12 or newer: https://nodejs.org/
2. Install Android Studio 2025.2.1 or newer: https://developer.android.com/studio
3. Open Android Studio and finish its setup wizard, including accepting the Android SDK license terms yourself.
4. In **Tools → SDK Manager**, install **Android SDK Platform 36**, **Android SDK Build-Tools 36.0.0**, and **Android SDK Platform-Tools**.
5. Open Terminal in the repository's root folder. If this is a fresh clone, first run:

   ```bash
   npm ci --ignore-scripts
   npm run mobile:install
   ```

   On this prepared workspace, the dependencies are already installed.

6. Build and copy the offline game into the Android project:

   ```bash
   npm run mobile:test
   npm run mobile:sync
   npm run mobile:open
   ```

7. Android Studio opens `mobile/android`. Let Gradle finish syncing. Use Android Studio's bundled JDK 21 if asked for a Gradle JDK.
8. For a test APK, choose **Build → Generate App Bundles or APKs → Generate APKs** (some versions call it **Build APK(s)**). The output is:

   ```text
   mobile/android/app/build/outputs/apk/debug/app-debug.apk
   ```

Alternatively, once Android Studio's SDK and Java environment are configured, run this from the project root:

```bash
npm run mobile:apk
```

On a standard macOS Android Studio installation, the command-line environment is usually:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
npm run mobile:apk
```

Use Android Studio's displayed SDK location if it differs. `mobile:apk` builds and copies current assets before calling Gradle, so stale website assets cannot accidentally be packaged.

## Signed APK for sharing and future updates

In Android Studio, choose **Build → Generate Signed App Bundle / APK → APK**. Create a keystore in a private location outside the repository, choose an alias and strong passwords, select **release**, and generate the signed APK. Back up that keystore and passwords securely. Never send them in chat or commit them to GitHub. Use the same key and application ID for all future updates, and increase `versionCode` in `android/app/build.gradle` for each release.

`com.girish.casefile` is the initial package ID. Finalize its uniqueness before the first public release; changing it later creates a different app with separate saves.

To publish on Google Play later, generate a signed **Android App Bundle (AAB)** instead, and complete Play Console registration, testing and store review. An APK made here is not automatically listed on Google Play.

## Development and checks

```bash
npm run mobile:test
npm run mobile:build
npm --prefix mobile run preview
```

The browser preview serves bundled files for UI inspection; no database is used. Native first-launch/airplane-mode, Android Back navigation, system bars and signed APK installation still require a real Android device or emulator test.

The offline build refuses online-only application modules and checks packaged assets for service configuration and database secrets. `mobile:sync` verifies the native offline settings. The GitHub workflow additionally inspects the final APK's permissions.

Reference: https://capacitorjs.com/docs/getting-started/environment-setup
