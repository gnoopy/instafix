import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Tiny JSON-file-backed store for the site's own "문의하기" (contact) form —
 * separate from the product's feedback-widget data, which goes through
 * `@instafix/adapter-*` and `memory-store.ts` instead. No database, no new
 * dependency: just a file under `apps/demo/data/`, created on first write.
 */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "contact-messages.json");

// Serializes reads/writes so concurrent POSTs can't race and clobber each
// other's read-modify-write cycle. Good enough for a low-traffic contact
// form on a single instance — not a substitute for a real database.
let writeQueue: Promise<unknown> = Promise.resolve();

async function readMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContactMessage[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeMessages(messages: ContactMessage[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf-8");
}

export function appendContactMessage(input: { name: string; email: string; message: string }): Promise<ContactMessage> {
  const task = writeQueue.then(async () => {
    const messages = await readMessages();
    const record: ContactMessage = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      message: input.message,
      createdAt: new Date().toISOString(),
    };
    messages.push(record);
    await writeMessages(messages);
    return record;
  });
  // Keep the chain alive even if this write failed — later writes should
  // still be attempted rather than jamming the queue forever.
  writeQueue = task.catch(() => undefined);
  return task;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const messages = await readMessages();
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
