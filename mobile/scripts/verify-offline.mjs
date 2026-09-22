import { readFile, readdir, access } from "node:fs/promises";
import assert from "node:assert/strict";
const files = await readdir(new URL("../dist/assets/", import.meta.url));
const js = (
  await Promise.all(
    files
      .filter((f) => f.endsWith(".js"))
      .map((f) =>
        readFile(new URL(`../dist/assets/${f}`, import.meta.url), "utf8"),
      ),
  )
).join("\n");
assert.ok(
  !/supabase\.co|vercel\.app|postgres(?:ql)?:\/\/|DATABASE_URL|DIRECT_URL|PrismaClient/.test(
    js,
  ),
  "Online service or database dependency found in APK assets",
);
assert.ok(
  js.includes("casefile-offline-v1"),
  "Local save implementation missing",
);
const html = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
assert.ok(
  html.includes("connect-src 'none'"),
  "Offline policy must block network connections",
);
for (const f of ["archive", "evidence", "portrait", "street", "workshop"])
  await access(new URL(`../dist/cases/${f}.svg`, import.meta.url));
console.log(
  "Offline bundle verified: local assets and saves, no online service configuration or database credentials.",
);
