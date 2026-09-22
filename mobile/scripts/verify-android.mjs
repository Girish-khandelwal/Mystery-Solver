import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const manifest = await readFile(
  new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url),
  "utf8",
);
for (const permission of manifest.match(/<uses-permission\b[^>]*>/g) ?? []) {
  if (/android\.permission\.(INTERNET|ACCESS_NETWORK_STATE)/.test(permission))
    assert.ok(permission.includes('tools:node="remove"'), "Offline network permissions must be explicitly removed");
}
assert.ok(
  manifest.includes('android:allowBackup="false"'),
  "Offline saves must not be cloud-backed up",
);
const config = JSON.parse(
  await readFile(
    new URL(
      "../android/app/src/main/assets/capacitor.config.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
assert.ok(
  !config.server?.url,
  "APK must use bundled files, never a remote website URL",
);
console.log("Android offline configuration verified.");
