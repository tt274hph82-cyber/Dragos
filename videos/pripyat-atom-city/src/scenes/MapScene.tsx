import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { geoConicConformal, geoPath, geoGraticule10, geoCircle } from "d3-geo";
import { feature } from "topojson-client";
import world50 from "world-atlas/countries-50m.json";
import world10 from "world-atlas/countries-10m.json";
import { C, mono, serif, BAR } from "../theme";

type LonLat = [number, number];
const W = 1920, H = 1080;

const toFeatures = (topo: any, ids?: string[]) => {
  const fc: any = feature(topo, topo.objects.countries);
  return ids ? fc.features.filter((f: any) => ids.includes(String(f.id))) : fc.features;
};
const UKRAINE = "804", BELARUS = "112", LITHUANIA = "440";

const PLACES: Record<string, LonLat> = {
  Pripyat: [30.05, 51.405], "Chernobyl NPP": [30.1, 51.39], Chernobyl: [30.22, 51.27], Kyiv: [30.52, 50.45],
  Slavutych: [30.76, 51.52], Energodar: [34.65, 47.5], Visaginas: [26.43, 55.6], "Sosnovy Bor": [29.1, 59.9],
  Desnogorsk: [33.28, 54.15], Kurchatov: [35.65, 51.66], Udomlya: [35.0, 57.88], "Polyarnye Zori": [32.5, 67.37],
  Moscow: [37.62, 55.75],
};

type View = { from: [LonLat, LonLat]; to: [LonLat, LonLat]; hi?: boolean; markers: { name: string; kind: "city" | "atom" | "plant" | "focus"; dx?: number; dy?: number }[] };

