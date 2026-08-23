(() => {
  const COLORS = [
    { id: "black", value: "#111111" },
    { id: "navy", value: "#173a6b" },
    { id: "orange", value: "#e8590c" },
    { id: "red", value: "#c92a2a" },
    { id: "green", value: "#1b5e3b" },
  ];

  const DOT_SHAPES = [
    { id: "square", label: "Square" },
    { id: "rounded", label: "Rounded" },
    { id: "fluid", label: "Fluid" },
    { id: "dots", label: "Dots" },
    { id: "heart", label: "Heart" },
    { id: "star", label: "Star" },
    { id: "diamond", label: "Diamond" },
    { id: "plus", label: "Plus" },
    { id: "hexagon", label: "Hexagon" },
    { id: "triangle", label: "Triangle" },
  ];

  const EYE_SHAPES = [
    { id: "square", label: "Square" },
    { id: "rounded", label: "Rounded" },
    { id: "circle", label: "Circle" },
    { id: "heart", label: "Heart" },
    { id: "star", label: "Star" },
    { id: "diamond", label: "Diamond" },
  ];

  const QR_TYPES = {
    url: {
      label: "Enter or paste URL:",
      placeholder: "https://yourwebsite.com",
      hint: "Your QR code will open this website.",
    },
    text: {
      label: "Enter text:",
      placeholder: "Type a message or note",
      hint: "Your QR code will show this text when scanned.",
    },
    email: {
      label: "Email address:",
      placeholder: "hello@example.com",
      hint: "Scanning opens a new email to this address.",
    },
    phone: {
      label: "Phone number:",
      placeholder: "+1 555 123 4567",
      hint: "Scanning starts a phone call.",
    },
    sms: {
      label: "Phone number for SMS:",
      placeholder: "+1 555 123 4567",
      hint: "Scanning opens a text message to this number.",
    },
    whatsapp: {
      label: "WhatsApp number:",
      placeholder: "15551234567",
      hint: "Use country code and number, no + or spaces.",
    },
    wifi: {
      label: "Wi-Fi login",
      placeholder: "",
      hint: "Guests can join this Wi-Fi by scanning.",
    },
    instagram: {
      label: "Instagram username:",
      placeholder: "username",
      hint: "Opens this Instagram profile.",
    },
    youtube: {
      label: "YouTube URL:",
      placeholder: "https://youtube.com/watch?v=",
      hint: "Opens this YouTube video or channel.",
    },
    maps: {
      label: "Maps or review URL:",
      placeholder: "https://maps.google.com/ or your Google review link",
      hint: "Opens Maps, a listing, or a Google review form.",
    },
  };

  const state = {
    type: "url",
    text: "https://example.com",
    wifiSsid: "",
    wifiPass: "",
    wifiEnc: "WPA",
    dot: "dots",
    eyeBorder: "circle",
    eyeCenter: "circle",
    fg: "#111111",
    bg: "#ffffff",
    transparent: false,
    format: "png",
  };

  const els = {
    preview: document.getElementById("qr-preview"),
    frame: document.getElementById("qr-frame"),
    type: document.getElementById("qr-type"),
    text: document.getElementById("qr-text"),
    textLabel: document.getElementById("qr-text-label"),
    hint: document.getElementById("url-hint"),
    standard: document.getElementById("standard-fields"),
    wifi: document.getElementById("wifi-fields"),
    wifiSsid: document.getElementById("wifi-ssid"),
    wifiPass: document.getElementById("wifi-pass"),
    wifiEnc: document.getElementById("wifi-enc"),
    format: document.getElementById("file-format"),
    customFg: document.getElementById("custom-fg"),
    customBg: document.getElementById("custom-bg"),
    transparent: document.getElementById("transparent-bg"),
    download: document.getElementById("download-btn"),
    copy: document.getElementById("copy-btn"),
    dots: document.getElementById("dot-styles"),
    borders: document.getElementById("eye-borders"),
    centers: document.getElementById("eye-centers"),
    swatches: document.getElementById("color-swatches"),
  };

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function digits(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function wifiEscape(value) {
    return String(value || "").replace(/([\\;,:"])/g, "\\$1");
  }

  function payload() {
    const value = (state.text || "").trim();
    switch (state.type) {
      case "email":
        return value.startsWith("mailto:") ? value : `mailto:${value}`;
      case "phone":
        return `tel:${value.replace(/\s/g, "")}`;
      case "sms":
        return `sms:${value.replace(/\s/g, "")}`;
      case "whatsapp":
        return `https://wa.me/${digits(value)}`;
      case "instagram":
        return `https://instagram.com/${value.replace(/^@/, "")}`;
      case "wifi":
        return `WIFI:T:${state.wifiEnc};S:${wifiEscape(state.wifiSsid)};P:${wifiEscape(state.wifiPass)};;`;
      default:
        return value || "https://example.com";
    }
  }

  function fileBase() {
    if (state.type === "wifi") return "wifi-qr-code";
    try {
      const source = payload();
      const url = new URL(source.startsWith("http") ? source : `https://${source}`);
      const host = url.hostname.replace(/^www\./, "").replace(/\./g, "-");
      return host || "qr-code";
    } catch {
      return "qr-code";
    }
  }

  function applyType(type, fill) {
    state.type = type;
    els.type.value = type;
    const meta = QR_TYPES[type];
    const isWifi = type === "wifi";
    els.standard.hidden = isWifi;
    els.wifi.hidden = !isWifi;
    if (meta && !isWifi) {
      els.textLabel.textContent = meta.label;
      els.text.placeholder = meta.placeholder;
    }
    if (typeof fill === "string") {
      els.text.value = fill;
      state.text = fill.trim() || (type === "url" ? "https://example.com" : fill);
    }
    els.hint.textContent = meta ? meta.hint : "";
    render();
  }

  function makeMatrix(text) {
    const qr = qrcode(0, "H");
    qr.addData(text || "https://example.com");
    qr.make();
    const n = qr.getModuleCount();
    const matrix = [];
    for (let r = 0; r < n; r += 1) {
      matrix[r] = [];
      for (let c = 0; c < n; c += 1) matrix[r][c] = qr.isDark(r, c);
    }
    return matrix;
  }

  function inFinder(n, r, c) {
    return (
      (r < 7 && c < 7) ||
      (r < 7 && c >= n - 7) ||
      (r >= n - 7 && c < 7)
    );
  }

  function neighbors(matrix, r, c) {
    const n = matrix.length;
    const dark = (rr, cc) =>
      rr >= 0 && cc >= 0 && rr < n && cc < n && matrix[rr][cc] && !inFinder(n, rr, cc);
    return {
      t: dark(r - 1, c),
      r: dark(r, c + 1),
      b: dark(r + 1, c),
      l: dark(r, c - 1),
    };
  }

  function roundedRect(x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
  }

  function fluidModule(x, y, s, n) {
    const rad = s * 0.5;
    const tl = !n.t && !n.l ? rad : 0;
    const tr = !n.t && !n.r ? rad : 0;
    const br = !n.b && !n.r ? rad : 0;
    const bl = !n.b && !n.l ? rad : 0;
    return `M ${x + tl} ${y} H ${x + s - tr} Q ${x + s} ${y} ${x + s} ${y + tr} V ${y + s - br} Q ${x + s} ${y + s} ${x + s - br} ${y + s} H ${x + bl} Q ${x} ${y + s} ${x} ${y + s - bl} V ${y + tl} Q ${x} ${y} ${x + tl} ${y} Z`;
  }

  function heartPath(cx, cy, w, h) {
    return `M ${cx} ${cy + h * 0.32}
      C ${cx - w * 0.05} ${cy + h * 0.12}, ${cx - w * 0.52} ${cy + h * 0.06}, ${cx - w * 0.52} ${cy - h * 0.16}
      C ${cx - w * 0.52} ${cy - h * 0.46}, ${cx - w * 0.18} ${cy - h * 0.52}, ${cx} ${cy - h * 0.22}
      C ${cx + w * 0.18} ${cy - h * 0.52}, ${cx + w * 0.52} ${cy - h * 0.46}, ${cx + w * 0.52} ${cy - h * 0.16}
      C ${cx + w * 0.52} ${cy + h * 0.06}, ${cx + w * 0.05} ${cy + h * 0.12}, ${cx} ${cy + h * 0.32} Z`;
  }

  function starPath(cx, cy, outer, inner, points = 5) {
    const pts = [];
    for (let i = 0; i < points * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return `${pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} Z`;
  }

  function diamondPath(cx, cy, w, h) {
    return `M ${cx} ${cy - h} L ${cx + w} ${cy} L ${cx} ${cy + h} L ${cx - w} ${cy} Z`;
  }

  function plusPath(cx, cy, s) {
    const arm = s * 0.32;
    const half = s / 2;
    return `M ${cx - arm} ${cy - half} H ${cx + arm} V ${cy - arm} H ${cx + half} V ${cy + arm} H ${cx + arm} V ${cy + half} H ${cx - arm} V ${cy + arm} H ${cx - half} V ${cy - arm} H ${cx - arm} Z`;
  }

  function hexagonPath(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i += 1) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return `${pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} Z`;
  }

  function trianglePath(cx, cy, s) {
    const h = s * 0.92;
    return `M ${cx} ${cy - h / 2} L ${cx + s / 2} ${cy + h / 2} L ${cx - s / 2} ${cy + h / 2} Z`;
  }

  function modulePath(style, x, y, s, n) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    switch (style) {
      case "square":
        return `M ${x} ${y} h ${s} v ${s} h ${-s} Z`;
      case "rounded":
        return roundedRect(x + s * 0.06, y + s * 0.06, s * 0.88, s * 0.88, s * 0.28);
      case "fluid":
        return fluidModule(x, y, s, n);
      case "dots":
        return `<circle cx="${cx}" cy="${cy}" r="${s * 0.38}" />`;
      case "heart":
        return heartPath(cx, cy, s * 0.92, s * 0.92);
      case "star":
        return starPath(cx, cy, s * 0.46, s * 0.2);
      case "diamond":
        return diamondPath(cx, cy, s * 0.42, s * 0.42);
      case "plus":
        return plusPath(cx, cy, s * 0.86);
      case "hexagon":
        return hexagonPath(cx, cy, s * 0.42);
      case "triangle":
        return trianglePath(cx, cy, s * 0.84);
      default:
        return `M ${x} ${y} h ${s} v ${s} h ${-s} Z`;
    }
  }

  function wrapModule(style, d, fill) {
    if (style === "dots") return d.replace("<circle", `<circle fill="${fill}"`);
    return `<path fill="${fill}" d="${d}" />`;
  }

  function ringPath(kind, cx, cy, outer, inner) {
    const outerD = shapeOutline(kind, cx, cy, outer);
    const innerD = shapeOutline(kind, cx, cy, inner);
    return `${outerD} ${innerD}`;
  }

  function shapeOutline(kind, cx, cy, r) {
    switch (kind) {
      case "circle":
        return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
      case "square":
        return roundedRect(cx - r, cy - r, r * 2, r * 2, 0);
      case "rounded":
        return roundedRect(cx - r, cy - r, r * 2, r * 2, r * 0.28);
      case "heart":
        return heartPath(cx, cy + r * 0.04, r * 2.05, r * 2.05);
      case "star":
        return starPath(cx, cy, r, r * 0.42);
      case "diamond":
        return diamondPath(cx, cy, r, r);
      default:
        return roundedRect(cx - r, cy - r, r * 2, r * 2, 0);
    }
  }

  function renderSvg(matrix, options) {
    const { fg, bg, transparent, dot, eyeBorder, eyeCenter, moduleSize = 16, margin = 4 } = options;
    const n = matrix.length;
    const size = (n + margin * 2) * moduleSize;
    const fill = escapeXml(fg);
    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    ];
    if (!transparent) {
      parts.push(`<rect width="100%" height="100%" fill="${escapeXml(bg)}" />`);
    }

    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (!matrix[r][c] || inFinder(n, r, c)) continue;
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        const d = modulePath(dot, x, y, moduleSize, neighbors(matrix, r, c));
        parts.push(wrapModule(dot, d, fill));
      }
    }

    const eyes = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    eyes.forEach(([er, ec]) => {
      const x = (ec + margin) * moduleSize;
      const y = (er + margin) * moduleSize;
      const cx = x + moduleSize * 3.5;
      const cy = y + moduleSize * 3.5;
      parts.push(
        `<path fill="${fill}" fill-rule="evenodd" d="${ringPath(
          eyeBorder,
          cx,
          cy,
          moduleSize * 3.15,
          moduleSize * 2.15
        )}" />`
      );
      parts.push(`<path fill="${fill}" d="${shapeOutline(eyeCenter, cx, cy, moduleSize * 1.2)}" />`);
    });

    parts.push("</svg>");
    return parts.join("");
  }

  function iconSvg(kind) {
    const common = 'viewBox="0 0 24 24" fill="currentColor"';
    const map = {
      square: `<svg ${common}><rect x="5" y="5" width="14" height="14" /></svg>`,
      rounded: `<svg ${common}><rect x="5" y="5" width="14" height="14" rx="4" /></svg>`,
      fluid: `<svg ${common}><path d="M6 8c0-2 1.5-3 3.5-3h2.2c2 0 2.8 1.4 2.8 3v2.4c0 1.2.8 2.1 2 2.1h1.2c1.8 0 2.8 1.3 2.8 3.1 0 2.1-1.6 3.4-3.6 3.4H9.2C6.6 19 5 17.2 5 14.6V8z" /></svg>`,
      dots: `<svg ${common}><circle cx="12" cy="12" r="7" /></svg>`,
      circle: `<svg ${common}><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`,
      heart: `<svg ${common}><path d="M12 20s-7-4.4-7-9.1C5 8 6.8 6.4 9 6.4c1.3 0 2.4.7 3 1.7.6-1 1.7-1.7 3-1.7 2.2 0 4 1.6 4 4.5C19 15.6 12 20 12 20z" /></svg>`,
      star: `<svg ${common}><path d="M12 3.6 14.4 9l6 .6-4.5 3.9 1.4 5.8L12 16.6 6.7 19.3l1.4-5.8L3.6 9.6l6-.6z" /></svg>`,
      diamond: `<svg ${common}><path d="M12 3.5 20.5 12 12 20.5 3.5 12z" /></svg>`,
      plus: `<svg ${common}><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" /></svg>`,
      hexagon: `<svg ${common}><path d="M12 3.2 19.4 7.4v9.2L12 20.8 4.6 16.6V7.4z" /></svg>`,
      triangle: `<svg ${common}><path d="M12 4.2 20.5 19.2H3.5z" /></svg>`,
    };
    if (kind === "circle-fill") {
      return `<svg ${common}><circle cx="12" cy="12" r="6" /></svg>`;
    }
    return map[kind] || map.square;
  }

  function mountChoices(root, items, key, iconFor) {
    root.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shape-btn";
      btn.dataset.id = item.id;
      btn.setAttribute("aria-label", item.label);
      btn.title = item.label;
      btn.innerHTML = iconFor(item.id);
      if (state[key] === item.id) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        state[key] = item.id;
        [...root.children].forEach((el) => el.classList.toggle("is-active", el.dataset.id === item.id));
        render();
      });
      root.append(btn);
    });
  }

  function mountSwatches() {
    els.swatches.innerHTML = "";
    COLORS.forEach((color) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = color.value;
      btn.dataset.value = color.value;
      btn.setAttribute("aria-label", color.id);
      if (state.fg.toLowerCase() === color.value) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        state.fg = color.value;
        els.customFg.value = color.value;
        syncSwatches();
        render();
      });
      els.swatches.append(btn);
    });
  }

  function syncSwatches() {
    [...els.swatches.children].forEach((el) => {
      el.classList.toggle("is-active", el.dataset.value.toLowerCase() === state.fg.toLowerCase());
    });
  }

  function currentSvg() {
    return renderSvg(makeMatrix(payload()), {
      fg: state.fg,
      bg: state.bg,
      transparent: state.transparent,
      dot: state.dot,
      eyeBorder: state.eyeBorder,
      eyeCenter: state.eyeCenter,
    });
  }

  function render() {
    els.preview.innerHTML = currentSvg();
    els.frame.classList.toggle("is-transparent", state.transparent);
    const meta = QR_TYPES[state.type];
    if (meta) els.hint.textContent = meta.hint;
    els.preview.setAttribute("aria-label", `QR code for ${payload()}`);
  }

  function svgToCanvas(svg, size) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const opaque = state.format === "jpg" || !state.transparent;
        if (opaque) {
          ctx.fillStyle = state.format === "jpg" && state.transparent ? "#ffffff" : state.bg;
          ctx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not render QR image"));
      };
      img.src = url;
    });
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function download() {
    const base = fileBase();
    const svg = currentSvg();
    if (state.format === "svg") {
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${base}.svg`);
      return;
    }
    const canvas = await svgToCanvas(svg, 1024);
    const mime = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" }[state.format];
    const quality = state.format === "png" ? undefined : 0.92;
    canvas.toBlob(
      (blob) => downloadBlob(blob, `${base}.${state.format}`),
      mime,
      quality
    );
  }

  async function copyImage() {
    const pngPromise = svgToCanvas(currentSvg(), 1024).then(
      (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
    );
    await navigator.clipboard.write([new ClipboardItem({ "image/png": pngPromise })]);
    const original = els.copy.textContent;
    els.copy.textContent = "Copied";
    setTimeout(() => {
      els.copy.textContent = original;
    }, 1400);
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((el) => {
        const on = el === tab;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", String(on));
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        const on = panel.id === `panel-${tab.dataset.tab}`;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
    });
  });

  let timer = 0;
  els.type.addEventListener("change", () => applyType(els.type.value));
  els.text.addEventListener("input", () => {
    state.text = els.text.value.trim() || (state.type === "url" ? "https://example.com" : els.text.value);
    clearTimeout(timer);
    timer = setTimeout(render, 80);
  });
  ["wifiSsid", "wifiPass", "wifiEnc"].forEach((key) => {
    els[key].addEventListener("input", () => {
      state[key] = els[key].value;
      render();
    });
    els[key].addEventListener("change", () => {
      state[key] = els[key].value;
      render();
    });
  });
  document.querySelectorAll(".use-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      applyType(card.dataset.type, card.dataset.fill || "");
      document.getElementById("generator").scrollIntoView({ behavior: "smooth" });
    });
  });
  els.format.addEventListener("change", () => {
    state.format = els.format.value;
  });
  els.customFg.addEventListener("input", () => {
    state.fg = els.customFg.value;
    syncSwatches();
    render();
  });
  els.customBg.addEventListener("input", () => {
    state.bg = els.customBg.value;
    render();
  });
  els.transparent.addEventListener("change", () => {
    state.transparent = els.transparent.checked;
    render();
  });
  els.download.addEventListener("click", () => download().catch(console.error));
  els.copy.addEventListener("click", () => copyImage().catch(console.error));

  mountChoices(els.dots, DOT_SHAPES, "dot", iconSvg);
  mountChoices(els.borders, EYE_SHAPES, "eyeBorder", (id) =>
    id === "circle" ? iconSvg("circle") : iconSvg(id)
  );
  mountChoices(els.centers, EYE_SHAPES, "eyeCenter", (id) =>
    id === "circle" ? iconSvg("circle-fill") : iconSvg(id)
  );
  mountSwatches();
  const schema = document.getElementById("schema-graph");
  if (schema && window.__SITE_URL__) {
    try {
      const data = JSON.parse(schema.textContent);
      data["@graph"][0].url = window.__SITE_URL__;
      schema.textContent = JSON.stringify(data);
    } catch (err) {
      /* ignore malformed schema */
    }
  }
  render();
})();
