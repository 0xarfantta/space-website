/**
 * Data visual Tata Surya (skala orbit disederhanakan untuk UI).
 * `catalogKeys` dipakai mencocokkan objek di database/katalog.
 */

export const SOLAR_SYSTEM_BODIES = [
  {
    key: "sun",
    name: "Matahari",
    nameEn: "Sun",
    catalogKeys: ["sun", "sol", "matahari"],
    seedId: "seed-sun",
    order: 0,
    au: 0,
    orbitRadius: 0,
    size: 56,
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.55)",
    periodDays: 0,
    type: "star",
    fact: "Pusat Tata Surya — menyumbang ~99,8% massa sistem.",
  },
  {
    key: "mercury",
    name: "Merkurius",
    nameEn: "Mercury",
    catalogKeys: ["mercury", "merkurius"],
    seedId: "seed-mercury",
    order: 1,
    au: 0.39,
    orbitRadius: 70,
    size: 10,
    color: "#a8a29e",
    glow: "rgba(168, 162, 158, 0.4)",
    periodDays: 88,
    type: "planet",
    fact: "Planet terkecil & terdekat dengan Matahari.",
  },
  {
    key: "venus",
    name: "Venus",
    nameEn: "Venus",
    catalogKeys: ["venus"],
    seedId: "seed-venus",
    order: 2,
    au: 0.72,
    orbitRadius: 95,
    size: 14,
    color: "#fcd34d",
    glow: "rgba(252, 211, 77, 0.4)",
    periodDays: 225,
    type: "planet",
    fact: "Planet terpanas di permukaan (~464°C).",
  },
  {
    key: "earth",
    name: "Bumi",
    nameEn: "Earth",
    catalogKeys: ["earth", "bumi", "terra"],
    seedId: "seed-earth",
    order: 3,
    au: 1,
    orbitRadius: 125,
    size: 15,
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.5)",
    periodDays: 365,
    type: "planet",
    fact: "Satu-satunya dunia yang diketahui menampung kehidupan.",
  },
  {
    key: "mars",
    name: "Mars",
    nameEn: "Mars",
    catalogKeys: ["mars"],
    seedId: "seed-mars",
    order: 4,
    au: 1.52,
    orbitRadius: 155,
    size: 12,
    color: "#f87171",
    glow: "rgba(248, 113, 113, 0.45)",
    periodDays: 687,
    type: "planet",
    fact: "Planet Merah — gunung tertinggi di Tata Surya (Olympus Mons).",
  },
  {
    key: "jupiter",
    name: "Jupiter",
    nameEn: "Jupiter",
    catalogKeys: ["jupiter"],
    seedId: "seed-jupiter",
    order: 5,
    au: 5.2,
    orbitRadius: 200,
    size: 28,
    color: "#fdba74",
    glow: "rgba(253, 186, 116, 0.45)",
    periodDays: 4333,
    type: "planet",
    fact: "Raksasa gas terbesar — badai Great Red Spot legendaris.",
  },
  {
    key: "saturn",
    name: "Saturnus",
    nameEn: "Saturn",
    catalogKeys: ["saturn", "saturnus"],
    seedId: "seed-saturn",
    order: 6,
    au: 9.5,
    orbitRadius: 245,
    size: 24,
    color: "#fde68a",
    glow: "rgba(253, 230, 138, 0.4)",
    periodDays: 10759,
    type: "planet",
    fact: "Dikenal cincin es & debu yang spektakuler.",
    hasRings: true,
  },
  {
    key: "uranus",
    name: "Uranus",
    nameEn: "Uranus",
    catalogKeys: ["uranus"],
    seedId: "seed-uranus",
    order: 7,
    au: 19.8,
    orbitRadius: 285,
    size: 18,
    color: "#67e8f9",
    glow: "rgba(103, 232, 249, 0.4)",
    periodDays: 30687,
    type: "planet",
    fact: "Raksasa es yang miring hampir 98° pada sumbunya.",
  },
  {
    key: "neptune",
    name: "Neptunus",
    nameEn: "Neptune",
    catalogKeys: ["neptune", "neptunus"],
    seedId: "seed-neptune",
    order: 8,
    au: 30,
    orbitRadius: 320,
    size: 17,
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.45)",
    periodDays: 60190,
    type: "planet",
    fact: "Planet terjauh — angin hingga ~2.000 km/jam.",
  },
  {
    key: "pluto",
    name: "Pluto",
    nameEn: "Pluto",
    catalogKeys: ["pluto"],
    seedId: "seed-pluto",
    order: 9,
    au: 39,
    orbitRadius: 355,
    size: 8,
    color: "#d6d3d1",
    glow: "rgba(214, 211, 209, 0.35)",
    periodDays: 90560,
    type: "dwarf",
    fact: "Planet kerdil di Sabuk Kuiper (ditemukan 1930).",
  },
];

/**
 * Cari objek katalog yang cocok dengan body Tata Surya.
 * @param {object} body
 * @param {Array} objects
 */
export function matchCatalogObject(body, objects) {
  if (!objects?.length) return null;

  const byId = objects.find((o) => o.id === body.seedId);
  if (byId) return byId;

  const keys = body.catalogKeys.map((k) => k.toLowerCase());
  return (
    objects.find((o) => {
      const name = String(o.name || "").toLowerCase();
      const sci = String(o.scientificName || "").toLowerCase();
      return keys.some(
        (k) => name === k || sci === k || name.includes(k) || sci.includes(k)
      );
    }) || null
  );
}

/** Durasi animasi orbit (detik) — diskalakan agar UI nyaman */
export function orbitDurationSeconds(periodDays) {
  if (!periodDays) return 0;
  // Earth ~20s; others proportional with clamp
  const base = (periodDays / 365) * 20;
  return Math.min(180, Math.max(8, base));
}
