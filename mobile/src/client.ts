import { createLocalDatabase, LocalError } from "./store";
export const isOfflineApp = true;
let database: ReturnType<typeof createLocalDatabase> | undefined;
// This adapter never calls fetch. Shared screens use the same response contract,
// but all reads, validation, scoring and writes happen locally.
export async function gameRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    database ??= createLocalDatabase();
    const result = await database.run(path, init?.method ?? "GET", body);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Device storage is unavailable.",
      },
      { status: error instanceof LocalError ? error.status : 400 },
    );
  }
}
