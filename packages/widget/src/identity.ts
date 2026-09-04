import { hasOwn, type InstaFixIdentity } from "@instafix/core";

const STORAGE_KEY = "instafix_identity";

/**
 * Author identity persisted by the widget — alias of core's
 * `InstaFixIdentity` (one concept, one shape; the alias keeps the widget's
 * historical export name working).
 */
export type Identity = InstaFixIdentity;

/**
 * Last identity accepted in THIS page session.
 *
 * The prompt is meant to appear once, ever, but it was reappearing on every
 * submit for anyone whose `localStorage` write does not stick — Safari's
 * private mode, a quota-full origin, an embedded/partitioned context, or a
 * browser configured to block site data. `saveIdentity` swallows those
 * failures by design (a failed persist must not lose the feedback being
 * submitted), which left `getIdentity()` reading back `null` every time and
 * re-prompting.
 *
 * This in-memory tier is the floor: whatever storage does, the answer holds
 * for the rest of the session. `sessionStorage` sits between the two so a
 * reload in the same tab is also covered when only `localStorage` is denied.
 */
let sessionIdentity: Identity | null = null;

/** Type guard — narrows an unknown value to `Identity` only when both fields are non-empty strings. */
function isIdentity(value: unknown): value is Identity {
  if (!hasOwn(value, "name") || !hasOwn(value, "email")) return false;
  const { name, email } = value;
  return typeof name === "string" && typeof email === "string" && name.length > 0 && email.length > 0;
}

/** Read + validate one storage tier; `null` for missing, malformed, or inaccessible. */
function readFrom(storage: () => Storage): Identity | null {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isIdentity(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getIdentity(): Identity | null {
  if (sessionIdentity) return sessionIdentity;
  const stored = readFrom(() => localStorage) ?? readFrom(() => sessionStorage);
  if (stored) sessionIdentity = stored;
  return stored;
}

export function saveIdentity(identity: Identity): void {
  // Memory first: this tier cannot fail, so the prompt is answered once per
  // session no matter what the storage tiers do below.
  sessionIdentity = identity;
  const serialized = JSON.stringify(identity);
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Quota exceeded or localStorage disabled — fall through to sessionStorage
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Both storages denied — the in-memory tier still covers this session
  }
}

/** @internal — exposed for tests, which need a clean session between cases. */
export function _resetSessionIdentityForTests(): void {
  sessionIdentity = null;
}
