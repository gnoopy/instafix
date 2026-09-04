import { beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ execFileSync }));

const { detectGitIdentity } = await import("../src/git-identity.js");

/** Route each command to a canned result; anything unrouted throws, as a missing binary would. */
function route(handlers: Record<string, () => string>): void {
  execFileSync.mockImplementation((file: string, args: string[]) => {
    const key = `${file} ${args[0]}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`command not found: ${file}`);
    return handler();
  });
}

describe("detectGitIdentity", () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });

  it("prefers the authenticated GitHub account over the repo's git config", () => {
    route({
      "gh api": () => JSON.stringify({ name: "Ada Lovelace", login: "ada", email: "ada@example.com" }),
      "git -C": () => "should not be reached",
    });
    expect(detectGitIdentity("/repo")).toEqual({ name: "Ada Lovelace", email: "ada@example.com", source: "gh" });
  });

  it("falls back to the login when the GitHub profile has no display name", () => {
    route({ "gh api": () => JSON.stringify({ name: null, login: "ada", email: "ada@example.com" }) });
    expect(detectGitIdentity()?.name).toBe("ada");
  });

  it("falls through to git config when the account hides its email", () => {
    let call = 0;
    execFileSync.mockImplementation((file: string, args: string[]) => {
      if (file === "gh") return JSON.stringify({ name: "Ada", login: "ada", email: null });
      call += 1;
      return args.includes("user.name") ? "Grace Hopper" : "grace@example.com";
    });
    expect(detectGitIdentity()).toEqual({ name: "Grace Hopper", email: "grace@example.com", source: "git" });
    expect(call).toBe(2);
  });

  it("falls through when gh prints something unparseable", () => {
    execFileSync.mockImplementation((file: string, args: string[]) => {
      if (file === "gh") return "not json at all";
      return args.includes("user.name") ? "Grace" : "grace@example.com";
    });
    expect(detectGitIdentity()?.source).toBe("git");
  });

  it("returns null when neither tool is installed", () => {
    route({});
    expect(detectGitIdentity()).toBeNull();
  });

  it("returns null on a half-filled identity — it would make the widget prompt anyway", () => {
    execFileSync.mockImplementation((file: string, args: string[]) => {
      if (file === "gh") throw new Error("no gh");
      return args.includes("user.name") ? "Grace" : "";
    });
    expect(detectGitIdentity()).toBeNull();
  });

  it("rejects a git config email that is not an address", () => {
    execFileSync.mockImplementation((file: string, args: string[]) => {
      if (file === "gh") throw new Error("no gh");
      return args.includes("user.name") ? "Grace" : "not-an-email";
    });
    expect(detectGitIdentity()).toBeNull();
  });
});
