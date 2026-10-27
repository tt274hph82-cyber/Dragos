import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { BAR, C, mono, sans, serif } from "../theme";
import credits from "../credits.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fadeUp = (f: number, start: number) => ({
  opacity: interpolate(f, [start, start + 18], [0, 1], clamp),
  transform: `translateY(${interpolate(f, [start, start + 22], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)`,
});

const Dark: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <AbsoluteFill style={{ background: bg ?? "radial-gradient(ellipse at 50% 45%, #1b1d1e 0%, #0a0b0c 75%)", alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);

/* ---------- Title card ---------- */
export const Title: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 20, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile("photos/ferris2.jpg")} style={{
        width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.7) brightness(0.35) contrast(1.1)",
        transform: `scale(${1.05 + f / 3000})`,
      }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
        <div style={{ ...fadeUp(f, 8), fontFamily: mono, fontSize: 26, letterSpacing: 14, color: C.amber }}>COMPANY TOWN</div>
        <div style={{ width: interpolate(f, [20, 55], [0, 520], clamp), height: 1, background: C.paper, margin: "26px 0" }} />
        <div style={{ ...fadeUp(f, 26), fontFamily: serif, fontSize: 170, color: C.paper, letterSpacing: 18, lineHeight: 1 }}>PRIPYAT</div>
        <div style={{ ...fadeUp(f, 50), fontFamily: serif, fontStyle: "italic", fontSize: 50, color: C.paper, opacity: 0.85, marginTop: 22 }}>
          The Soviet Atom-City
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
export const Stat: React.FC<{ value: number; label: string; sub?: string }> = ({ value, label, sub }) => {
  const f = useCurrentFrame();
  const n = interpolate(f, [8, 55], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shown = value >= 1000 ? Math.round(n).toLocaleString("en-US") : Math.round(n).toString();
  return (
    <Dark>
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
export const DateCard: React.FC<{ big: string; sub: string }> = ({ big, sub }) => {
  const f = useCurrentFrame();
  const chars = Math.floor(interpolate(f, [6, 6 + big.length * 2], [0, big.length], clamp));
  return (
    <Dark>
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
export const Statement: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const lines = text.split("\n");
  const step = Math.min(30, (dur * 0.6) / lines.length);
  return (
    <Dark>
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

/* ---------- Company towns triptych ---------- */
export const Companies: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rows = [
    { town: "Hershey", what: "chocolate", where: "Pennsylvania, USA" },
    { town: "Pullman", what: "railway cars", where: "Illinois, USA" },
    { town: "Pripyat", what: "a reactor", where: "Ukrainian SSR" },
  ];
  const step = (dur * 0.55) / 3;
  return (
    <Dark>
      <div style={{ display: "flex", gap: 90 }}>
        {rows.map((r, i) => {
          const last = i === 2;
          return (
            <div key={r.town} style={{ ...fadeUp(f, 8 + i * step), width: 460, textAlign: "center", borderTop: `3px solid ${last ? C.red : C.line}`, paddingTop: 36 }}>
              <div style={{ fontFamily: serif, fontSize: 96, color: last ? C.paper : "rgba(236,230,218,0.75)" }}>{r.town}</div>
              <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 40, color: last ? C.amber : C.dim, marginTop: 10 }}>had {r.what}</div>
              <div style={{ fontFamily: mono, fontSize: 20, color: C.dim, letterSpacing: 3, marginTop: 22, textTransform: "uppercase" }}>{r.where}</div>
            </div>
          );
        })}
      </div>
    </Dark>
  );
};

/* ---------- Blueprint: city designed on paper ---------- */
export const Blueprint: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const draw = (start: number, len = 40) => interpolate(f, [start, start + len], [1, 0], clamp);
  // fan-shaped district layout, like Pripyat's triangular plan
  const blocks: { x: number; y: number; w: number; h: number; r: number }[] = [];
  for (let ring = 0; ring < 4; ring++) {
    for (let k = 0; k < 6 + ring * 2; k++) {
      const ang = (-60 + (120 / (5 + ring * 2)) * k) * (Math.PI / 180);
      const rad = 120 + ring * 85;
      blocks.push({ x: 700 + Math.sin(ang) * rad, y: 640 - Math.cos(ang) * rad, w: 46, h: 22, r: (ang * 180) / Math.PI });
    }
  }
  return (
    <AbsoluteFill style={{ background: C.blueprint }}>
      <svg width={1920} height={1080}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(180,210,240,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
        {/* centre square */}
        <circle cx={700} cy={640} r={70} fill="none" stroke="#cfe3f7" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(5)} />
        {blocks.map((b, i) => (
          <rect key={i} x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} fill="none" stroke="#cfe3f7" strokeWidth={2}
            transform={`rotate(${b.r} ${b.x} ${b.y})`} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(15 + i * 1.6, 20)} />
        ))}
        {/* road to plant */}
        <path d="M 760 650 C 1000 660, 1180 700, 1440 700" fill="none" stroke="#cfe3f7" strokeWidth={3} strokeDasharray="1" pathLength={1} strokeDashoffset={draw(70, 40)} />
        <rect x={1440} y={630} width={220} height={140} fill="none" stroke={C.amber} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(90, 40)} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={1458 + k * 50} y={660} width={36} height={80} fill="none" stroke={C.amber} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(110 + k * 6, 20)} />
        ))}
        <text x={1550} y={810} textAnchor="middle" fill={C.amber} fontFamily={mono} fontSize={24} letterSpacing={3} opacity={interpolate(f, [120, 140], [0, 1], clamp)}>POWER PLANT</text>
        <text x={700} y={215} textAnchor="middle" fill="#cfe3f7" fontFamily={mono} fontSize={24} letterSpacing={3} opacity={interpolate(f, [60, 80], [0, 1], clamp)}>RESIDENTIAL DISTRICTS</text>
        <text x={1100} y={640} textAnchor="middle" fill="#cfe3f7" fontFamily={mono} fontSize={22} letterSpacing={3} opacity={interpolate(f, [100, 120], [0, 1], clamp)}>≈ 3 KM</text>
      </svg>
      <div style={{ position: "absolute", left: 120, top: BAR + 50, fontFamily: mono, color: "#cfe3f7", fontSize: 22, letterSpacing: 4 }}>
        PLAN — NEW TOWN FOR A NUCLEAR POWER STATION · ILLUSTRATIVE
      </div>
    </AbsoluteFill>
  );
};

