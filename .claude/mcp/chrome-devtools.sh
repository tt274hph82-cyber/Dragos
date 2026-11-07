#!/usr/bin/env bash
# Start the Chrome DevTools MCP server (github.com/ChromeDevTools/chrome-devtools-mcp, pinned).
# Isolated temporary profile, no usage statistics. In the cloud sandbox it uses the preinstalled Chromium, headless.
ARGS=(--isolated --usage-statistics=false)
if [ -x /opt/pw-browsers/chromium ]; then ARGS+=(--headless --executable-path /opt/pw-browsers/chromium); fi
exec npx -y chrome-devtools-mcp@1.12.0 "${ARGS[@]}" "$@"
