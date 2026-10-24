#!/usr/bin/env bash
# Status line: model · context % · session cost
python3 -c '
import json,sys
d=json.load(sys.stdin)
m=(d.get("model") or {}).get("display_name","?")
p=(d.get("context_window") or {}).get("used_percentage")
c=(d.get("cost") or {}).get("total_cost_usd") or 0
print(f"{m} · ctx {p:.0f}%" if isinstance(p,(int,float)) else f"{m} · ctx ?", f"· ${c:.2f}")'