/* ---------- One employer: hub and houses ---------- */
export const Employer: React.FC<{ fragile?: boolean; label?: string; dur: number }> = ({ fragile, label, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const N = 28;
  const cx = 960, cy = 560;
  const breakAt = dur * 0.45;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #1b1d1e 0%, #0a0b0c 75%)" }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: N }).map((_, i) => {
          const ang = (i / N) * Math.PI * 2;
          const rad = 290 + (i % 3) * 55;
          const x = cx + Math.cos(ang) * rad * 1.35, y = cy + Math.sin(ang) * rad * 0.8;
          const s = spring({ frame: f - 6 - i * 1.5, fps, config: { damping: 16 } });
          const broken = fragile && f > breakAt + (i % 7) * 4;
          const op = broken ? interpolate(f, [breakAt + (i % 7) * 4, breakAt + (i % 7) * 4 + 25], [1, 0.18], clamp) : 1;
          const col = fragile && f > breakAt ? C.red : C.line;
          return (
            <g key={i} opacity={op}>
              <line x1={cx} y1={cy} x2={cx + (x - cx) * s} y2={cy + (y - cy) * s} stroke={col} strokeWidth={1.5} />
              <g transform={`translate(${x} ${y}) scale(${s})`}>
                <path d="M -16 4 L 0 -12 L 16 4 L 16 18 L -16 18 Z" fill="#20252a" stroke={C.paper} strokeWidth={2} />
              </g>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={92 * spring({ frame: f, fps, config: { damping: 12 } })} fill="#0d1012" stroke={fragile && f > breakAt ? C.red : C.amber} strokeWidth={4} />
        <text x={cx} y={cy + 10} textAnchor="middle" fill={C.paper} fontFamily={mono} fontSize={24} letterSpacing={2}>
          {label === "Slavutych" ? "THE PLANT" : "THE PLANT"}
        </text>
      </svg>
      <div style={{ position: "absolute", left: 120, top: BAR + 50, ...fadeUp(f, 20), fontFamily: mono, color: C.dim, fontSize: 22, letterSpacing: 4 }}>
        {label ? label.toUpperCase() + " · " : ""}ONE EMPLOYER → EVERY HOUSEHOLD
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Reactors timeline ---------- */
export const Reactors: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const units = [
    { n: 1, y: "1977" }, { n: 2, y: "1978" }, { n: 3, y: "1981" }, { n: 4, y: "1983" },
    { n: 5, y: "planned" }, { n: 6, y: "planned" },
  ];
  const step = (dur * 0.6) / units.length;
  return (
    <Dark>
      <div style={{ ...fadeUp(f, 0), position: "absolute", top: BAR + 70, fontFamily: mono, fontSize: 24, letterSpacing: 8, color: C.amber }}>CHERNOBYL NUCLEAR POWER PLANT</div>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
        {units.map((u, i) => {
          const s = interpolate(f, [10 + i * step, 30 + i * step], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const planned = u.y === "planned";
          const four = u.n === 4;
          return (
            <div key={u.n} style={{ textAlign: "center", opacity: s }}>
              <div style={{
                width: 190, height: 300 * s, border: `3px ${planned ? "dashed" : "solid"} ${four ? C.red : planned ? C.dim : C.paper}`,
                background: planned ? "transparent" : four ? "rgba(200,64,47,0.18)" : "rgba(236,230,218,0.06)",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
              }}>
                <div style={{ fontFamily: serif, fontSize: 90, color: planned ? C.dim : C.paper, paddingBottom: 20 }}>{u.n}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 26, color: planned ? C.dim : four ? C.red : C.paper, marginTop: 18, letterSpacing: 2, textTransform: "uppercase" }}>{u.y}</div>
            </div>
          );
        })}
      </div>
    </Dark>
  );
};

/* ---------- Clock ---------- */
export const Clock: React.FC<{ time: string; date: string; label: string; count?: boolean; dur: number }> = ({ time, date, label, count, dur }) => {
  const f = useCurrentFrame();
  let shown = time;
  if (count) {
    const h = Math.round(interpolate(f, [5, Math.min(dur * 0.7, 120)], [0, 36], { ...clamp, easing: Easing.inOut(Easing.quad) }));
    shown = `+${String(h).padStart(2, "0")}h`;
  }
  const glow = count ? 0 : 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <Dark bg="#070707">
      <div style={{ textAlign: "center" }}>
        <div style={{ ...fadeUp(f, 0), fontFamily: mono, fontSize: 30, color: C.dim, letterSpacing: 8 }}>{date}</div>
        <div style={{
          fontFamily: mono, fontWeight: 500, fontSize: 260, color: count ? C.paper : C.red, letterSpacing: 10,
          textShadow: count ? "none" : `0 0 ${30 + glow * 30}px rgba(200,64,47,0.55)`, opacity: interpolate(f, [4, 14], [0, 1], clamp),
        }}>
          {shown}
        </div>
        <div style={{ ...fadeUp(f, 24), fontFamily: serif, fontStyle: "italic", fontSize: 54, color: C.paper }}>{label}</div>
      </div>
    </Dark>
  );
};

