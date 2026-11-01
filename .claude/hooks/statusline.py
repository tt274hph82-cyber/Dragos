#!/usr/bin/env python3
"""Status line: model · context used % · session cost. Reads the JSON Claude Code passes on stdin."""
import json, sys
d = json.load(sys.stdin)
model = (d.get("model") or {}).get("display_name") or (d.get("model") or {}).get("id", "?")
cost = (d.get("cost") or {}).get("total_cost_usd")
cw = d.get("context_window") or {}
pct = cw.get("used_percentage")
if pct is None:  # older versions: work it out from the last turn in the transcript
    used, size = 0, cw.get("context_window_size") or 200_000
    try:
        for line in open(d.get("transcript_path", "")):
            u = (json.loads(line).get("message") or {}).get("usage")
            if u:
                used = u.get("input_tokens", 0) + u.get("cache_read_input_tokens", 0) + u.get("cache_creation_input_tokens", 0)
        pct = 100 * used / size
    except Exception:
        pct = None
ctx = f"{pct:.0f}%" if pct is not None else "?"
print(f"{model} · ctx {ctx} · ${cost:.2f}" if cost is not None else f"{model} · ctx {ctx}")
