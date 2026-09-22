import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.girish.casefile",
  appName: "CASEFILE",
  webDir: "dist",
  // No server.url: Android loads these files from the APK itself.
  android: { allowMixedContent: false },
};
export default config;
