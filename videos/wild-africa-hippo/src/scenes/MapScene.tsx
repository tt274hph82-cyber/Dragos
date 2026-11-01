import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import world50 from "world-atlas/countries-50m.json";
import { C, mono, serif, BAR } from "../theme";

type LonLat = [number, number];
const W = 1920, H = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Countries with wild common hippos today (ISO 3166 numeric), after the IUCN range. Approximate: some hold only a few.
const HIPPO = new Set([
  "024", "204", "072", "854", "108", "120", "140", "148", "178", "180", "384", "748", "231", "266", "270", "288", "324",
  "624", "404", "454", "466", "508", "516", "562", "566", "646", "686", "694", "706", "710", "728", "729", "834", "768",
  "800", "894", "716", "226", "430",
]);
const EGYPT = "818"; // hippos lived along the Nile here until the 19th century

const PLACES: Record<string, LonLat> = {
  Nairobi: [36.82, -1.29], "Masai Mara": [35.1, -1.45], "Lake Victoria": [32.9, -1.2], Serengeti: [34.85, -2.35],
  Egypt: [37.2, 26.8], Kenya: [37.9, 0.2], Tanzania: [35.6, -2.9],
};
// Lake Victoria, a rough outline (world-atlas has no lakes)
const VICTORIA: LonLat[] = [[33.0, 0.4], [34.1, 0.3], [34.15, -0.3], [34.05, -0.75], [33.95, -1.5], [33.6, -2.3], [33.1, -2.6], [32.4, -2.5], [31.8, -2.0], [31.65, -1.0], [31.8, -0.3], [32.4, 0.2]];
const MARA: LonLat[] = [[35.75, -0.55], [35.45, -0.95], [35.2, -1.25], [34.95, -1.45], [34.6, -1.55], [34.3, -1.55], [33.97, -1.5]];

type View = { from: [LonLat, LonLat]; to: [LonLat, LonLat]; markers: { name: string; kind: "city" | "focus" | "label"; dx?: number; dy?: number }[] };
const VIEWS: Record<string, View> = {
  africa: {
    from: [[-22, -38], [55, 39]], to: [[-20, -36], [53, 37]],
    markers: [{ name: "Egypt", kind: "label" }],
  },
  mara: {
    from: [[22, -14], [48, 8]], to: [[32.6, -3.4], [37.6, 0.6]],
    markers: [{ name: "Masai Mara", kind: "focus", dx: 1, dy: 1 }, { name: "Nairobi", kind: "city" }, { name: "Lake Victoria", kind: "label" }, { name: "Serengeti", kind: "city", dx: 1, dy: 1 }, { name: "Kenya", kind: "label" }, { name: "Tanzania", kind: "label" }],
  },
};

