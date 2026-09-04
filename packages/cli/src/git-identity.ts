import { execFileSync } from "node:child_process";

/** A developer identity discovered from the local environment. */
export interface GitIdentity {
  name: string;
  email: string;
  /** Where it came from, for the line `init` prints back to the user. */
  source: "gh" | "git";
}

/** Run a command and return trimmed stdout, or null for any failure (missing binary, non-zero exit, timeout). */
function tryRun(file: string, args: string[]): string | null {
  try {
    const out = execFileSync(file, args, {
      encoding: "utf-8",
      timeout: 4000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const trimmed = out.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The developer's own name and email, read from the machine `init` runs on.
 *
 * Tried in order:
 * 1. `gh api user` — the authenticated GitHub account, when the GitHub CLI is
 *    installed and logged in. Preferred because it is the real profile rather
 *    than whatever a repo's local git config happens to say.
 * 2. `git config user.name` / `user.email` — present on essentially every
 *    development machine.
 *
 * Returns null unless BOTH fields are usable: a half-filled identity would
 * make the widget prompt anyway (it requires both), so a partial answer is
 * worse than none — it would look configured while still interrupting.
 *
 * GitHub's `noreply` addresses are kept: they are real, deliverable-by-GitHub
 * addresses and are exactly what a privacy-conscious developer wants recorded.
 */
export function detectGitIdentity(cwd: string = process.cwd()): GitIdentity | null {
  const ghJson = tryRun("gh", ["api", "user", "--jq", "{name: .name, login: .login, email: .email}"]);
  if (ghJson) {
    try {
      const parsed = JSON.parse(ghJson) as { name?: string | null; login?: string | null; email?: string | null };
      const name = parsed.name?.trim() || parsed.login?.trim();
      const email = parsed.email?.trim();
      if (name && email && EMAIL_RE.test(email)) return { name, email, source: "gh" };
    } catch {
      // Unparseable gh output — fall through to git config
    }
  }

  const name = tryRun("git", ["-C", cwd, "config", "user.name"]);
  const email = tryRun("git", ["-C", cwd, "config", "user.email"]);
  if (name && email && EMAIL_RE.test(email)) return { name, email, source: "git" };

  return null;
}
