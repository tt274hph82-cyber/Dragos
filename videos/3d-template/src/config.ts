// One place to change what the video plays.
export const VIDEO = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationSeconds: 12,
  music: "audio/music.mp3" as string | null, // file in public/, or null
  musicVolume: 0.35,
  narration: null as string | null, // e.g. "audio/voice.mp3"
  narrationVolume: 1,
};
