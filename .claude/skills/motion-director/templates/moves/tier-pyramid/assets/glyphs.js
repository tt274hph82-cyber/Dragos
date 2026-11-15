/* (copied from agent-pipeline, plus money and object glyphs) A small set of clean line glyphs (24-unit grid, drawn as SVG strokes) for nodes and tiles.
   GLYPH.svg(name, cls) returns an <svg> string; GLYPH.pick(label, explicit, i) chooses one:
   the explicit name if it is in the set, else a keyword match on the label, else the base set in turn. */
(function () {
  const P = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.6 7.2 12 13l8.4-5.8"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.6"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14.2h.01M12 14.2h.01M16 14.2h.01M8 17.4h.01M12 17.4h.01" stroke-width="2.6"/>',
    doc: '<path d="M6.5 3H14l5 5v11.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3Z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.8h5"/>',
    chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5V14a2.5 2.5 0 0 1-2.5 2.5H10.5L6.5 20v-3.5A2.5 2.5 0 0 1 4 14Z"/><path d="M8.6 10.3h.01M12 10.3h.01M15.4 10.3h.01" stroke-width="2.7"/>',
    code: '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.6 4.8l-3.2 14.4"/>',
    chart: '<path d="M4 20h16"/><path d="M4.5 16.5 9 11.8l3.6 3L19.5 7.5"/><path d="M15 7.5h4.5V12"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.8 15.8 4.7 4.7"/>',
    cart: '<path d="M2.8 4h2.6l2.4 11h10.4l2.4-7.6H6.4"/><circle cx="9.6" cy="19.4" r="1.4"/><circle cx="17" cy="19.4" r="1.4"/>',
    video: '<rect x="2.8" y="6" width="13" height="12" rx="2.6"/><path d="m15.8 10.4 5.2-3v9.2l-5.2-3Z"/>',
    phone: '<rect x="6.8" y="2.5" width="10.4" height="19" rx="2.6"/><path d="M10.8 18.4h2.4"/>',
    bolt: '<path d="M13 2.5 5 13.5h6.5l-1 8L19 10h-6.5Z"/>',
    check: '<path d="m5 12.6 4.8 4.8L19.4 7.6"/>',
    user: '<circle cx="12" cy="8.4" r="3.8"/><path d="M4.6 20.4a7.4 7 0 0 1 14.8 0"/>',
    globe: '<circle cx="12" cy="12" r="8.8"/><path d="M3.2 12h17.6M12 3.2c2.6 2.6 3.8 5.5 3.8 8.8s-1.2 6.2-3.8 8.8c-2.6-2.6-3.8-5.5-3.8-8.8S9.4 5.8 12 3.2Z"/>',
    pen: '<path d="M4 20l1.1-4.6L16 4.5a2.1 2.1 0 0 1 3 3L8.1 18.4Z"/><path d="m14 6.5 3 3"/>',
    image: '<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><circle cx="9" cy="10" r="1.8"/><path d="m21 15.6-4.8-4.8L7 19.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0M12 17.4V21"/>',
    db: '<ellipse cx="12" cy="5.6" rx="7.4" ry="2.6"/><path d="M4.6 5.6v12.8c0 1.4 3.3 2.6 7.4 2.6s7.4-1.2 7.4-2.6V5.6M4.6 12c0 1.4 3.3 2.6 7.4 2.6s7.4-1.2 7.4-2.6"/>',
    target: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><path d="M12 12h.01" stroke-width="3"/>',
    spark: '<path d="M12 3.2c.7 4.6 2.6 6.9 8 8.8-5.4 1.9-7.3 4.2-8 8.8-.7-4.6-2.6-6.9-8-8.8 5.4-1.9 7.3-4.2 8-8.8Z"/>',
    flag: '<path d="M5.5 21V3.8M5.5 4.4h11.8l-2.2 4 2.2 4H5.5"/>',
    send: '<path d="M20.6 3.4 3.4 10.2l7 2.4 2.4 7Z"/><path d="m10.4 12.6 4.6-4.6"/>',
    cut: '<circle cx="6.2" cy="6.8" r="2.7"/><circle cx="6.2" cy="17.2" r="2.7"/><path d="M8.4 8.4 20 17.4M8.4 15.6 20 6.6"/>',
    wave: '<path d="M3.5 12h1.6M7.6 8.2v7.6M11.6 4.6v14.8M15.6 8.8v6.4M19.6 11v2"/>',
    text: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M7 11h4M13.4 11H17M7 15h7"/>',
    crown: '<path d="M3.6 8.2 7.8 12 12 5.2 16.2 12l4.2-3.8-1.7 10.3H5.3Z"/><path d="M5.6 21h12.8"/>',
    bank: '<path d="M3 9.4 12 4l9 5.4Z"/><path d="M5.4 10.6v6.8M9.8 10.6v6.8M14.2 10.6v6.8M18.6 10.6v6.8M3 20.4h18"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V8"/><rect x="4" y="8" width="16.5" height="11.5" rx="2.4"/><path d="M15.4 13.8h1.6"/>',
    coin: '<circle cx="12" cy="12" r="8.6"/><path d="M14.6 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.5 0-2.6.8-2.6 2s1.1 1.7 2.6 2.1 2.6.9 2.6 2.1-1.1 2.1-2.6 2.1c-1.2 0-2.2-.6-2.7-1.5M12 6.2v1.6M12 16.2v1.6"/>',
    home: '<path d="M3.6 11 12 4l8.4 7"/><path d="M5.8 9.4V20h12.4V9.4M10 20v-5.4h4V20"/>',
    car: '<path d="M4 15.6V12l2-4.6A2 2 0 0 1 7.9 6h8.2a2 2 0 0 1 1.9 1.4L20 12v3.6"/><rect x="3" y="11.6" width="18" height="5.4" rx="1.8"/><path d="M5.8 17v2.2M18.2 17v2.2M6.6 14.3h1.4M16 14.3h1.4"/>',
    rocket: '<path d="M12 2.8c3.2 2.3 4.8 5.6 4.6 10.2l-2 3.2H9.4l-2-3.2C7.2 8.4 8.8 5.1 12 2.8Z"/><circle cx="12" cy="9.6" r="1.7"/><path d="M7.6 12.6 4.6 15.6l2.8.6M16.4 12.6l3 3-2.8.6M10.6 19.2 12 21.6l1.4-2.4"/>',
    trophy: '<path d="M7.4 4h9.2v5a4.6 4.6 0 0 1-9.2 0Z"/><path d="M7.4 6H4.4c0 2.6 1.4 4 3.3 4.2M16.6 6h3c0 2.6-1.4 4-3.3 4.2M12 13.6v3.6M8.4 20.4h7.2M9.4 17.2h5.2v3.2H9.4Z"/>',
    gift: '<rect x="3.6" y="8.4" width="16.8" height="4" rx="1"/><path d="M5 12.4V20h14v-7.6M12 8.4V20M12 8.4C10.6 5 7.4 4.4 7.4 6.6c0 1.4 2.4 1.8 4.6 1.8ZM12 8.4c1.4-3.4 4.6-4 4.6-1.8 0 1.4-2.4 1.8-4.6 1.8Z"/>',
    card: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.4"/><path d="M2.8 9.6h18.4M6.4 15h3.6"/>',
    cup: '<path d="M4.6 9h11.6v5.2a4.6 4.6 0 0 1-4.6 4.6H9.2a4.6 4.6 0 0 1-4.6-4.6Z"/><path d="M16.2 10.4h1.4a2.4 2.4 0 0 1 0 4.8h-1.6M8 3.4c-.6.9.6 1.6 0 2.6M11.6 3.4c-.6.9.6 1.6 0 2.6"/>',
    star: '<path d="m12 3.4 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z"/>',
    layers: '<path d="m12 3.4 9 4.8-9 4.8-9-4.8Z"/><path d="m3 12.4 9 4.8 9-4.8M3 16.4l9 4.8 9-4.8"/>',
  };
  const KEYS = [
    [/bank|lender|loan|credit|broker/i, "bank"], [/wallet|you\b|me\b|account|budget/i, "wallet"], [/crown|king|elite|vip|top|premium|max/i, "crown"],
    [/house|home|rent|mortgage|property/i, "home"], [/car\b|vehicle|auto loan/i, "car"], [/rocket|scale|launch/i, "rocket"], [/trophy|win|best|champion|pro\b/i, "trophy"],
    [/gift|bonus|free/i, "gift"], [/card|subscription|monthly|payment/i, "card"], [/coffee|cup|espresso/i, "cup"], [/money|cash|income|revenue|profit|coin|dollar/i, "coin"], [/star|expert|master/i, "star"],
    [/cut|trim|scissor/i, "cut"], [/sound|music|sfx|beat/i, "wave"], [/caption|subtitle|transcri|text|title/i, "text"],
    [/insta|photo|pinterest/i, "image"], [/tiktok/i, "phone"], [/reel|shorts/i, "video"], [/linkedin|facebook|network|community/i, "user"], [/twitter|^x$|thread|bluesky/i, "chat"],
    [/mail|inbox|email|newsletter/i, "mail"], [/calend|schedul|meeting|book/i, "calendar"], [/slack|chat|messag|support|reply|dm\b/i, "chat"],
    [/code|coder|dev|github|build|script|api/i, "code"], [/analy|chart|data|metric|report|stats|growth/i, "chart"], [/research|search|find|web|seo|scout/i, "search"],
    [/cart|shop|store|sales|order|checkout|purchas|buy|pay/i, "cart"], [/video|youtube|film|clip|reel/i, "video"], [/phone|call|sms|mobile/i, "phone"],
    [/edit|draft|writ|copy|pen/i, "pen"], [/doc|note|file|page|brief|summary/i, "doc"], [/design|image|photo|thumb|visual/i, "image"],
    [/voice|audio|podcast|mic/i, "mic"], [/memory|database|crm|db|storage/i, "db"], [/goal|target|aim/i, "target"],
    [/publish|post|send|ship|deliver/i, "send"], [/model|brain|llm|ai\b|prompt|idea/i, "spark"], [/agent|bot|assistant/i, "bolt"], [/done|approv|check|review|qa/i, "check"],
    [/user|client|customer|lead|people|team/i, "user"], [/social|world|global|site/i, "globe"], [/task|plan|stack|layer/i, "layers"], [/launch|fast|auto|trigger|tool|kit/i, "bolt"],
  ];
  const ALT = {pen:"check",doc:"layers",search:"globe",chat:"mail",video:"image",image:"video",user:"globe",chart:"target",code:"bolt",send:"bolt",check:"target",spark:"bolt",mail:"chat",phone:"video",calendar:"check",cart:"bolt",db:"layers",mic:"video",globe:"search",target:"flag",bolt:"spark",layers:"flag",flag:"check"};
  const BASE = ["mail", "calendar", "doc", "chat", "code", "chart", "search", "cart", "video", "phone"];
  // used: a Set shared across one move's nodes, so the fallback never repeats a glyph already on screen
  const pick = (label, explicit, i, used) => {
    const e = String(explicit || "").trim().toLowerCase();
    let k = P[e] ? e : null;
    if (!k) for (const [re, g] of KEYS) if (re.test(String(label || "").trim())) { k = g; break; }
    // two "pen" labels: the second gets a cousin (walk the cousins until one is free)
    if (k && !P[e] && used && used.has(k)) { let c = k; for (let n = 0; n < 6 && used.has(c) && ALT[c]; n++) c = ALT[c]; if (!used.has(c)) k = c; }
    if (!k) { const free = BASE.filter((b) => !used || !used.has(b)); k = (free.length ? free : BASE)[(i || 0) % (free.length || BASE.length)]; }
    if (used) used.add(k);
    return k;
  };
  const svg = (name, cls) => `<svg class="${cls || "gl"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.spark}</svg>`;
  window.GLYPH = { pick, svg, names: Object.keys(P) };
})();
