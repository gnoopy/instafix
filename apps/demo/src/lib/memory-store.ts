import { MemoryStore } from "@instafix/adapter-memory";
import { seedDemoStore } from "./seed";

const RESET_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Singleton — survives Next.js hot reloads in dev
const g = globalThis as typeof globalThis & { __instafixStore?: MemoryStore };
if (!g.__instafixStore) {
  const store = new MemoryStore();
  g.__instafixStore = store;
  void seedDemoStore(store);
  setInterval(() => {
    store.clear();
    void seedDemoStore(store);
  }, RESET_INTERVAL_MS);
}

export const memoryStore = g.__instafixStore;
