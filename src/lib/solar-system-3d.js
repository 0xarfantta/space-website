/**
 * Konfigurasi & tekstur prosedural untuk peta Tata Surya 3D (three.js).
 *
 * Semua tekstur digambar di <canvas> saat runtime — tidak ada file gambar
 * eksternal, jadi peta tetap jalan offline dan tanpa menambah aset repo.
 */

/** px orbit (data 2D) → satuan dunia 3D */
export const ORBIT_SCALE = 1 / 16;

/**
 * Data per benda langit khusus tampilan 3D.
 * radius   : jari-jari bola (satuan dunia)
 * tilt     : kemiringan sumbu (derajat)
 * spin     : detik per satu rotasi sumbu (negatif = retrograde)
 * incl     : kemiringan bidang orbit (derajat)
 * texture  : jenis tekstur prosedural
 */
export const BODY_3D = {
  sun: {
    radius: 2.2,
    tilt: 7.25,
    spin: 60,
    incl: 0,
    texture: "sun",
    palette: ["#fff3c4", "#ffb43d", "#ff7a18"],
  },
  mercury: {
    radius: 0.34,
    tilt: 0.03,
    spin: 42,
    incl: 7,
    texture: "cratered",
    palette: ["#8d857c", "#a8a29e", "#6b645c"],
  },
  venus: {
    radius: 0.5,
    tilt: 177,
    spin: -52,
    incl: 3.4,
    texture: "clouded",
    palette: ["#e9c46a", "#fcd34d", "#c98f2f"],
  },
  earth: {
    radius: 0.55,
    tilt: 23.4,
    spin: 14,
    incl: 0,
    texture: "earth",
    palette: ["#1d4ed8", "#15803d", "#a16207"],
    clouds: true,
    moon: { radius: 0.15, distance: 1.2, spin: 26, texture: "cratered" },
  },
  mars: {
    radius: 0.42,
    tilt: 25.2,
    spin: 15,
    incl: 1.85,
    texture: "mars",
    palette: ["#c1440e", "#e2725b", "#7c2d12"],
  },
  jupiter: {
    radius: 1.3,
    tilt: 3.1,
    spin: 9,
    incl: 1.3,
    texture: "banded",
    palette: ["#e8c39e", "#c08552", "#f5deb3", "#8b5a2b"],
    spot: true,
  },
  saturn: {
    radius: 1.05,
    tilt: 26.7,
    spin: 10,
    incl: 2.5,
    texture: "banded",
    palette: ["#f3e2b3", "#d9bd82", "#fdf3d3", "#b99a5e"],
    rings: { inner: 1.5, outer: 2.6, color: "#f3e2b3" },
  },
  uranus: {
    radius: 0.8,
    tilt: 97.8,
    spin: -18,
    incl: 0.8,
    texture: "banded",
    palette: ["#a5f3fc", "#67e8f9", "#cffafe", "#22d3ee"],
    rings: { inner: 1.35, outer: 1.7, color: "#a5f3fc", faint: true },
  },
  neptune: {
    radius: 0.78,
    tilt: 28.3,
    spin: 17,
    incl: 1.8,
    texture: "banded",
    palette: ["#3b82f6", "#1d4ed8", "#93c5fd", "#1e40af"],
  },
  pluto: {
    radius: 0.28,
    tilt: 122,
    spin: 34,
    incl: 17.2,
    texture: "cratered",
    palette: ["#d6d3d1", "#a8a29e", "#8b7f74"],
  },
};

/** LCG sederhana — tekstur selalu sama tiap render (tidak berkedip). */
function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hashKey(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function canvas2d(width, height) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext("2d") };
}

