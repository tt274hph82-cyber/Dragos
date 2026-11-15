/*
 * motion-director runtime for HyperFrames compositions.
 *
 * Load order in index.html: gsap, then assets/beats.js, then this file, then
 * the film's own script. Everything here is a pure function of timeline time:
 * no clocks, no Math.random, no fetches, no infinite repeats. A render seeks
 * the paused timeline frame by frame, so anything else shows up as jitter.
 *
 * What it gives the film:
 *   MD.B(n), MD.bar(n), MD.t("B12+0.1")   beat-grid time, by INDEX, never by
 *                                          adding a rounded beat repeatedly
 *   MD.safe                                safe box for this format, in px
 *   MD.lines(tl)                           every .md-line gets its declared
 *                                          entrance AND exit, or the build throws
 *   MD.camera, MD.cursor, MD.stamp         the moves product films are made of
 *   MD.finish(tl)                          checks every line was wired; the film
 *                                          then registers its own timeline
 */
(function () {
  "use strict";
  const MD = (window.MD = window.MD || {});
  const BEATS = window.MD_BEATS || { bpm: 120, offset: 0, beatsPerBar: 4, cues: {} };

  MD.bpm = BEATS.bpm;
  MD.offset = BEATS.offset || 0;
  MD.spb = 60 / MD.bpm;
  MD.bpb = BEATS.beatsPerBar || 4;
  MD.cues = BEATS.cues || {};

  /** Beat n in seconds. Computed from the index so 32 beats never drift. */
  MD.B = (n) => MD.offset + n * MD.spb;
  /** Downbeat of bar n (bar 0 is the first). */
  MD.bar = (n) => MD.B(n * MD.bpb);

  /**
   * A time spec as written in beatgrid.json and in data-in / data-out:
   *   "B12"  "bar3"  "B12+0.1"  "bar2-0.25"  "4.5"  "drop"  "drop+0.2"
   * Named cues ("drop", "logo") come from beats.js, which synth.mjs writes from
   * the same beatgrid.json, so picture and sound read ONE measurement.
   */
  MD.t = (spec) => {
    if (typeof spec === "number") return spec;
    const s = String(spec).replace(/\s+/g, "");
    if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    // split a trailing +/- offset off a head that is not itself a number
    const m = s.match(/^(.+?)([+-]\d+(?:\.\d+)?)?$/);
    const head = m[1];
    const off = m[2] ? parseFloat(m[2]) : 0;
    let base;
    if (/^B\d+(\.\d+)?$/.test(head)) base = MD.B(parseFloat(head.slice(1)));
    else if (/^bar\d+(\.\d+)?$/.test(head)) base = MD.bar(parseFloat(head.slice(3)));
    else if (Object.prototype.hasOwnProperty.call(MD.cues, head)) base = MD.cues[head];
    else throw new Error(`motion-director: cannot read time "${spec}" (use B12, bar3, 4.5, or a cue name from beatgrid.json)`);
    return +(base + off).toFixed(4);
  };

  /* ---------------------------------------------------------------- format */

  const root = document.querySelector("[data-composition-id]");
  MD.W = root ? +root.dataset.width : 1920;
  MD.H = root ? +root.dataset.height : 1080;
  MD.format = MD.W > MD.H ? "16:9" : MD.W < MD.H ? "9:16" : "1:1";

  // Fractions of the frame kept clear of text. 16:9 and 1:1 are the 90%
  // action-safe box plus breathing room. 9:16 is the platform's own UI: the
  // status bar and search over the top 168px of 1920, the caption, handle and
  // buttons below 1330px, and the action rail down the right edge.
  const SAFE = {
    "16:9": { l: 0.06, r: 0.06, t: 0.08, b: 0.1 },
    "9:16": { l: 0.07, r: 0.15, t: 168 / 1920 + 0.02, b: 1 - 1330 / 1920 },
    "1:1": { l: 0.07, r: 0.07, t: 0.07, b: 0.09 },
  }[MD.format];
  MD.safe = {
    l: Math.round(MD.W * SAFE.l),
    r: Math.round(MD.W * (1 - SAFE.r)),
    t: Math.round(MD.H * SAFE.t),
    b: Math.round(MD.H * (1 - SAFE.b)),
  };
  MD.safe.w = MD.safe.r - MD.safe.l;
  MD.safe.h = MD.safe.b - MD.safe.t;
  MD.safe.cx = Math.round((MD.safe.l + MD.safe.r) / 2);
  MD.safe.cy = Math.round((MD.safe.t + MD.safe.b) / 2);
  if (root) {
    const st = root.style;
    st.setProperty("--W", MD.W + "px");
    st.setProperty("--H", MD.H + "px");
    st.setProperty("--safe-l", MD.safe.l + "px");
    st.setProperty("--safe-r", MD.W - MD.safe.r + "px");
    st.setProperty("--safe-t", MD.safe.t + "px");
    st.setProperty("--safe-b", MD.H - MD.safe.b + "px");
    root.dataset.format = MD.format;
  }

  /* ------------------------------------------------------------ splitting */

  // Wrap every word (or letter) in an inline-block span, walking nested
  // elements so an accent <em> keeps its colour from the first frame: a
  // highlight is typography, drawn at full strength, never an event.
  // the floor text rises from: under the descenders and the glow, never at the line box
  const FLOOR = "inset(-40% -10% -0.42em -10%)";
  function split(el, unit) {
    const key = unit === "c" ? "mdSplitC" : "mdSplitW";
    if (!el.dataset[key]) {
      const walk = (node) => {
        [...node.childNodes].forEach((ch) => {
          if (ch.nodeType === 3) {
            const parts = ch.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(p));
              if (unit === "c") {
                const word = document.createElement("span");
                word.className = "md-w";
                [...p].forEach((c) => {
                  const s = document.createElement("span");
                  s.className = "md-c";
                  s.textContent = c;
                  word.appendChild(s);
                });
                frag.appendChild(word);
              } else {
                const s = document.createElement("span");
                s.className = "md-w";
                s.textContent = p;
                frag.appendChild(s);
              }
            });
            ch.replaceWith(frag);
          } else if (ch.nodeType === 1 && !ch.classList.contains("md-w")) walk(ch);
        });
      };
      walk(el);
      el.dataset[key] = "1";
    }
    return [...el.querySelectorAll(unit === "c" ? ".md-c" : ".md-w")];
  }

  /* ------------------------------------------------------------ entrances */
  // Each returns the time its last element lands. Arrivals take longer than
  // exits and land on a long-tailed ease; a landed line is dead still.
  // `self` entrances animate the line element; the others animate its
  // children and keep the line itself at full opacity.

  const ENTER = {
    // per word: blur 6 -> 0 and opacity 0 -> 1, 0.067s apart, no move
    words(tl, el, t) {
      const w = split(el, "w");
      tl.fromTo(w, { opacity: 0, filter: "blur(6px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.16, stagger: 0.067, ease: "power2.out" }, t);
      return t + 0.16 + 0.067 * (w.length - 1);
    },
    // per word from a faint tone to full ink, no position change
    ink(tl, el, t) {
      const w = split(el, "w");
      tl.fromTo(w, { opacity: 0.16 }, { opacity: 1, duration: 0.12, stagger: 0.085, ease: "none" }, t);
      return t + 0.12 + 0.085 * (w.length - 1);
    },
    // per letter, for a name or a wordmark
    letters(tl, el, t) {
      const c = split(el, "c");
      const gap = Math.min(0.06, 0.7 / Math.max(1, c.length));
      tl.fromTo(c, { opacity: 0, filter: "blur(4px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.14, stagger: gap, ease: "power2.out" }, t);
      return t + 0.14 + gap * (c.length - 1);
    },
    // rises out of an invisible floor. The floor sits 0.42em under the line box,
    // below descenders and a glow (FLOOR); a floor at the box slices them flat.
    rise(tl, el, t) {
      el.style.clipPath = FLOOR;
      const inner = wrapInner(el);
      tl.fromTo(inner, { yPercent: 150 }, { yPercent: 0, duration: 0.55, ease: "expo.out" }, t);
      return t + 0.55;
    },
    // typed one character at a time; the caret blinks a FINITE number of times
    type(tl, el, t, out) {
      const c = split(el, "c");
      const cps = +(el.dataset.cps || 28);
      tl.set(c, { opacity: 0 }, 0);
      c.forEach((ch, i) => tl.set(ch, { opacity: 1 }, t + i / cps));
      const end = t + c.length / cps;
      const caret = document.createElement("span");
      caret.className = "md-caret";
      el.appendChild(caret);
      tl.set(caret, { opacity: 0 }, 0);
      tl.set(caret, { opacity: 1 }, t);
      const stop = out ?? end + 1.5;
      for (let k = end + 0.5, on = false; k < stop; k += 0.5, on = !on) tl.set(caret, { opacity: on ? 1 : 0 }, k);
      return end;
    },
    // one word rolling through options like a slot machine, ~0.1s a roll.
    // Every option is its own span toggled with set(): seek-safe, no tl.call.
    slot(tl, el, t) {
      const opts = (el.dataset.options || "").split("|").filter(Boolean);
      const seq = [...opts, el.textContent.trim()];
      el.textContent = "";
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.clipPath = "inset(0% -60% -0.42em -10%)"; // top hides the drop-in; the floor clears descenders
      const spans = seq.map((w, i) => {
        const s = document.createElement("span");
        s.className = "md-inner";
        s.style.display = "inline-block";
        s.style.whiteSpace = "nowrap";
        if (i < seq.length - 1) Object.assign(s.style, { position: "absolute", left: "0", top: "0" });
        s.textContent = w;
        el.appendChild(s);
        return s;
      });
      spans.forEach((s, i) => {
        const at = t + i * 0.1;
        tl.set(s, { opacity: 0 }, 0);
        tl.fromTo(s, { opacity: 1, yPercent: -60, filter: "blur(4px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.09, ease: "power2.out", immediateRender: false }, at);
        if (i < spans.length - 1) tl.set(s, { opacity: 0 }, at + 0.1);
      });
      return t + (seq.length - 1) * 0.1 + 0.09;
    },
    // a number counting to its value, then STAMPED. It shows nothing until it
    // starts counting: a pre-roll "$0" on screen reads as a real figure.
    count(tl, el, t) {
      const from = +(el.dataset.from || 0);
      const to = +el.dataset.to;
      const dur = +(el.dataset.countDur || 0.9);
      const fmt = el.dataset.fmt || "{n}";
      const dec = +(el.dataset.decimals || 0);
      const show = (v) => fmt.replace("{n}", Number(v).toLocaleString("en-US",
        { minimumFractionDigits: dec, maximumFractionDigits: dec }));
      const box = wrapInner(el);
      const o = { v: from };
      tl.set(box, { opacity: 0 }, 0);
      tl.set(box, { opacity: 1 }, t);
      tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: "power3.out",
        onUpdate: () => { box.textContent = show(o.v); } }, t);
      MD.stamp(tl, box, t + dur);
      box.textContent = show(from);
      return t + dur + 0.2;
    },
    // each word rises out of its own mask with a motion-blur tail
    mask(tl, el, t) {
      const w = split(el, "w");
      w.forEach((x) => { if (!x.parentElement.classList.contains("md-mask")) { const m = document.createElement("span"); m.className = "md-mask"; x.replaceWith(m); m.appendChild(x); } });
      tl.fromTo(w, { yPercent: 160, filter: "blur(6px)" }, { yPercent: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.06, ease: "expo.out" }, t);
      return t + 0.6 + 0.06 * (w.length - 1);
    },
    // each word punches in from big and blurred: the kinetic-type slam
    zoom(tl, el, t) {
      const w = split(el, "w");
      tl.fromTo(w, { opacity: 0, scale: 2.4, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45, stagger: 0.09, ease: "expo.out" }, t);
      return t + 0.45 + 0.09 * (w.length - 1);
    },
    // letters converge from a seeded scatter into the word
    split(tl, el, t) {
      const c = split(el, "c");
      const r = MD.rand(c.length * 7 + 3);
      tl.fromTo(c, { opacity: 0, x: () => (r() - 0.5) * 260, y: () => (r() - 0.5) * 180, rotation: () => (r() - 0.5) * 40, filter: "blur(8px)" },
        { opacity: 1, x: 0, y: 0, rotation: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.012, ease: "expo.out" }, t);
      return t + 0.7 + 0.012 * c.length;
    },
  };
  // these animate the line element itself
  const SELF = {
    line(tl, el, t) {
      tl.fromTo(el, { opacity: 0, filter: "blur(8px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power3.out" }, t);
      return t + 0.2;
    },
    // a hero word or number landing: slightly large, settles, sharpens
    scale(tl, el, t) {
      tl.fromTo(el, { opacity: 0, scale: 1.18, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, t);
      return t + 0.5;
    },
    // NEGATIVE insets on the sides that are not wiping, so nothing outside
    // the box (shadows, descenders) is sliced flat
    wipe(tl, el, t) {
      tl.fromTo(el, { clipPath: "inset(-40% 100% -40% -10%)" },
        { clipPath: "inset(-40% -10% -40% -10%)", duration: 0.45, ease: "power3.inOut" }, t);
      return t + 0.45;
    },
    // on screen from the scene's first frame (an end card the previous shot
    // carried in). Still needs an exit.
    present(tl, el, t) {
      if (t > 0) tl.set(el, { opacity: 0 }, 0);
      tl.set(el, { opacity: 1 }, t);
      return t;
    },
  };
  Object.assign(ENTER, SELF);

  /* ---------------------------------------------------------------- exits */
  // 40-50% shorter than the entrances, one smooth motion, never stop-then-go.
  // fromTo with immediateRender:false so a render that seeks anywhere gets
  // the same frame.

  const X = (tl, target, from, to, t) =>
    tl.fromTo(target, from, { ...to, immediateRender: false }, t);

  const EXIT = {
    zoom(tl, el, t) {
      X(tl, el, { opacity: 1, scale: 1, filter: "blur(0px)" }, { opacity: 0, scale: 1.7, filter: "blur(14px)", duration: 0.25, ease: "power3.in" }, t);
    },
    blur(tl, el, t) {
      X(tl, el, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power2.in" }, t);
    },
    words(tl, el, t) {
      const w = split(el, "w");
      X(tl, w, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(6px)", duration: 0.1, stagger: 0.035, ease: "power2.in" }, t);
    },
    up(tl, el, t) {
      X(tl, el, { yPercent: 0, opacity: 1, filter: "blur(0px)" }, { yPercent: -40, opacity: 0, filter: "blur(6px)", duration: 0.28, ease: "power3.in" }, t);
    },
    down(tl, el, t) {
      if (!el.style.clipPath) el.style.clipPath = FLOOR;
      X(tl, wrapInner(el), { yPercent: 0 }, { yPercent: 150, duration: 0.3, ease: "power3.in" }, t);
    },
    wipe(tl, el, t) {
      X(tl, el, { clipPath: "inset(-40% -10% -40% -10%)" }, { clipPath: "inset(-40% -10% -40% 100%)", duration: 0.28, ease: "power3.in" }, t);
    },
    scale(tl, el, t) {
      X(tl, el, { opacity: 1, scale: 1, filter: "blur(0px)" }, { opacity: 0, scale: 1.08, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, t);
    },
    // gone on a hard cut. Deliberate only when the whole scene cuts there.
    cut(tl, el, t) {
      tl.set(el, { opacity: 0 }, t);
    },
    // stays to the end of the film. Only for the end card's last line.
    end() {},
  };

  function wrapInner(el) {
    if (el.firstElementChild && el.firstElementChild.classList.contains("md-inner") && el.children.length === 1) return el.firstElementChild;
    const inner = document.createElement("span");
    inner.className = "md-inner";
    inner.style.display = "inline-block";
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
    return inner;
  }

  function parseMove(v, what, el) {
    const name = el.id ? "#" + el.id : "." + el.className;
    if (!v) throw new Error(`motion-director: ${name} has no data-${what}. Every text line needs a deliberate entrance AND exit.`);
    const [kind, at] = v.split("@");
    const table = what === "in" ? ENTER : EXIT;
    if (!(kind in table)) throw new Error(`motion-director: data-${what}="${v}" on ${name}: unknown move "${kind}". Use one of ${Object.keys(table).join(", ")}`);
    if (kind !== "end" && at === undefined) throw new Error(`motion-director: data-${what}="${v}" on ${name} needs a time, e.g. ${kind}@B12`);
    return { kind, at: kind === "end" ? null : MD.t(at) };
  }

  // Themes add their own entrances and exits (MD.ENTER.slap = ...), and reuse
  // the word/letter splitter. A theme's moves follow the same contract.
  MD.ENTER = ENTER;
  MD.EXIT = EXIT;
  MD.split = split;

  /**
   * Give every .md-line its entrance and its exit.
   *   <h2 id="hook-l1" class="md-line" data-in="words@B4" data-out="blur@B12">...</h2>
   * A line without both throws, so the rule cannot be forgotten.
   */
  MD.lines = (tl, scope) => {
    const lines = [...(scope || document).querySelectorAll(".md-line")];
    MD._lines = [];
    lines.forEach((el) => {
      if (!el.id) throw new Error("motion-director: every .md-line needs an id (the critique and the sound cues refer to it)");
      const a = parseMove(el.dataset.in, "in", el);
      const b = parseMove(el.dataset.out, "out", el);
      if (b.at !== null && b.at <= a.at) throw new Error(`motion-director: #${el.id} exits at ${b.at}s, at or before its entrance at ${a.at}s`);
      const landed = ENTER[a.kind](tl, el, a.at, b.at);
      if (b.at !== null) {
        if (b.at < landed) console.warn(`motion-director: #${el.id} starts leaving at ${b.at}s before its entrance lands at ${landed.toFixed(2)}s`);
        EXIT[b.kind](tl, el, b.at);
      }
      MD._lines.push({ id: el.id, text: el.textContent.trim(), in: a.kind, at: a.at, landed: +landed.toFixed(3), out: b.kind, outAt: b.at });
    });
    return MD._lines;
  };

  /* --------------------------------------------------------------- moves */

  /** A small settle: 1.12 -> 1, for a number that has stopped or a logo hit. */
  MD.stamp = (tl, el, t, amt = 0.12) => {
    tl.fromTo(el, { scale: 1 + amt }, { scale: 1, duration: 0.35, ease: "expo.out" }, t);
  };

  /**
   * One continuous camera through a world: tween a WRAPPER's x / y / scale,
   * never the timed element itself. keys: [{at:"B8", x, y, scale, dur, ease}]
   * Camera moves ease both ways; a zoom through accelerates.
   */
  MD.camera = (tl, sel, keys) => {
    keys.forEach((k) => {
      const v = {};
      ["x", "y", "scale", "rotation", "xPercent", "yPercent"].forEach((p) => { if (k[p] !== undefined) v[p] = k[p]; });
      tl.to(sel, { ...v, duration: k.dur ?? 0.6, ease: k.ease || "power2.inOut" }, MD.t(k.at));
    });
  };

  /**
   * A big cursor (4-7% of the frame) that enters from off-screen and whose
   * click causes the next thing ON THE SAME FRAME. path: [{at, x, y, click}]
   */
  MD.cursor = (tl, sel, path) => {
    path.forEach((p, i) => {
      const at = MD.t(p.at);
      if (i === 0) tl.set(sel, { x: p.x, y: p.y, opacity: 1 }, at);
      else tl.to(sel, { x: p.x, y: p.y, duration: p.dur ?? 0.45, ease: p.ease || "power3.inOut" }, at - (p.dur ?? 0.45));
      if (p.click) tl.fromTo(sel, { scale: 0.82 }, { scale: 1, duration: 0.16, ease: "power2.out" }, at);
    });
  };

  /* ------------------------------------------------------------ the world */

  /** The specular sweep across a .md-glass / .md-sheen element: light, once. */
  MD.sweep = (tl, sel, t, dur = 0.9) => {
    tl.fromTo(sel, { "--sheen": "-40%" }, { "--sheen": "140%", duration: dur, ease: "power2.inOut", immediateRender: false }, MD.t(t));
  };

  /** A slow drift over a span, as ONE body (the ambient field, a whole rig). */
  MD.drift = (tl, sel, to, from = 0, until) => {
    const a = MD.t(from), b = until === undefined ? (window.MD_BEATS?.length || tl.duration()) : MD.t(until);
    tl.fromTo(sel, { x: 0, y: 0, rotation: 0, scale: 1 }, { ...to, duration: Math.max(0.1, b - a), ease: "sine.inOut" }, a);
  };

  /** Arrive from depth: z -900, tilted, blurred, landing on a long tail. */
  MD.fly = (tl, sel, t, o = {}) => {
    tl.fromTo(sel, { z: o.z ?? -900, y: o.y ?? 140, x: o.x ?? 0, rotationX: o.rx ?? 22, rotationY: o.ry ?? 0, opacity: 0, filter: "blur(14px)" },
      { z: 0, y: 0, x: 0, rotationX: 0, rotationY: 0, opacity: 1, filter: "blur(0px)", duration: o.dur ?? 0.9, stagger: o.stagger ?? 0.08, ease: o.ease || "expo.out" }, MD.t(t));
  };

  /** A whip pan: the outgoing world smears off, the incoming lands sharp. */
  MD.whip = (tl, outSel, inSel, t, dir = 1) => {
    const at = MD.t(t);
    if (outSel) tl.to(outSel, { x: -dir * 700, filter: "blur(26px)", opacity: 0, duration: 0.26, ease: "power3.in" }, at - 0.26);
    tl.fromTo(inSel, { x: dir * 700, filter: "blur(26px)", opacity: 0 }, { x: 0, filter: "blur(0px)", opacity: 1, duration: 0.5, ease: "expo.out" }, at);
  };

  /** Zoom through: the camera dives into the outgoing shot and comes out in the next. */
  MD.zoomThrough = (tl, outSel, inSel, t, origin) => {
    const at = MD.t(t);
    if (origin) tl.set(outSel, { transformOrigin: origin }, at - 0.45);
    tl.to(outSel, { scale: 4, filter: "blur(18px)", opacity: 0, duration: 0.45, ease: "power3.in" }, at - 0.45);
    tl.fromTo(inSel, { scale: 0.55, filter: "blur(16px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.65, ease: "expo.out" }, at - 0.08);
  };

  /** A beat punch: the frame kicks on the beat and settles (camera, not title). */
  MD.punch = (tl, sel, t, amt = 0.045) => {
    tl.fromTo(sel, { scale: 1 + amt }, { scale: 1, duration: 0.32, ease: "expo.out", immediateRender: false }, MD.t(t));
  };

  /** Call fn(time, i) on every beat from a to b (beat indices): events per beat. */
  MD.each = (a, b, fn, step = 1) => { for (let n = a, i = 0; n < b; n += step, i++) fn(MD.B(n), i); };

  /** Deterministic noise for layouts (mulberry32). Never Math.random. */
  MD.rand = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  /**
   * Call after every tween is added, right before the registration line the
   * linter looks for:
   *   MD.finish(tl);
   *   window.__timelines = window.__timelines || {};
   *   window.__timelines["main"] = tl;
   * It records what the critique reads (every line, its moves and times) and
   * fails loudly on a line that never got processed.
   */
  MD.finish = (tl) => {
    const missed = [...document.querySelectorAll(".md-line")].filter((el) => !MD._lines || !MD._lines.find((l) => l.id === el.id));
    if (missed.length) throw new Error(`motion-director: ${missed.length} .md-line element(s) never went through MD.lines(tl): ${missed.map((e) => "#" + e.id).join(", ")}`);
    window.MD_REPORT = { format: MD.format, safe: MD.safe, bpm: MD.bpm, lines: MD._lines || [], duration: tl.duration() };
    tl.seek(0);
    return tl;
  };
})();
