#!/usr/bin/env python3
"""PostToolUse(Bash): trim noisy install/build/test output to the last 30 lines plus earlier error lines."""
import json, re, sys

NOISY = re.compile(r"\b(npm|pnpm|yarn|bun|npx|pip3?|uv|poetry|cargo|go|make|cmake|gradlew?|mvn|pytest|jest|vitest|tsc|docker|apt(-get)?|hyperframes)\b"
                   r".*\b(install|ci|add|build|test|run|render|check|lint|compile|sync|update)\b|\b(pytest|jest|vitest|tsc|make)\b")
ERR = re.compile(r"error|fail|exception|traceback|panic|fatal|✗|ERR!", re.I)
TAIL, MAX_ERR, MIN_LINES = 30, 40, 60

def trim(text):
    lines = (text or "").splitlines()
    if len(lines) <= MIN_LINES:
        return None
    head, tail = lines[:-TAIL], lines[-TAIL:]
    errs = [l for l in head if ERR.search(l)][:MAX_ERR]
    out = [f"[trimmed {len(head)} lines; showing {len(errs)} error lines + last {TAIL}]"]
    out += errs + (["..."] if errs else []) + tail
    return "\n".join(out)

try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
if d.get("tool_name") != "Bash" or not NOISY.search(d.get("tool_input", {}).get("command", "")):
    sys.exit(0)
resp = d.get("tool_response")
if not isinstance(resp, dict):
    sys.exit(0)
new, changed = dict(resp), False
for k in ("stdout", "stderr"):
    t = trim(resp.get(k))
    if t is not None:
        new[k], changed = t, True
if changed:
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse", "updatedToolOutput": new}}))
