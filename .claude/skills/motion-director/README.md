# motion-director

An agent skill that turns a link or a one-line brief into a branded motion
graphics video (product launch, animated UI demo, channel intro, explainer),
10 to 30 seconds, rendered to MP4 on your own machine.

Give it a URL. It pulls the brand's real logo, colours, fonts and product
screenshots, plans every shot on a beat grid for you to approve, synthesises
an original soundtrack and UI sounds, renders with
[HyperFrames](https://github.com/heygen-com/hyperframes), scores its own
output on six axes and fixes anything under 8, up to three rounds.

No accounts, no API keys, no stock music, nothing uploaded.

## Install

Put this folder in your agent's skills directory, for Claude Code:

```sh
unzip motion-director.zip -d ~/.claude/skills/
```

## Setup (one command)

macOS:

```sh
brew install node ffmpeg && node ~/.claude/skills/motion-director/scripts/check-setup.mjs --fix
```

Linux (Debian/Ubuntu):

```sh
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs ffmpeg && node ~/.claude/skills/motion-director/scripts/check-setup.mjs --fix
```

Windows: install Node 22+ and FFmpeg, then run
`node %USERPROFILE%\.claude\skills\motion-director\scripts\check-setup.mjs --fix`.

`check-setup.mjs` prints what is there and the exact fix for anything that
is not. `--fix` downloads the pinned HyperFrames CLI into the npx cache and
the headless Chrome it renders with. Nothing is installed globally.

| needs | why |
|---|---|
| Node.js 22+ | runs HyperFrames and every script here (no npm dependencies) |
| FFmpeg + FFprobe | encoding, frame extraction, loudness |
| HyperFrames 0.8.188 (via npx) | captures the brand's site, renders the film |
| yt-dlp (optional) | only to download a reference video from a URL |
| Remotion (optional) | only if you already use it; HyperFrames is the default |

## Use

Ask your agent:

> Make a 20 second launch video for https://example.com, 9:16, punchy.

Nine themes ship as recipes, each taken from an approved film (glass world, glass folder, design studio, product UI, logo build, monochrome, retro print, puppet collage, safari collage);
if you do not name one, it shows you a board of all of them and you pick by
looking. Add your own from a few reference links (`references/themes.md`).

It asks up to five short questions, shows you a beat grid (every shot, its
time, what is on screen, the motion and the sound) and **waits for your
approval** before animating anything. Then it renders, shows you the
critique scores each round, and delivers:

```
~/motion-director/projects/<slug>/
  out/<slug>.mp4      the film
  out/LOG.md          total time, render time, API cost, scores per round
  beatgrid.md         the plan you approved
  brand/brand.md      the brand as captured (reused next time)
  film/index.html     the HyperFrames composition, editable
```

Open `film/` in `npx hyperframes preview` to tweak by hand.

## Privacy

HyperFrames is always run with telemetry off, without installing its own
agent skills, and with any cloud vision or HeyGen keys removed from its
environment. Set `MD_ALLOW_CLOUD=1` if you want its paid AI features.

## Licence notes

The soundtrack and sound effects are synthesised from scratch for every film.
The 3D MacBook and iPhone models for device shots are not shipped with the
skill: `device-init.mjs` fetches them from the HyperFrames registry
(`vfx-iphone-device`) into each project at build time, and the device scene
loads three.js and Google's Draco decoder from public CDNs while it renders.
Check the block's licence before commercial use.
Brand logos, fonts and screenshots belong to their owners; the skill captures
them so you can make a film for that brand, not to redistribute them.
