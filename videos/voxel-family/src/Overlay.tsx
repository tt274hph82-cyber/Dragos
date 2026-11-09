import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "../public/words.json";
import { JOINS, NIGHT, DAWN } from "./story";

// The game layer on top of the 3D world: pop captions (one word, keywords coloured, a name tag on
// dialogue), the PARTY HUD, PLAYER JOINED cards and impact words. Kept inside the Shorts safe zone.
const FONT = "MontserratBlack";
const W = words as { w: string; s: number; e: number; who: string }[];
const COLORS: Record<string, string> = {
  family: "#FFD23F", game: "#5AE8F8", mom: "#C8A8FF", house: "#FFD23F", four: "#4ADE6A", seconds: "#4ADE6A", shoes: "#FF8A5A", clean: "#5AE8F8",
  dad: "#4ADE6A", sword: "#B8E0FF", jokes: "#FFD23F", "square-ade": "#5AE8F8", sister: "#FF8AD0", chicken: "#FFD23F", gerald: "#FFD23F",
  night: "#8A9AFF", monsters: "#FF5A3A", battle: "#FF5A3A", stations: "#FF5A3A", slipper: "#FF8AD0", bad: "#FF5A3A", chickens: "#FFD23F", wins: "#4ADE6A", awesome: "#FFD23F",
};
const NAME: Record<string, [string, string]> = { kid: ["YOU", "#FF5A5A"], mom: ["MOM", "#C8A8FF"], dad: ["DAD", "#4ADE6A"], sis: ["SISTER", "#FF8AD0"] };
const PARTY: [string, string][] = [["YOU", "#E2323A"], ["MOM", "#9A7AD8"], ["DAD", "#3A9A5A"], ["SIS", "#FF8AD0"]];
const clean = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, "");
const pop = (x: number, d = 0.18) => (x <= 0 ? 0 : x >= d ? 1 : 1 + 2.4 * Math.pow(x / d - 1, 3) + 1.4 * Math.pow(x / d - 1, 2));
const stroke = (px: number, c = "#120C18") => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: "stroke fill" as any });
const Bevel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#C6C6C6", border: "6px solid #120C18", boxShadow: "inset 6px 6px 0 #FFFFFF, inset -6px -6px 0 #6A6A72", ...style }}>{children}</div>
);

export const Overlay: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  // the caption: the current word, joined with a following short word
  let i = -1; for (let k = 0; k < W.length; k++) if (W[k].s <= t + 0.02) i = k;
  let cap: { text: string; s: number; who: string } | null = null;
  if (i >= 0 && t < W[i].e + 0.35) {
    let text = W[i].w.replace(/[.,!?]+$/, ""), s = W[i].s;
    if (i > 0 && clean(W[i - 1].w).length <= 2 && W[i].s - W[i - 1].e < 0.25 && W[i - 1].who === W[i].who) { text = W[i - 1].w.replace(/[.,!?]+$/, "") + " " + text; s = W[i - 1].s; }
    cap = { text, s, who: W[i].who };
  }
  const key = cap ? clean(cap.text.split(" ").pop()!) : "";
  const col = COLORS[key] ?? "#FFFFFF";
  const joined = JOINS.filter((j) => t >= j).length;
  const isNight = t >= NIGHT && t < DAWN, won = t >= DAWN;
  const card = JOINS.findIndex((j) => t >= j && t < j + 1.35);
  const cardT = card >= 0 ? t - JOINS[card] : 0;
  const impact = t >= 28.78 && t < 29.4 ? ["BONK!", t - 28.78, "#FF8AD0"] as const : t >= 34.02 && t < 35.0 ? ["VICTORY!", t - 34.02, "#FFD23F"] as const : null;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <style>{`@font-face { font-family: ${FONT}; src: url(${staticFile("fonts/Montserrat-900.woff2")}) format("woff2"); font-weight: 900; }`}</style>
      {/* PARTY HUD */}
      <div style={{ position: "absolute", top: 290, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Bevel style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 26px", transform: `scale(${JOINS.some((j) => t >= j && t < j + 0.25) || Math.abs(t - NIGHT) < 0.25 || Math.abs(t - DAWN) < 0.25 ? 1.1 : 1})` }}>
          <span style={{ fontSize: 40, color: "#3A3A42" }}>{won ? "FAMILY WINS" : isNight ? "NIGHT 1" : "PARTY"}</span>
          {PARTY.map(([n, c], k) => <div key={n} style={{ width: 54, height: 54, background: k <= joined ? c : "#8A8A92", border: "5px solid #120C18", opacity: k <= joined ? 1 : 0.45, boxShadow: "inset 5px 5px 0 rgba(255,255,255,0.35)" }} />)}
          <span style={{ fontSize: 40, color: "#3A3A42" }}>{joined + 1}/4</span>
        </Bevel>
      </div>
      {/* PLAYER JOINED card */}
      {card >= 0 ? (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${cardT > 1.1 ? (cardT - 1.1) * -1600 : 0}px) scale(${cardT < 0.2 ? 2.4 - pop(cardT) * 1.4 : 1}) rotate(-3deg)`, opacity: cardT < 0.06 ? cardT / 0.06 : 1 }}>
          <Bevel style={{ padding: "22px 46px", textAlign: "center" }}>
            <div style={{ fontSize: 46, color: "#3A3A42" }}>PLAYER {card + 2} JOINED</div>
            <div style={{ fontSize: 120, lineHeight: 1.05, color: PARTY[card + 1][1], ...stroke(10) }}>{["MOM", "DAD", "SISTER"][card]}</div>
          </Bevel>
        </div>
      ) : null}
      {/* impact word */}
      {impact ? <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontSize: 150, color: impact[2], ...stroke(14), transform: `scale(${pop(impact[1], 0.15) * 1})  rotate(-6deg)`, textShadow: "10px 10px 0 #120C18" }}>{impact[0]}</div> : null}
      {/* caption */}
      {cap ? (
        <div style={{ position: "absolute", top: 1150, left: 60, right: 60, textAlign: "center" }}>
          {cap.who !== "narrator" ? <div style={{ display: "inline-block", fontSize: 36, color: "#FFFFFF", background: NAME[cap.who][1], border: "5px solid #120C18", padding: "2px 16px", marginBottom: 6 }}>{NAME[cap.who][0]}</div> : null}
          <div style={{ fontSize: 96, color: col, textTransform: "uppercase", ...stroke(12), textShadow: "7px 7px 0 #120C18", transform: `scale(${0.75 + pop(t - cap.s) * 0.25 + (col !== "#FFFFFF" ? 0.08 : 0)})` }}>{cap.text}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