const VIEWS: Record<string, View> = {
  ukraine: {
    from: [[-8, 36], [52, 66]], to: [[21.5, 44.2], [40.5, 53.3]], hi: false,
    markers: [{ name: "Kyiv", kind: "city", dx: 1, dy: 1 }, { name: "Chernobyl NPP", kind: "focus", dx: -1, dy: -1 }],
  },
  pripyat: {
    from: [[29.55, 51.2], [30.6, 51.6]], to: [[29.8, 51.3], [30.35, 51.5]], hi: true,
    markers: [{ name: "Pripyat", kind: "focus", dx: -1, dy: -1 }, { name: "Chernobyl NPP", kind: "plant", dx: 1, dy: 1 }],
  },
  atomgrads: {
    from: [[16, 42.5], [50, 70]], to: [[18, 43.5], [47, 69]],
    markers: [
      { name: "Pripyat", kind: "focus", dx: -1, dy: 1 }, { name: "Sosnovy Bor", kind: "atom" }, { name: "Desnogorsk", kind: "atom" },
      { name: "Kurchatov", kind: "atom" }, { name: "Energodar", kind: "atom" }, { name: "Visaginas", kind: "atom", dx: -1 },
      { name: "Udomlya", kind: "atom" }, { name: "Polyarnye Zori", kind: "atom" }, { name: "Moscow", kind: "city" },
    ],
  },
  slavutych: {
    from: [[29.1, 50.25], [31.6, 51.95]], to: [[29.35, 50.35], [31.35, 51.85]], hi: true,
    markers: [{ name: "Pripyat", kind: "city", dx: -1, dy: -1 }, { name: "Chernobyl NPP", kind: "plant", dx: -1, dy: 1 }, { name: "Slavutych", kind: "focus" }, { name: "Kyiv", kind: "city" }],
  },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const MapScene: React.FC<{ view: string; highlight?: string[]; danger?: boolean; note?: string; dur: number }> = ({ view, highlight, danger, note, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = VIEWS[view];
  const detailed = v.hi;
  const countries = useMemo(
    () => (detailed ? toFeatures(world10, [UKRAINE, BELARUS]) : toFeatures(world50)),
    [detailed],
  );
  const t = interpolate(f, [0, Math.max(dur, 90)], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const bbox: [LonLat, LonLat] = [
    [lerp(v.from[0][0], v.to[0][0], t), lerp(v.from[0][1], v.to[0][1], t)],
    [lerp(v.from[1][0], v.to[1][0], t), lerp(v.from[1][1], v.to[1][1], t)],
  ];
  const cx = (bbox[0][0] + bbox[1][0]) / 2;
  const proj = geoConicConformal().rotate([-cx, 0]).parallels([bbox[0][1], bbox[1][1]]);
  proj.fitExtent([[60, BAR + 30], [W - 60, H - BAR - 30]], {
    type: "MultiPoint", coordinates: [bbox[0], [bbox[1][0], bbox[0][1]], bbox[1], [bbox[0][0], bbox[1][1]]],
  } as any);
  const path = geoPath(proj);
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const pt = (n: string) => proj(PLACES[n]) as [number, number];
  const zone = view === "slavutych" ? path(geoCircle().center(PLACES["Chernobyl NPP"]).radius(30 / 111)() as any) : null;

  return (
    <AbsoluteFill style={{ background: "#0d1012" }}>
      <svg width={W} height={H} style={{ opacity: fadeIn }}>
        <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="rgba(236,230,218,0.05)" strokeWidth={1} />
        {countries.map((c: any, i: number) => {
          const isUA = String(c.id) === UKRAINE;
          return (
            <path key={i} d={path(c) ?? ""} fill={isUA ? "#2e3433" : "#212629"} stroke={isUA ? "rgba(224,166,58,0.6)" : "rgba(236,230,218,0.28)"} strokeWidth={isUA ? 1.6 : 0.8} />
          );
        })}
        {zone && (
          <path d={zone} fill="rgba(200,64,47,0.12)" stroke={C.red} strokeDasharray="8 6" strokeWidth={2}
            opacity={interpolate(f, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        )}
        {view === "pripyat" && (() => {
          const a = pt("Pripyat"), b = pt("Chernobyl NPP");
          const draw = interpolate(f, [25, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g>
              <line x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], draw)} y2={lerp(a[1], b[1], draw)} stroke={C.paper} strokeWidth={2} strokeDasharray="6 6" />
              <text x={(a[0] + b[0]) / 2 + 20} y={(a[1] + b[1]) / 2 - 18} fill={C.paper} fontFamily={mono} fontSize={30} opacity={draw}>≈ 3 KM</text>
            </g>
          );
        })()}
        {view === "slavutych" && (() => {
          const a = pt("Chernobyl NPP"), b = pt("Slavutych");
          const draw = interpolate(f, [35, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g>
              <line x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], draw)} y2={lerp(a[1], b[1], draw)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="8 6" />
              <text x={(a[0] + b[0]) / 2 + 10} y={(a[1] + b[1]) / 2 + 48} fill={C.amber} fontFamily={mono} fontSize={30} opacity={draw} paintOrder="stroke" stroke="#0d1012" strokeWidth={6}>≈ 50 KM</text>
              {(() => { const z = proj([30.1, 51.39 - 0.3]) as [number, number]; return (
                <text x={z[0]} y={z[1] + 40} textAnchor="middle" fill="#ee6a55" fontFamily={mono} fontSize={26} letterSpacing={3} opacity={draw} paintOrder="stroke" stroke="#0d1012" strokeWidth={6}>30 KM EXCLUSION ZONE</text>
              ); })()}
            </g>
          );
        })()}
        {danger && (() => {
          const b = pt("Chernobyl NPP");
          return [0, 1, 2].map((k) => {
            const ph = ((f + k * 20) % 60) / 60;
            return <circle key={k} cx={b[0]} cy={b[1]} r={20 + ph * 260} fill="none" stroke={C.red} strokeWidth={3} opacity={(1 - ph) * 0.8} />;
          });
        })()}
        {v.markers.map((m, i) => {
          const [x, y] = pt(m.name);
          const s = spring({ frame: f - 12 - i * 5, fps, config: { damping: 14 } });
          const isHi = highlight?.includes(m.name);
          const dimmed = highlight && !isHi && m.kind !== "focus";
          const col = m.kind === "focus" ? C.red : m.kind === "atom" || m.kind === "plant" ? C.amber : C.paper;
          const r = (m.kind === "city" ? 6 : 9) * (isHi ? 1.5 : 1);
          const dx = (m.dx ?? 1) > 0 ? 18 : -18;
          const dy = (m.dy ?? -1) > 0 ? 34 : -14;
          const pulse = isHi || m.kind === "focus" ? 1 + 0.25 * Math.sin(f / 6) : 1;
          return (
            <g key={m.name} opacity={dimmed ? 0.35 : 1}>
              {(isHi || m.kind === "focus") && <circle cx={x} cy={y} r={r * 2.6 * pulse * s} fill="none" stroke={col} strokeWidth={2} opacity={0.6} />}
              {m.kind === "plant" ? (
                <rect x={x - r} y={y - r} width={r * 2 * s} height={r * 2 * s} fill={col} />
              ) : (
                <circle cx={x} cy={y} r={r * s} fill={col} />
              )}
              <text x={x + dx} y={y + dy} textAnchor={dx > 0 ? "start" : "end"} fill={isHi ? C.amber : C.paper}
                fontFamily={mono} fontSize={isHi ? 32 : 25} letterSpacing={2} opacity={s} style={{ textTransform: "uppercase" }}
                paintOrder="stroke" stroke="#0d1012" strokeWidth={6}>
                {m.name}
              </text>
            </g>
          );
        })}
      </svg>
      {view === "atomgrads" && !highlight && (
        <div style={{ position: "absolute", left: 120, top: BAR + 60, fontFamily: serif, color: C.paper, fontSize: 56, opacity: interpolate(f, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          Atomgrads
          <div style={{ fontFamily: mono, fontSize: 22, color: C.dim, letterSpacing: 3, marginTop: 8 }}>SOVIET NUCLEAR CITIES</div>
        </div>
      )}
      {note && (
        <div style={{ position: "absolute", left: 120, top: BAR + 60, fontFamily: mono, color: C.amber, fontSize: 28, letterSpacing: 2, borderLeft: `4px solid ${C.amber}`, paddingLeft: 18, opacity: interpolate(f, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {note.toUpperCase()}
        </div>
      )}
    </AbsoluteFill>
  );
};
