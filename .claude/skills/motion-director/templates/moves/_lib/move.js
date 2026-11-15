/* motion-director MOVE runtime. Every move loads gsap, then this file, then its own script.
   window.MV gives a move everything it needs to work in any brand, any aspect, and with or
   without its own ground (bg "none" renders transparent for overlays on a talking head).

   MV.v            the variables (brand tokens + move variables + bg + aspect)
   MV.W, MV.H      the frame; MV.u = min(W,H)/1080, size everything in MV.u units
   MV.portrait     true for 9:16 / 4:5
   MV.safe         {top,bottom,left,right} px margins: 9:16 overlays keep clear of the platform UI
                   (290 top, 680 bottom, 192 right); 9:16 full-frame B-roll gets centred symmetric margins
   MV.overlaySafe  the platform-UI zones, for a B-roll move that still wants them
   MV.tl           the paused timeline; MV.done() registers it (call last)
   MV.alpha        true when bg is "none" or a key colour is set: skip grounds, keep shadows soft
   MV.rand(seed)   seeded random, MV.st(d) a stepped ease for on-twos motion (12 fps)
   MV.words(el)    split an element's text into .w spans, returns them
   MV.fit(el, maxW) legacy: shrink until scrollWidth fits (over-shrinks block boxes)
   MV.fitText(el, maxW) shrink an element's font until its TEXT fits maxW px (use this)
   MV.img(src, cls) make an <img> (brand files live under assets/brand/)
*/
(function () {
  const root = document.getElementById("root");
  let hfv = window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables();
  if (!hfv || !Object.keys(hfv).length) {
    // outside the renderer (frame-audit, a browser): the declared defaults, then the vars.json move-render wrote
    hfv = {};
    try { for (const d of JSON.parse(document.documentElement.dataset.compositionVariables || "[]")) hfv[d.id] = d.default; } catch (e) {}
    try { const x = new XMLHttpRequest(); x.open("GET", "vars.json", false); x.send(); if (x.responseText) Object.assign(hfv, JSON.parse(x.responseText)); } catch (e) {}
  }
  const v = Object.assign({}, hfv);
  const W = +root.dataset.width, H = +root.dataset.height;
  const u = Math.min(W, H) / 1080, portrait = H > W;
  // bg "none": transparent (ProRes 4444 / VP9). key "#00FF00": the same overlay on a flat key colour, for editors without alpha (CapCut)
  const key = /^#[0-9a-f]{6}$/i.test(v.key || "") ? v.key : null;
  const alpha = v.bg === "none" || !!key;
  // brand tokens as CSS variables on the root
  const css = { "--accent": v.accent, "--accent2": v.accent2, "--ink": v.ink, "--ground": v.ground, "--surface": v.surface, "--muted": v.muted, "--paper": v.paper,
    "--font-display": `"${v.fontDisplay}", "Archivo Black", sans-serif`, "--font-body": `"${v.fontBody}", "Inter", sans-serif`, "--u": u + "px" };
  for (const k in css) if (css[k]) root.style.setProperty(k, css[k]);
  if (alpha) { const bgc = key || "transparent"; document.documentElement.style.background = bgc; document.body.style.background = bgc; root.style.background = bgc; root.classList.add("is-alpha"); if (key) root.classList.add("is-key"); }
  root.classList.add(portrait ? "is-portrait" : W === H ? "is-square" : "is-landscape");
  // 9:16: the platform's caption, buttons and top bar; elsewhere a 5% margin
  // overlays (alpha) sit over a talking head, so on 9:16 they keep clear of the platform UI (caption, buttons, rail);
  // a full-frame B-roll cutaway is centred in the whole frame instead, with symmetric margins
  const k = W / 1080;
  const overlaySafe = portrait ? { top: 290 * k, bottom: 680 * k, left: 70 * k, right: 192 * k } : { top: H * 0.06, bottom: H * 0.08, left: W * 0.05, right: W * 0.05 };
  const safe = portrait && !alpha ? { top: 240 * k, bottom: 240 * k, left: 80 * k, right: 80 * k } : overlaySafe;
  const tl = gsap.timeline({ paused: true });
  const rand = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  const st = (d) => `steps(${Math.max(1, Math.round(d * 12))})`;
  const words = (el) => { if (typeof el === "string") el = document.querySelector(el); if (el.dataset.split) return [...el.querySelectorAll(".w")];
    const walk = (n) => [...n.childNodes].forEach((c) => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(p)); else { const s = document.createElement("span"); s.className = "w"; s.style.display = "inline-block"; s.textContent = p; f.appendChild(s); } }); c.replaceWith(f); } else if (c.nodeType === 1 && !c.classList.contains("w")) walk(c); });
    walk(el); el.dataset.split = "1"; return [...el.querySelectorAll(".w")]; };
  const fit = (el, maxW, min = 10) => { if (typeof el === "string") el = document.querySelector(el); let fs = parseFloat(getComputedStyle(el).fontSize); el.style.whiteSpace = "nowrap"; while (el.scrollWidth > maxW && fs > min) { fs -= 2; el.style.fontSize = fs + "px"; } return fs; };
  // fitText measures the TEXT (a Range over its contents), not the box, so it works on block, flex and absolute elements.
  // fit (above) compares scrollWidth and over-shrinks text in block boxes; it stays only for moves already tuned on it.
  const fitText = (el, maxW, min = 10) => { if (typeof el === "string") el = document.querySelector(el); let fs = parseFloat(getComputedStyle(el).fontSize); el.style.whiteSpace = "nowrap";
    const r = document.createRange(); const w = () => { r.selectNodeContents(el); return r.getBoundingClientRect().width; };
    while (w() > maxW && fs > min) { fs -= 2; el.style.fontSize = fs + "px"; } return fs; };
  const img = (src, cls) => { const i = document.createElement("img"); i.src = src; if (cls) i.className = cls; i.alt = ""; return i; };
  // 9:16 full-frame B-roll is centred in the frame. move-render.mjs measures the content in a throwaway
  // page (MV.__measure seeks the timeline, so it must never run in the page that renders) and passes the
  // offset back as the variable centreDy; here it is only applied, with no seeking. Ground layers stay put.
  // A move opts out with the variable centre: "off".
  const BG = /^(ground|grain|vig|vignette|bg|backdrop|noise|haze)$/i;
  const fgKids = () => [...root.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE" && !BG.test(el.id) && el.dataset.bg === undefined);
  const measure = () => {
    const D = tl.duration(), fg = fgKids(); if (!D || !fg.length) return null;
    const shown = (el) => { for (let e = el; e && e !== root; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) return false; } return true; };
    let y0 = Infinity, y1 = -Infinity;
    const add = (r) => { if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return; if (r.width > W * 0.96 && r.height > H * 0.9) return; y0 = Math.min(y0, Math.max(0, r.top)); y1 = Math.max(y1, Math.min(H, r.bottom)); };
    const rng = document.createRange();
    const scan = (el) => {
      if (!shown(el)) return;
      const tag = el.tagName;
      if (tag === "IMG" || tag === "svg" || tag === "CANVAS" || tag === "VIDEO") { add(el.getBoundingClientRect()); return; }
      const cs = getComputedStyle(el), bgc = cs.backgroundColor.match(/[\d.]+/g);
      if ((bgc && (bgc.length < 4 || +bgc[3] > 0.15) && cs.backgroundColor !== "rgba(0, 0, 0, 0)") || cs.backgroundImage !== "none") add(el.getBoundingClientRect());
      for (const c of el.childNodes) { if (c.nodeType === 3 && c.textContent.trim()) { rng.selectNodeContents(c); add(rng.getBoundingClientRect()); } else if (c.nodeType === 1) scan(c); }
    };
    for (let p = 0.1; p < 1; p += 0.08) { tl.progress(p); fg.forEach(scan); }
    return isFinite(y0) ? { y0, y1 } : null;
  };
  const applyCentre = () => {
    const dy = +v.centreDy;
    if (!portrait || alpha || String(v.centre) === "off" || !dy) return;
    const fg = fgKids(); if (!fg.length) return;
    const rs = getComputedStyle(root), wrap = document.createElement("div");
    wrap.id = "mv-centre";
    wrap.style.cssText = `position:absolute;inset:0;transform:translateY(${dy.toFixed(1)}px);transform-style:preserve-3d;perspective:${rs.perspective};perspective-origin:${rs.perspectiveOrigin}`;
    root.insertBefore(wrap, fg[0]);
    fg.forEach((el) => wrap.appendChild(el));
  };
  const done = () => { try { applyCentre(); } catch (e) { /* layout stays as authored */ } window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; };
  window.MV = { v, W, H, u, portrait, alpha, safe, overlaySafe, __measure: measure, tl, rand, st, words, fit, fitText, img, done };
})();
