// Draft storage utilities for persisting unsaved form/workflow state in the browser.
// These helpers intentionally guard all localStorage calls with a runtime check
// `typeof window === 'undefined'` to ensure they NO-OP during server-side rendering (SSR).
// In a Next.js environment, modules can be imported and executed on the server where `window`
// does not exist. Accessing `window.localStorage` there would throw a ReferenceError and break
// page rendering. The pattern: `if (typeof window === 'undefined')` safely detects SSR and
// avoids attempting any browser-only APIs until we are on the client.

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * loadDraft
 * Reads a JSON blob from localStorage keyed by `key` and returns the stored data
 * plus a timestamp of the last save. If the environment is SSR or the key is missing / malformed,
 * it returns an object with `data: null`.
 */
export function loadDraft<T = any>(key: string): { data: T | null; lastSavedAt?: number } {
  // SSR guard: localStorage is only available in the browser.
  if (typeof window === "undefined") return { data: null };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { data: null };
    const parsed = JSON.parse(raw);
    return { data: parsed?.data ?? null, lastSavedAt: parsed?.lastSavedAt };
  } catch {
    // Corrupt JSON or inaccessible storage -> gracefully degrade.
    return { data: null };
  }
}

/**
 * saveDraft
 * Persists arbitrary serializable data along with a `lastSavedAt` timestamp.
 * Silently ignores errors (e.g., storage quota exceeded or private mode restrictions).
 */
export function saveDraft<T = any>(key: string, data: T) {
  // SSR guard.
  if (typeof window === "undefined") return;
  try {
    const payload = { data, lastSavedAt: Date.now() };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota or transient storage errors; caller treats draft persistence as best-effort.
  }
}

/**
 * clearDraft
 * Removes the draft entry for the provided key. Best-effort; errors are swallowed.
 */
export function clearDraft(key: string) {
  // SSR guard.
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Swallow errors to avoid impacting calling flows (e.g., publish navigation).
  }
}
