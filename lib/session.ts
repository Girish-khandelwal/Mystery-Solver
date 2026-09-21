import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
export async function session(create = false) {
  const jar = await cookies();
  const token = jar.get("casefile-session")?.value;
  const user = token
    ? await db.user.findUnique({
        where: {
          sessionToken: createHash("sha256").update(token).digest("hex"),
        },
      })
    : null;
  if (user || !create) return user;
  const raw = randomBytes(32).toString("hex");
  const newUser = await db.user.create({
    data: {
      username: "Detective",
      sessionToken: createHash("sha256").update(raw).digest("hex"),
      profile: { create: {} },
      settings: { create: {} },
    },
  });
  jar.set("casefile-session", raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return newUser;
}
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new Error("Cross-origin changes are not allowed.");
}