/* ---------- Buses ---------- */
export const Buses: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const cols = 25, rows = 8;
  const total = cols * rows;
  const shownN = Math.floor(interpolate(f, [8, dur * 0.65], [0, total], clamp));
  const counter = Math.round(interpolate(f, [8, dur * 0.65], [0, 1000], clamp));
  return (
    <Dark>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 150, color: C.paper, lineHeight: 1 }}>{counter.toLocaleString("en-US")}{counter >= 1000 ? "+" : ""}</div>
        <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: 6, color: C.amber, margin: "14px 0 40px" }}>BUSES · 27 APRIL 1986</div>
        <svg width={1500} height={rows * 46}>
          {Array.from({ length: total }).map((_, i) => {
            const x = (i % cols) * 60, y = Math.floor(i / cols) * 46;
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={i < shownN ? 1 : 0.07}>
                <rect x={4} y={6} width={48} height={24} rx={4} fill={i < shownN ? C.paper : C.dim} />
                <rect x={9} y={10} width={9} height={7} fill="#0b0c0d" />
                <rect x={21} y={10} width={9} height={7} fill="#0b0c0d" />
                <rect x={33} y={10} width={9} height={7} fill="#0b0c0d" />
                <circle cx={14} cy={32} r={4} fill="#0b0c0d" stroke={C.paper} strokeWidth={1.5} />
                <circle cx={42} cy={32} r={4} fill="#0b0c0d" stroke={C.paper} strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>
        <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: 3, color: C.dim, marginTop: 18 }}>EACH ICON ≈ 5 BUSES</div>
      </div>
    </Dark>
  );
};

/* ---------- Slavutych districts ---------- */
export const Districts: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const d = [
    ["Tallinn", "Estonia"], ["Riga", "Latvia"], ["Vilnius", "Lithuania"], ["Baku", "Azerbaijan"], ["Yerevan", "Armenia"],
    ["Tbilisi", "Georgia"], ["Moscow", "Russia"], ["Leningrad", "Russia"], ["Belgorod", "Russia"], ["Kyiv", "Ukraine"],
  ];
  const step = (dur * 0.7) / d.length;
  return (
    <Dark>
      <div style={{ ...fadeUp(f, 0), position: "absolute", top: BAR + 70, fontFamily: mono, fontSize: 24, letterSpacing: 8, color: C.amber }}>
        SLAVUTYCH · DISTRICTS BUILT BY SOVIET REPUBLICS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 300px)", gap: "34px 30px", marginTop: 60 }}>
        {d.map(([city, rep], i) => (
          <div key={city} style={{ ...fadeUp(f, 10 + i * step), borderLeft: `3px solid ${C.amber}`, paddingLeft: 22, paddingTop: 6, paddingBottom: 6 }}>
            <div style={{ fontFamily: serif, fontSize: 52, color: C.paper }}>{city}</div>
            <div style={{ fontFamily: mono, fontSize: 18, color: C.dim, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>{rep}</div>
          </div>
        ))}
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
        <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: 10, color: C.amber }}>NEXT EPISODE</div>
        <div style={{ fontFamily: serif, fontSize: 110, color: C.paper, marginTop: 24 }}>Gary, Indiana</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: C.paper, opacity: 0.8, marginTop: 10 }}>The city U.S. Steel built</div>
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
            Photographs are of present-day locations. Maps and diagrams are illustrative. Narration is synthetic.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
