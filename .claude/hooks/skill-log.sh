#!/bin/bash
set -u
input=$(cat)

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
log_dir="$project_dir/docs/ux-log"
ux_dir="$project_dir/docs/ux"
mkdir -p "$log_dir" "$ux_dir"

skill=$(echo "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null)
[ -z "$skill" ] && exit 0

args=$(echo "$input" | jq -r '.tool_input.args // ""' 2>/dev/null | head -c 500)
ts=$(date '+%Y-%m-%dT%H:%M:%S%z')

jq -cn --arg ts "$ts" --arg skill "$skill" --arg args "$args" \
  '{ts: $ts, skill: $skill, args: $args}' >> "$log_dir/skill-invocations.jsonl"

today=$(date +%F)

# ux-heuristics는 평가 산출물 파일이 필요하다.
if [ "$skill" = "ux-heuristics" ]; then
  # (v5.1) 통합 보고서 1개: docs/ux-log/YYYY-MM-DD-<feature>-r<n>.md (구 -heuristics.md 접미사도 허용)
  found=0
  for g in "$log_dir/${today}"-*-r[0-9]*.md "$log_dir/${today}"-*-heuristics.md; do
    if [ -e "$g" ]; then found=1; break; fi
  done
  if [ "$found" -eq 0 ]; then
    echo "ux-heuristics 결과를 docs/ux-log/${today}-<feature>-r<n>.md (통합 보고서) 로 저장하라. 파일 저장 없이 평가 완료를 선언하지 마라." >&2
    exit 2
  fi
fi

# taste 2종은 렌즈 파일이 있어야 하고, 산출물(read 또는 lens)이 파일로 남아야 한다.
case "$skill" in
  design-taste-frontend|redesign-existing-projects)
    if [ ! -f "$ux_dir/taste-lens.md" ]; then
      echo "docs/ux/taste-lens.md 가 없다. taste 는 렌즈 파일을 실행 단위로만 쓴다(quickstart v5 §7A). 먼저 렌즈 파일을 만들어라." >&2
      exit 2
    fi
    # ls 에 글롭 여러 개를 넘기면 하나라도 없을 때 비정상 종료하므로 글롭별로 검사한다.
    found=0
    for g in "$log_dir/${today}"-*-taste.md "$ux_dir"/hypothesis-taste-*.md; do
      if [ -e "$g" ]; then found=1; break; fi
    done
    if [ "$found" -eq 0 ]; then
      echo "taste 산출물을 저장하라: lens → docs/ux-log/${today}-<feature>-r<n>-taste.md, read → docs/ux/hypothesis-taste-read-<feature>.md, 스윕 → docs/ux/hypothesis-taste-audit-<날짜>.md. 코드를 직접 고치지 마라(수정은 Impeccable)." >&2
      exit 2
    fi
    ;;
esac

exit 0
