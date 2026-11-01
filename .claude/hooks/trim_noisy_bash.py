#!/usr/bin/env python3
"""PreToolUse hook (Bash): wrap installs, builds, renders and test runs so only the last 30 lines plus any error
lines reach the context. Exit codes are kept. Other commands pass through untouched."""
import json, re, shlex, sys, os
data = json.load(sys.stdin)
cmd = (data.get("tool_input") or {}).get("command", "")
NOISY = re.compile(r"\b(npm (ci|install|i|run build|test)|pnpm (i|install|build|test)|yarn( install| build| test)?|pip3? install|apt(-get)? install|"
                   r"remotion render|npx tsc|tsc -p|make\b|cargo (build|test)|go (build|test)|pytest|jest|vitest|mvn|gradle|docker build)\b")
if not cmd or "trim_output.py" in cmd or not NOISY.search(cmd) or data.get("tool_input", {}).get("run_in_background"):
    sys.exit(0)
trim = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".claude/hooks/trim_output.py")
wrapped = f"set -o pipefail; ( {cmd} ) 2>&1 | python3 {shlex.quote(trim)}"
print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                         "updatedInput": {**data["tool_input"], "command": wrapped}}}))
