import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const command = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const result = spawnSync(command, ["assembleDebug", "--no-daemon"], {
  cwd: fileURLToPath(new URL("../android", import.meta.url)),
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.error || result.status !== 0) {
  console.error(
    "APK build requires Android Studio, its JDK, and Android SDK. See mobile/README.md.",
  );
  process.exit(1);
}
console.log(
  "APK ready: mobile/android/app/build/outputs/apk/debug/app-debug.apk",
);
