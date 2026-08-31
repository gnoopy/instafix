#!/bin/bash
# 2층(산출물) 로그가 1층(Skill 호출) 로그 없이 쓰이는 것을 막는 가드 — uiux-automation-quickstart-v5 §18-1
# "스킬 동작 없이 진행되고 skill-invocations.jsonl 에 기록이 안 남는다"의 원인은 훅 고장이 아니라
# Claude 가 Skill 도구를 호출하지 않고 채점 보고서만 직접 쓴 것이었다. 이 훅은 Write/Edit 대상이
# docs/ux-log · docs/ux 의 알려진 보고서 패턴이면, 그 보고서 종류에 필요한 Skill 호출 기록이
# skill-invocations.jsonl 에 있는지 확인하고 없으면 exit 2 로 되돌려 준다.
#
# 패턴별로 요구하는 Skill이 다르다(2026-09-01 수정 — 기존 버전은 모든 패턴에 ux-heuristics 만 검사해
# taste 전용 보고서를 오탐/누락 둘 다로 잘못 처리했다):
#   docs/ux-log/YYYY-MM-DD-<feature>-r<n>.md        → ux-heuristics (finish pass 통합 보고서)
#   docs/ux-log/YYYY-MM-DD-<feature>-r<n>-taste.md  → design-taste-frontend 또는 redesign-existing-projects
#   docs/ux-log/YYYY-MM-DD-release-taste.md         → 〃 (릴리스 taste 스윕, §26-3)
#   docs/ux/hypothesis-taste-read-<feature>.md      → 〃 (taste read)
#   docs/ux/hypothesis-taste-audit-YYYY-MM-DD.md    → 〃 (taste 전 화면 스윕, §15-1)
set -u
input=$(cat)
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$path" ] && exit 0

fname=$(basename "$path")
log="$project_dir/docs/ux-log/skill-invocations.jsonl"

case "$path" in
  */docs/ux-log/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*-r[0-9]*-taste.md)
    day=$(echo "$fname" | cut -c1-10)
    required="design-taste-frontend|redesign-existing-projects"
    label="taste lens 보고서"
    ;;
  */docs/ux-log/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*-r[0-9]*.md)
    day=$(echo "$fname" | cut -c1-10)
    required="ux-heuristics"
    label="finish pass 통합 보고서"
    ;;
  */docs/ux-log/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-release-taste.md)
    day=$(echo "$fname" | cut -c1-10)
    required="design-taste-frontend|redesign-existing-projects"
    label="릴리스 taste 스윕"
    ;;
  */docs/ux/hypothesis-taste-read-*.md|*/docs/ux/hypothesis-taste-audit-*.md)
    day=$(date +%F)
    required="design-taste-frontend|redesign-existing-projects"
    label="taste read/audit 산출물"
    ;;
  *) exit 0 ;;
esac

if ! grep -qE "\"ts\":\"${day}T[^\"]*\",\"skill\":\"(${required})\"" "$log" 2>/dev/null; then
  echo "$fname(${label})이 쓰였지만 ${day} 의 [${required}] Skill 호출 기록이 skill-invocations.jsonl 에 없다. CLAUDE.md UI/UX v5.1 Skill Policy §5 이중 로그 규칙: 보고서를 직접 쓰지 말고 먼저 Skill 도구로 해당 스킬을 호출(1층 로그)한 뒤 산출물(2층)을 저장하라." >&2
  exit 2
fi
exit 0
