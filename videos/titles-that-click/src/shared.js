// Shared helpers. Injected into every scene by build.mjs, inside the scene's IIFE,
// after `tl`, `C` (cue start, local s), `E` (cue end, local s) and `D` (scene length) exist.
const q = (sel) => Array.from(document.querySelectorAll(sel));

// Wrap each word of the matched elements in <span class="w"> (keeps nested markup).
function split(sel) {
  q(sel).forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const walk = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else {
              const s = document.createElement("span");
              s.className = "w";
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    };
    walk(el);
  });
}

// Split into letters (for typing).
function letters(sel) {
  q(sel).forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const txt = el.textContent;
    el.textContent = "";
    for (const c of txt) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      el.appendChild(s);
    }
  });
}

const ENTER = {
  blur: [{ opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.22, ease: "power4.out" }],
  fade: [{ opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }],
  rise: [{ opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }],
  drop: [{ opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }],
  pop: [{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }],
  scale: [{ opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }],
  left: [{ opacity: 0, x: -260, filter: "blur(8px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }],
  right: [{ opacity: 0, x: 260, filter: "blur(8px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }],
  up: [{ opacity: 0, y: 260 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }],
};
const EXIT = {
  blur: [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power3.in" }],
  fade: [{ opacity: 1 }, { opacity: 0, duration: 0.25, ease: "power2.in" }],
  up: [{ opacity: 1, y: 0 }, { opacity: 0, y: -90, duration: 0.3, ease: "power3.in" }],
  down: [{ opacity: 1, y: 0 }, { opacity: 0, y: 90, duration: 0.3, ease: "power3.in" }],
  left: [{ opacity: 1, x: 0 }, { opacity: 0, x: -300, duration: 0.3, ease: "power3.in" }],
  right: [{ opacity: 1, x: 0 }, { opacity: 0, x: 300, duration: 0.3, ease: "power3.in" }],
  shrink: [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.85, duration: 0.25, ease: "power3.in" }],
};

function on(sel, t, kind = "blur", extra = {}) {
  const [a, b] = ENTER[kind];
  tl.fromTo(sel, { ...a }, { ...b, ...extra }, t);
}
function off(sel, t, kind = "blur", extra = {}) {
  const [a, b] = EXIT[kind];
  tl.fromTo(sel, { ...a }, { ...b, immediateRender: false, ...extra }, t);
}
// Per-word blur-in (split first). gap in s.
function words(sel, t, gap = 0.067) {
  split(sel);
  tl.set(sel, { opacity: 1 }, t);
  tl.fromTo(
    q(sel).flatMap((el) => Array.from(el.querySelectorAll(".w"))),
    { opacity: 0, filter: "blur(6px)" },
    { opacity: 1, filter: "blur(0px)", duration: 0.13, ease: "power2.out", stagger: gap },
    t,
  );
}
// Per-word light -> full, no movement.
function inkIn(sel, t, gap = 0.09) {
  split(sel);
  tl.set(sel, { opacity: 1 }, t);
  tl.fromTo(
    q(sel).flatMap((el) => Array.from(el.querySelectorAll(".w"))),
    { opacity: 0.18 },
    { opacity: 1, duration: 0.18, ease: "power1.out", stagger: gap },
    t,
  );
}
// Typing, letter by letter.
function type(sel, t, cps = 24) {
  letters(sel);
  tl.set(sel, { opacity: 1 }, t);
  const chars = q(sel).flatMap((el) => Array.from(el.querySelectorAll(".ch")));
  tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 1 / cps }, t);
  return chars.length / cps;
}
// Count a number in el's text.
function count(sel, t, from, to, d = 1.3, fmt = (v) => Math.round(v).toLocaleString("en-US")) {
  const el = document.querySelector(sel);
  const o = { v: from };
  el.textContent = fmt(from);
  tl.fromTo(o, { v: from }, { v: to, duration: d, ease: "power2.out", onUpdate: () => (el.textContent = fmt(o.v)) , immediateRender: false}, t);
}
// Draw an SVG stroke that has pathLength="100".
function draw(sel, t, d = 0.9, ease = "power2.inOut") {
  tl.set(sel, { opacity: 1 }, t);
  tl.fromTo(sel, { strokeDasharray: "100 120", strokeDashoffset: 110 }, { strokeDashoffset: 0, duration: d, ease }, t);
}
// Camera move on a wrapper.
function cam(sel, t, to, d = 1.0, ease = "power2.inOut") {
  tl.to(sel, { ...to, duration: d, ease, immediateRender: false }, t);
}
// A cursor click: move there, press.
function clickAt(sel, t, x, y, d = 0.6) {
  tl.to(sel, { x, y, duration: d, ease: "power3.inOut" }, t);
  tl.to(sel, { scale: 0.86, duration: 0.07, ease: "power1.out", transformOrigin: "10% 5%" }, t + d);
  tl.to(sel, { scale: 1, duration: 0.12, ease: "power1.out" }, t + d + 0.07);
}

// Chapter card: flood wipes in over the previous scene, title lands, wipes away at `out`.
function card(id, out) {
  const c = "#" + id + "-card";
  tl.fromTo(c, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut" }, 0);
  tl.fromTo(c + " .num", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 0.38);
  words(c + " .ttl", 0.5, 0.08);
  tl.fromTo(c, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "power3.inOut", immediateRender: false }, out);
}
// Seeded random (deterministic).
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
// Make n children of `parent` with class and style from fn(k) -> {cls, css, text, id}.
function make(parentSel, n, fn) {
  const p = document.querySelector(parentSel);
  for (let k = 0; k < n; k++) {
    const o = fn(k);
    const el = document.createElement("div");
    el.className = o.cls || "";
    if (o.id) el.id = o.id;
    if (o.text) el.textContent = o.text;
    if (o.html) el.innerHTML = o.html;
    Object.assign(el.style, o.css || {});
    p.appendChild(el);
  }
}
// Slow drift of the four background light blobs across the whole scene (Liquid Glass world).
function lgDrift(id, seed) {
  const R = rng(100 + seed);
  // crisp floating shapes behind the glass, so its transparency reads
  const kinds = ["ring", "sq", "ball", "bar", "ball"];
  const P = rng(500 + seed * 7);
  kinds.forEach((k, n) => {
    const el = document.getElementById(id + "-s" + (n + 1));
    if (!el) return;
    el.className = "sh " + k;
    const sz = k === "bar" ? [380 + P() * 200, 70] : k === "ring" ? [260 + P() * 160, 0] : [110 + P() * 120, 0];
    const w = sz[0], h = sz[1] || w;
    const x0 = 80 + P() * 1650, y0 = 60 + P() * 880;
    Object.assign(el.style, { width: w + "px", height: h + "px", left: x0 - w / 2 + "px", top: y0 - h / 2 + "px" });
    const dx = (P() - 0.5) * 520, dy = (P() - 0.5) * 340, rot = (P() - 0.5) * 120;
    tl.fromTo(el, { x: -dx / 2, y: -dy / 2, rotation: -rot / 2 }, { x: dx / 2, y: dy / 2, rotation: rot / 2, duration: D, ease: "sine.inOut" }, 0);
  });
  [1, 2, 3, 4].forEach((k) => {
    const dx = (R() - 0.5) * 700, dy = (R() - 0.5) * 500;
    tl.fromTo("#" + id + "-b" + k, { x: -dx / 2, y: -dy / 2, scale: 1 }, { x: dx / 2, y: dy / 2, scale: 0.85 + R() * 0.3, duration: D, ease: "sine.inOut" }, 0);
  });
}
// Glass panel in / out.
function gIn(sel, t, from = {}) {
  tl.fromTo(sel, { opacity: 0, y: 60, scale: 0.96, ...from }, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.7, ease: "expo.out" }, t);
}
function gOut(sel, t) {
  tl.to(sel, { opacity: 0, y: -40, scale: 0.97, duration: 0.3, ease: "power3.in" }, t);
}