export const MapScene: React.FC<{ view: string; highlight?: string[]; danger?: boolean; note?: string; dur: number }> = ({ view, note, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = VIEWS[view];
  const countries = useMemo(() => {
    const fc: any = feature(world50 as any, (world50 as any).objects.countries);
    return fc.features;
  }, []);
  const t = interpolate(f, [0, Math.max(dur * 0.8, 90)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bbox: [LonLat, LonLat] = [
    [lerp(v.from[0][0], v.to[0][0], t), lerp(v.from[0][1], v.to[0][1], t)],
    [lerp(v.from[1][0], v.to[1][0], t), lerp(v.from[1][1], v.to[1][1], t)],
  ];
  const proj = geoMercator();
  proj.fitExtent([[60, BAR + 30], [W - 60, H - BAR - 30]], {
    type: "MultiPoint", coordinates: [bbox[0], [bbox[1][0], bbox[0][1]], bbox[1], [bbox[0][0], bbox[1][1]]],
  } as any);
  const path = geoPath(proj);
  const fadeIn = interpolate(f, [0, 20], [0, 1], clamp);
  const range = view === "africa" ? interpolate(f, [25, 70], [0, 1], clamp) : 0;
  const pt = (n: string) => proj(PLACES[n]) as [number, number];
  const draw = interpolate(f, [30, 90], [0, 1], clamp);
  const riverPts = MARA.map((p) => proj(p) as [number, number]);
  const riverLen = riverPts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - riverPts[i - 1][0], p[1] - riverPts[i - 1][1]) : 0), 0);

  return (
    <AbsoluteFill style={{ background: "#0e1210" }}>
      <svg width={W} height={H} style={{ opacity: fadeIn }}>
        <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="rgba(236,230,218,0.05)" strokeWidth={1} />
        {countries.map((c: any, i: number) => {
          const id = String(c.id);
          const hippo = HIPPO.has(id);
          const fill = hippo ? `rgba(232,162,58,${0.12 + 0.45 * range})` : "#1f2620";
          return <path key={i} d={path(c) ?? ""} fill={view === "africa" ? fill : id === "404" || id === "834" ? "#27302a" : "#1c221d"} stroke="rgba(236,230,218,0.28)" strokeWidth={0.8} />;
        })}
        {view === "africa" && (() => {
          const eg = countries.find((c: any) => String(c.id) === EGYPT);
          return eg ? <path d={path(eg) ?? ""} fill="none" stroke={C.red} strokeWidth={2.5} strokeDasharray="8 6" opacity={interpolate(f, [70, 95], [0, 1], clamp)} /> : null;
        })()}
        {view === "mara" && <path d={"M " + VICTORIA.map((p) => (proj(p) as number[]).join(" ")).join(" L ") + " Z"} fill="#1d3a4a" stroke="#5fb6e8" strokeWidth={1.5} strokeLinejoin="round" />}
        {view === "mara" && riverPts.length > 1 && (
          <path d={"M " + riverPts.map((p) => p.join(" ")).join(" L ")} fill="none" stroke="#5fb6e8" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={riverLen} strokeDashoffset={riverLen * (1 - draw)} />
        )}
        {view === "mara" && (() => {
          const m = riverPts[3];
          return (
            <text x={m[0] - 30} y={m[1] - 40} textAnchor="end" fill="#8fd0f5" fontFamily={mono} fontSize={30} letterSpacing={3} opacity={draw} paintOrder="stroke" stroke="#0e1210" strokeWidth={6}>
              MARA RIVER
            </text>
          );
        })()}
        {v.markers.map((m, i) => {
          const [x, y] = pt(m.name);
          const s = spring({ frame: f - 14 - i * 6, fps, config: { damping: 14 } });
          const col = m.kind === "focus" ? C.amber : C.paper;
          const dx = (m.dx ?? 1) > 0 ? 18 : -18;
          const dy = (m.dy ?? -1) > 0 ? 34 : -14;
          if (m.kind === "label") {
            const egypt = m.name === "Egypt";
            return (
              <text key={m.name} x={x} y={y} textAnchor={egypt ? "start" : "middle"} fill={egypt ? "#ee7a65" : C.paper} fontFamily={mono} fontSize={26} letterSpacing={3}
                opacity={egypt ? interpolate(f, [80, 100], [0, 1], clamp) : s * 0.85} paintOrder="stroke" stroke="#0e1210" strokeWidth={6}>
                {egypt ? "EGYPT: GONE SINCE THE 1800s" : m.name.toUpperCase()}
              </text>
            );
          }
          const pulse = m.kind === "focus" ? 1 + 0.25 * Math.sin(f / 6) : 1;
          return (
            <g key={m.name}>
              {m.kind === "focus" && <circle cx={x} cy={y} r={22 * pulse * s} fill="none" stroke={col} strokeWidth={2} opacity={0.6} />}
              <circle cx={x} cy={y} r={(m.kind === "focus" ? 9 : 6) * s} fill={col} />
              <text x={x + dx} y={y + dy} textAnchor={dx > 0 ? "start" : "end"} fill={col} fontFamily={mono} fontSize={m.kind === "focus" ? 32 : 25}
                letterSpacing={2} opacity={s} style={{ textTransform: "uppercase" }} paintOrder="stroke" stroke="#0e1210" strokeWidth={6}>
                {m.name}
              </text>
            </g>
          );
        })}
      </svg>
      {view === "africa" && (
        <div style={{ position: "absolute", left: 120, top: BAR + 60, fontFamily: serif, color: C.paper, fontSize: 56, opacity: interpolate(f, [30, 50], [0, 1], clamp) }}>
          Where hippos live
          <div style={{ fontFamily: mono, fontSize: 22, color: C.dim, letterSpacing: 3, marginTop: 8 }}>COMMON HIPPOPOTAMUS · HIPPOPOTAMUS AMPHIBIUS</div>
        </div>
      )}
      {note && (
        <div style={{ position: "absolute", left: 120, bottom: BAR + 60, fontFamily: mono, color: C.amber, fontSize: 28, letterSpacing: 2, borderLeft: `4px solid ${C.amber}`, paddingLeft: 18, opacity: interpolate(f, [40, 60], [0, 1], clamp) }}>
          {note.toUpperCase()}
        </div>
      )}
    </AbsoluteFill>
  );
};
