// The Android build replaces this module with its local-only implementation.
// The website continues to use its existing authenticated API.
export const isOfflineApp = false;
export const gameRequest = (
  path: string,
  init?: RequestInit,
): Promise<Response> => fetch(path, init);
