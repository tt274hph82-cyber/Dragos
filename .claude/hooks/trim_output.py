#!/usr/bin/env python3
"""Keep noisy command output short: every error-looking line (up to 40) plus the last 30 lines."""
import re, sys
lines = sys.stdin.read().splitlines()
if len(lines) <= 40:
    print("\n".join(lines)); sys.exit(0)
tail = lines[-30:]
err = re.compile(r"error|fail|traceback|exception|fatal|denied|not found|cannot|panic", re.I)
early = [l for l in lines[:-30] if err.search(l)][:40]
print(f"[trimmed {len(lines) - 30 - len(early)} of {len(lines)} lines by .claude/hooks/trim_output.py]")
if early:
    print("\n".join(early)); print("[... last 30 lines:]")
print("\n".join(tail))
