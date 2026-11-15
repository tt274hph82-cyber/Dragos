"""Render one motion-director move per narration line (plan.json) in the page brand, 9:16."""
import json, subprocess, sys
MR = '/home/user/Dragos/.claude/skills/motion-director/scripts/move-render.mjs'
only = sys.argv[1:]
for s in json.load(open('plan.json')):
    if only and s['id'] not in only: continue
    r = subprocess.run(['node', MR, '--move', s['move'], '--brand', '../brands/page-growth', '--aspect', '9:16', '--vars', json.dumps(s['vars']), '--out', f"moves/{s['id']}.mp4"], capture_output=True, text=True)
    print(s['id'], s['move'], 'ok' if r.returncode == 0 else 'FAILED\n' + r.stdout[-800:] + r.stderr[-800:], flush=True)
