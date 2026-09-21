import { existsSync, copyFileSync, closeSync, openSync } from "node:fs";
// Never replace an existing environment file or database.
if (!existsSync(".env")) copyFileSync(".env.example", ".env");
if (!existsSync("prisma/dev.db")) closeSync(openSync("prisma/dev.db", "a"));
