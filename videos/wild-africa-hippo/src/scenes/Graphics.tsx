import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { BAR, C, mono, sans, serif } from "../theme";
import credits from "../credits.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fadeUp = (f: number, start: number) => ({
  opacity: interpolate(f, [start, start + 18], [0, 1], clamp),
  transform: `translateY(${interpolate(f, [start, start + 22], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)`,
});

const Dark: React.FC<{ children: React.ReactNode; bg?: string; photo?: string }> = ({ children, bg, photo }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg ?? "radial-gradient(ellipse at 50% 45%, #1b1d1e 0%, #0a0b0c 75%)", alignItems: "center", justifyContent: "center" }}>
      {photo && (
        <AbsoluteFill>
          <Img src={staticFile(`photos/${photo}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(0.32) saturate(0.9)", transform: `scale(${1.12 + f / 4000})` }} />
        </AbsoluteFill>
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </AbsoluteFill>
  );
};

/* ---------- Title card ---------- */
export const Title: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 20, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile("photos/title_bg.jpg")} style={{
        width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.42) saturate(1.05) contrast(1.05)",
        transform: `scale(${1.05 + f / 3000})`,
      }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
        <div style={{ ...fadeUp(f, 8), fontFamily: mono, fontSize: 26, letterSpacing: 14, color: C.amber }}>WILD AFRICA</div>
        <div style={{ width: interpolate(f, [20, 55], [0, 520], clamp), height: 1, background: C.paper, margin: "26px 0" }} />
        <div style={{ ...fadeUp(f, 26), fontFamily: serif, fontSize: 150, color: C.paper, letterSpacing: 10, lineHeight: 1 }}>THE HIPPO</div>
        <div style={{ ...fadeUp(f, 50), fontFamily: serif, fontStyle: "italic", fontSize: 50, color: C.paper, opacity: 0.85, marginTop: 22 }}>
          Africa's Deadliest Giant
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Chapter card ---------- */
export const Chapter: React.FC<{ num: string; title: string; dur: number }> = ({ num, title, dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 16, dur], [1, 0], clamp);
  return (
    <Dark bg="#080909">
      <div style={{ opacity: out, textAlign: "center" }}>
        <div style={{ ...fadeUp(f, 4), fontFamily: mono, fontSize: 24, letterSpacing: 10, color: C.amber, textTransform: "uppercase" }}>{num}</div>
        <div style={{ width: interpolate(f, [10, 40], [0, 140], clamp), height: 2, background: C.amber, margin: "26px auto" }} />
        <div style={{ ...fadeUp(f, 14), fontFamily: serif, fontSize: 92, color: C.paper }}>{title}</div>
      </div>
    </Dark>
  );
};

/* ---------- Big stat with count-up ---------- */
export const Stat: React.FC<{ value: number; label: string; sub?: string; photo?: string }> = ({ value, label, sub, photo }) => {
  const f = useCurrentFrame();
  const n = interpolate(f, [8, 55], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shown = value >= 1000 ? Math.round(n).toLocaleString("en-US") : Math.round(n).toString();
  return (
    <Dark photo={photo}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...fadeUp(f, 0), fontFamily: serif, fontSize: 260, color: C.paper, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {value >= 1000 ? "~" : ""}{shown}
        </div>
        <div style={{ ...fadeUp(f, 30), fontFamily: sans, fontWeight: 300, fontSize: 46, color: C.paper, marginTop: 20 }}>{label}</div>
        {sub && <div style={{ ...fadeUp(f, 40), fontFamily: mono, fontSize: 22, letterSpacing: 4, color: C.dim, marginTop: 16, textTransform: "uppercase" }}>{sub}</div>}
      </div>
    </Dark>
  );
};

/* ---------- Date card ---------- */
export const DateCard: React.FC<{ big: string; sub: string; photo?: string }> = ({ big, sub, photo }) => {
  const f = useCurrentFrame();
  const chars = Math.floor(interpolate(f, [6, 6 + big.length * 2], [0, big.length], clamp));
  return (
    <Dark photo={photo}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 120, color: C.paper, letterSpacing: 6 }}>
          {big.slice(0, chars)}
          <span style={{ opacity: f % 30 < 15 ? 1 : 0, color: C.amber }}>▍</span>
        </div>
        <div style={{ width: interpolate(f, [30, 60], [0, 900], clamp), height: 1, background: C.line, margin: "30px auto" }} />
        <div style={{ ...fadeUp(f, 40), fontFamily: serif, fontStyle: "italic", fontSize: 48, color: C.paper, opacity: 0.85 }}>{sub}</div>
      </div>
    </Dark>
  );
};

/* ---------- Statement (lines reveal one by one) ---------- */
export const Statement: React.FC<{ text: string; dur: number; photo?: string }> = ({ text, dur, photo }) => {
  const f = useCurrentFrame();
  const lines = text.split("\n");
  const step = Math.min(30, (dur * 0.6) / lines.length);
  return (
    <Dark photo={photo}>
      <div style={{ textAlign: "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ ...fadeUp(f, 6 + i * step), fontFamily: serif, fontSize: lines.length > 1 ? 104 : 120, color: C.paper, lineHeight: 1.25, fontStyle: lines.length === 1 ? "italic" : "normal" }}>
            {l}
          </div>
        ))}
      </div>
    </Dark>
  );
};

/* ---------- List (atomgrad formula) ---------- */
export const ListScene: React.FC<{ title: string; items: string[]; dur: number }> = ({ title, items, dur }) => {
  const f = useCurrentFrame();
  const step = (dur * 0.75) / items.length;
  return (
    <Dark>
      <div style={{ width: 1300 }}>
        <div style={{ ...fadeUp(f, 0), fontFamily: mono, fontSize: 26, letterSpacing: 8, color: C.amber, textTransform: "uppercase", marginBottom: 40 }}>{title}</div>
        {items.map((it, i) => {
          const s = 10 + i * step;
          return (
            <div key={i} style={{ ...fadeUp(f, s), display: "flex", alignItems: "center", gap: 34, padding: "18px 0", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ fontFamily: mono, fontSize: 30, color: C.amber, width: 60 }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: serif, fontSize: 58, color: C.paper }}>{it}</div>
            </div>
          );
        })}
      </div>
    </Dark>
  );
};

/* ---------- End card + credits ---------- */
type Credit = { title: string; artist: string; license: string };
export const End: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const list = credits as Credit[];
  const rollStart = 120;
  const y = interpolate(f, [rollStart, dur], [1080, -list.length * 52 - 200], clamp);
  const cardOp = interpolate(f, [0, 15, rollStart - 15, rollStart], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#070707" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: cardOp }}>
        <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: 10, color: C.amber }}>NEXT ON WILD AFRICA</div>
        <div style={{ fontFamily: serif, fontSize: 110, color: C.paper, marginTop: 24 }}>The Honey Badger</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: C.paper, opacity: 0.8, marginTop: 10 }}>The animal that fears nothing</div>
      </AbsoluteFill>
      {f >= rollStart && (
        <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: 8, color: C.amber, marginBottom: 50 }}>PHOTOGRAPHY · WIKIMEDIA COMMONS</div>
          {list.map((c, i) => (
            <div key={i} style={{ fontFamily: sans, fontSize: 24, color: C.paper, height: 52 }}>
              {c.artist.slice(0, 70)} <span style={{ color: C.dim }}>— {c.license}</span>
            </div>
          ))}
          <div style={{ fontFamily: sans, fontSize: 22, color: C.dim, marginTop: 40, maxWidth: 1200, marginLeft: "auto", marginRight: "auto" }}>
            Maps are approximate. Narration is AI-generated (ElevenLabs).
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
