/**
 * "Handed to an agent" tracking — remembers WHEN each feedback was last
 * copied/exported as an agent prompt (panel copy, selected copy, detail
 * copy, "Agent에게" handoff), so list cards can badge it and the developer
 * never wonders "did I already send this one?".
 *
 * Deliberately localStorage, not a store field: it's a per-developer,
 * per-browser working note (like the toolbar-hidden preference), not shared
 * feedback state — and it must not require a schema change across every
 * adapter. Capped so the map can't grow unboundedly.
 */

const KEY = "instafix_handed_off";
const MAX_ENTRIES = 500;

type HandoffMap = Record<string, string>; // feedbackId → ISO timestamp

function load(): HandoffMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as HandoffMap) : {};
  } catch {
    return {};
  }
}

function save(map: HandoffMap): void {
  try {
    const entries = Object.entries(map);
    if (entries.length > MAX_ENTRIES) {
      entries.sort((a, b) => (a[1] < b[1] ? 1 : -1)); // newest first
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries.slice(0, MAX_ENTRIES))));
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // localStorage disabled/full — tracking degrades silently, copying still works
  }
}

/** Record that these feedbacks were just handed to an agent. */
export function markHandedOff(ids: readonly string[]): void {
  if (ids.length === 0) return;
  const map = load();
  const now = new Date().toISOString();
  for (const id of ids) map[id] = now;
  save(map);
}

/** ISO timestamp of the last handoff for this feedback, or null. */
export function getHandedOffAt(id: string): string | null {
  return load()[id] ?? null;
}
