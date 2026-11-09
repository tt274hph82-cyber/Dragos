// One place to change what the video plays.
export const VIDEO = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationSeconds: 23,
  music: null as string | null,
  musicVolume: 0.35,
  narration: "audio/mix.mp3" as string | null, // narration + effects + music, mixed by scripts/audio.py
  narrationVolume: 1,
};