/** Gambar bercak lembut acak — dasar semua permukaan berbatu. */
function splatter(ctx, w, h, rand, colors, count, min, max, alpha = 0.5) {
  for (let i = 0; i < count; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    // Bercak melebar di kutub agar distorsi proyeksi bola tidak mencolok
    const stretch = 1 + Math.abs(y / h - 0.5) * 3;
    const r = min + rand() * (max - min);
    ctx.globalAlpha = alpha * (0.4 + rand() * 0.6);
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.beginPath();
    ctx.ellipse(x, y, r * stretch, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCraters(ctx, w, h, rand, count) {
  for (let i = 0; i < count; i += 1) {
    const x = rand() * w;
    const y = h * 0.1 + rand() * h * 0.8;
    const r = 3 + rand() * 14;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.92, Math.PI * 0.15, Math.PI * 1.05);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPolarCaps(ctx, w, h, size = 0.06, color = "#ffffff") {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color);
  grad.addColorStop(size, "rgba(255,255,255,0)");
  grad.addColorStop(1 - size, "rgba(255,255,255,0)");
  grad.addColorStop(1, color);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

function drawBands(ctx, w, h, rand, palette, spot) {
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, w, h);

  let y = 0;
  while (y < h) {
    const band = 6 + rand() * 26;
    ctx.globalAlpha = 0.25 + rand() * 0.5;
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.fillRect(0, y, w, band);
    y += band;
  }

  // Turbulensi: elips memanjang mengikuti arah pita
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 220; i += 1) {
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.beginPath();
    ctx.ellipse(
      rand() * w,
      rand() * h,
      10 + rand() * 60,
      2 + rand() * 5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (spot) {
    // Great Red Spot
    ctx.globalAlpha = 0.85;
    const cx = w * 0.62;
    const cy = h * 0.62;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 52);
    grad.addColorStop(0, "#b91c1c");
    grad.addColorStop(0.6, "#dc6b4b");
    grad.addColorStop(1, "rgba(220,107,75,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawEarth(ctx, w, h, rand) {
  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#0b3b8c");
  ocean.addColorStop(0.5, "#1263c4");
  ocean.addColorStop(1, "#0b3b8c");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  // Benua: rangkaian lingkaran menyatu di beberapa titik jangkar
  const anchors = [
    [0.12, 0.35],
    [0.2, 0.62],
    [0.44, 0.32],
    [0.5, 0.58],
    [0.62, 0.42],
    [0.78, 0.68],
    [0.88, 0.36],
  ];
  anchors.forEach(([ax, ay]) => {
    let x = ax * w;
    let y = ay * h;
    const blobs = 45 + Math.floor(rand() * 45);
    for (let i = 0; i < blobs; i += 1) {
      const r = 6 + rand() * 22;
      ctx.fillStyle = rand() > 0.75 ? "#8a6b3a" : "#1f7a3d";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      x += (rand() - 0.5) * 46;
      y += (rand() - 0.5) * 34;
      x = Math.max(0, Math.min(w, x));
      y = Math.max(h * 0.12, Math.min(h * 0.88, y));
    }
  });
  ctx.globalAlpha = 1;

  // Gurun & vegetasi kering
  splatter(ctx, w, h, rand, ["#b08d57", "#7a9b3a"], 90, 3, 12, 0.25);
  drawPolarCaps(ctx, w, h, 0.07);
}

function drawSun(ctx, w, h, rand, palette) {
  ctx.fillStyle = palette[1];
  ctx.fillRect(0, 0, w, h);
  splatter(ctx, w, h, rand, [palette[0], "#ffe082"], 500, 4, 22, 0.55);
  splatter(ctx, w, h, rand, [palette[2], "#e2560f"], 300, 6, 26, 0.4);
  // Bintik matahari
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = "#7c2d12";
    ctx.beginPath();
    ctx.ellipse(
      rand() * w,
      h * 0.2 + rand() * h * 0.6,
      6 + rand() * 14,
      4 + rand() * 8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Tekstur permukaan (equirectangular) untuk sebuah benda langit.
 * @returns {HTMLCanvasElement}
 */
export function createSurfaceCanvas(key, config) {
  const w = 1024;
  const h = 512;
  const { el, ctx } = canvas2d(w, h);
  const rand = seeded(hashKey(key));
  const palette = config.palette || ["#9ca3af"];

  switch (config.texture) {
    case "sun":
      drawSun(ctx, w, h, rand, palette);
      break;
    case "banded":
      drawBands(ctx, w, h, rand, palette, config.spot);
      break;
    case "earth":
      drawEarth(ctx, w, h, rand);
      break;
    case "mars":
      ctx.fillStyle = palette[1];
      ctx.fillRect(0, 0, w, h);
      splatter(ctx, w, h, rand, [palette[0], palette[2]], 420, 5, 30, 0.5);
      drawCraters(ctx, w, h, rand, 40);
      drawPolarCaps(ctx, w, h, 0.05, "#f8fafc");
      break;
    case "clouded":
      ctx.fillStyle = palette[1];
      ctx.fillRect(0, 0, w, h);
      splatter(ctx, w, h, rand, [palette[0], palette[2], "#fff7cf"], 380, 12, 60, 0.4);
      break;
    case "cratered":
    default:
      ctx.fillStyle = palette[1] || palette[0];
      ctx.fillRect(0, 0, w, h);
      splatter(ctx, w, h, rand, palette, 360, 6, 30, 0.45);
      drawCraters(ctx, w, h, rand, 70);
      break;
  }

  return el;
}

/** Lapisan awan tipis (dipakai Bumi) — putih dengan alpha. */
export function createCloudCanvas(key) {
  const w = 1024;
  const h = 512;
  const { el, ctx } = canvas2d(w, h);
  const rand = seeded(hashKey(`${key}-clouds`));
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 260; i += 1) {
    const x = rand() * w;
    const y = h * 0.08 + rand() * h * 0.84;
    ctx.globalAlpha = 0.12 + rand() * 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y, 14 + rand() * 60, 5 + rand() * 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return el;
}

/** Tekstur cincin: gradien radial dengan celah (mis. Cassini). */
export function createRingCanvas(color, faint = false) {
  const w = 512;
  const h = 4;
  const { el, ctx } = canvas2d(w, h);
  const rand = seeded(hashKey(`ring-${color}`));

  ctx.clearRect(0, 0, w, h);
  for (let x = 0; x < w; x += 1) {
    const t = x / w;
    // Tepi dalam & luar memudar
    const edge = Math.min(1, Math.min(t, 1 - t) * 8);
    const noise = 0.55 + rand() * 0.45;
    let alpha = edge * noise * (faint ? 0.35 : 0.85);
    // Celah Cassini
    if (!faint && t > 0.62 && t < 0.68) alpha *= 0.12;
    if (!faint && t > 0.36 && t < 0.39) alpha *= 0.45;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, 0, 1, h);
  }
  ctx.globalAlpha = 1;
  return el;
}

/**
 * Sprite lingkaran lembut — korona Matahari.
 * @param {Array<[number, string]>} stops pasangan [offset, warna css]
 */
export function createGlowCanvas(stops) {
  const size = 256;
  const { el, ctx } = canvas2d(size, size);
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return el;
}
