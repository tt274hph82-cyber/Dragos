/* motion-director theme: STUDIO moves. Load after md.js. Smooth and springy. */
(function () {
  const MD = window.MD;

  // Popped into place: from 0 (or `from`) on a springy overshoot.
  function pop(tl, el, t, o = {}) {
    const { from = 0, dur = 0.45, rot = 0, y = 40 } = o;
    tl.fromTo(el, { scale: from, rotation: rot - 10, y, opacity: 0 }, { scale: 1, rotation: rot, y: 0, opacity: 1, duration: dur, ease: "back.out(1.8)" }, MD.t(t));
  }
  function unpop(tl, el, t, dur = 0.22) {
    tl.to(el, { scale: 0, opacity: 0, duration: dur, ease: "back.in(1.6)" }, MD.t(t));
  }
  // A thick stroke drawing itself on (and optionally off again from its start).
  function swoosh(tl, path, t, dur = 0.6, off) {
    const p = typeof path === "string" ? document.querySelector(path) : path;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len} ${len}`;
    tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, MD.t(t));
    if (off !== undefined) tl.to(p, { strokeDashoffset: -len, duration: dur * 0.8, ease: "power2.in" }, MD.t(off));
  }
  // A selection box drawn from its top-left corner, the way a designer drags it.
  function select(tl, el, t) {
    tl.fromTo(el, { scaleX: 0, scaleY: 0, transformOrigin: "0% 0%", opacity: 1 }, { scaleX: 1, scaleY: 1, duration: 0.32, ease: "power3.out" }, MD.t(t));
  }
  // The cursor: glides along points [{x,y,at}], clicks (a squash) where told.
  function cursor(tl, el, pts) {
    pts.forEach((p, i) => {
      if (i === 0) tl.set(el, { x: p.x, y: p.y, opacity: 1 }, MD.t(p.at));
      else tl.to(el, { x: p.x, y: p.y, duration: p.dur || 0.4, ease: "power3.inOut" }, MD.t(p.at));
      if (p.click) tl.fromTo(el, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, MD.t(p.at) + (p.dur || 0.4));
    });
  }
  // Slow turning sunburst; the whole field turns as one body.
  function turn(tl, el, from, to, degPerSec = 12) {
    const a = MD.t(from), b = MD.t(to);
    tl.fromTo(el, { rotation: 0 }, { rotation: degPerSec * (b - a), duration: b - a, ease: "none" }, a);
  }
  // An organic flower/asterisk blob, seeded: writes the path into an <svg>.
  function blob(svg, o = {}) {
    const { petals = 5, seed = 3, r = 0.42, depth = 0.38 } = o;
    const rnd = MD.rand(seed), n = 160, pts = [];
    const ph = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = r * (1 - depth / 2 + (depth / 2) * Math.cos(petals * a + ph));
      pts.push([50 + 50 * k * Math.cos(a), 50 + 50 * k * Math.sin(a)]);
    }
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.innerHTML = `<path d="M${pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L")} Z"/>`;
  }
  // The specular sweep across a glass front (tweens --sheen).
  function sheen(tl, el, t, dur = 0.9) {
    tl.fromTo(el, { "--sheen": "-40%" }, { "--sheen": "140%", duration: dur, ease: "power2.inOut" }, MD.t(t));
  }

  // .md-line move: data-in="pop@B4", each word popped up 60ms apart.
  MD.ENTER.pop = (tl, el, t) => {
    const w = MD.split(el, "w");
    tl.fromTo(w, { scale: 0.2, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.42, stagger: 0.06, ease: "back.out(2)" }, t);
    return t + 0.42 + 0.06 * (w.length - 1);
  };

  MD.studio = { pop, unpop, swoosh, select, cursor, turn, blob, sheen };
})();
