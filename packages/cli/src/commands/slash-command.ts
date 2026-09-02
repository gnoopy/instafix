import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SLASH_COMMAND = `---
description: InstaFix에 쌓인 UI 피드백을 이 세션으로 가져와 이어서 처리
---

InstaFix 피드백을 현재 세션에서 처리하라.

1. \`npx @instafix/cli prompt --status open\`을 실행해 열린 피드백을 읽어라.
   ("no matching feedbacks"면 그렇게 보고하고 끝내라. $ARGUMENTS 가 있으면
   \`--id $ARGUMENTS\`로 해당 건만 가져와라.)
2. 각 항목을 현재 코드와 대조해 수정하라. Target의 소스 힌트(Component 라인)가
   있으면 그 파일부터, 없으면 셀렉터로 컴포넌트를 찾아라. 애매하면 추측하지
   말고 사용자에게 물어라.
3. 수정하고 검증(관련 테스트)까지 끝낸 항목만
   \`npx @instafix/cli resolve <ID>\`로 닫아라.
4. 처리 결과를 항목별로 요약해 보고하라.
`;

/**
 * Install the `/instafix` slash command into the project's `.claude/commands/`
 * so a developer's ALREADY-RUNNING Claude Code session can pull queued
 * feedback into its current context (mode B of the handoff design) —
 * the counterpart to piping `instafix prompt` into a fresh session.
 * Idempotent: always writes the current template.
 */
export async function installSlashCommand(cwd: string = process.cwd()): Promise<string> {
  const dir = join(cwd, ".claude", "commands");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, "instafix.md");
  await writeFile(filePath, SLASH_COMMAND, "utf8");
  return filePath;
}
