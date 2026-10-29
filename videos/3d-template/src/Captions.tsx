import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";

/**
 * Word-by-word captions from public/captions.json (Remotion Caption format:
 * text, startMs, endMs, timestampMs, confidence). The current word is highlighted.
 */
export const Captions: React.FC<{ file?: string }> = ({ file = "captions.json" }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    fetch(staticFile(file))
      .then((r) => r.json())
      .then((c: Caption[]) => { setCaptions(c); continueRender(handle); })
      .catch(() => { setCaptions([]); continueRender(handle); });
  }, [file, handle]);

  if (!captions) return null;
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
  if (!page) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
      <div style={{ fontFamily: "Inter, Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 64, textAlign: "center", maxWidth: 1500, textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
        {page.tokens.map((t) => {
          const active = ms >= t.fromMs && ms < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#e0a63a" : "#ffffff", whiteSpace: "pre" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
