import {
  CATEGORY_LEGACY_MAP,
  normalizeCategory,
  SEED_OBJECTS,
} from "@/lib/data";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// SKIP_DB mode: When true, serve data from SEED_OBJECTS (no Prisma / SQLite).
// Used for Vercel deployment where SQLite is not available.
// ---------------------------------------------------------------------------
const SKIP_DB = process.env.SKIP_DB === "true";

// ---------------------------------------------------------------------------
// Static (in-memory) helpers — used when SKIP_DB is true
// ---------------------------------------------------------------------------

/** Turn a SEED_OBJECTS item into the same shape the API returns */
function seedToSerialized(item) {
  const now = new Date().toISOString();
  return {
    id: item.id,
    name: item.name,
    scientificName: item.scientificName || item.name,
    category: item.category || "Planet",
    diameter: item.diameter || "",
    mass: item.mass || "",
    gravity: item.gravity || "",
    temperature: item.temperature || "",
    distance: item.distance || "",
    yearDiscovered: item.yearDiscovered || "",
    imageUrl: item.imageUrl || "",
    description: item.description || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
  };
}

const READ_ONLY_ERROR = "Mode baca-saja — database tidak tersedia di deployment ini.";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Serialize Prisma row for JSON / frontend */
export function serializeObject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    scientificName: row.scientificName,
    category: row.category,
    diameter: row.diameter || "",
    mass: row.mass || "",
    gravity: row.gravity || "",
    temperature: row.temperature || "",
    distance: row.distance || "",
    yearDiscovered: row.yearDiscovered || "",
    imageUrl: row.imageUrl || "",
    description: row.description || "",
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : row.createdAt,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : row.updatedAt,
  };
}

export function getStats(objects) {
  const categoryCount = {};
  objects.forEach((obj) => {
    const cat = normalizeCategory(obj.category) || "Unknown";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const uniqueCategories = Object.keys(categoryCount).length;
  const sortedByDate = [...objects].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const latest = sortedByDate[0] || null;

  let topCategory = null;
  let topCount = 0;
  Object.entries(categoryCount).forEach(([cat, count]) => {
    if (count > topCount) {
      topCategory = cat;
      topCount = count;
    }
  });

  return {
    totalObjects: objects.length,
    totalCategories: uniqueCategories,
    latestObject: latest,
    topCategory: topCategory ? { name: topCategory, count: topCount } : null,
    categoryCount,
  };
}

// ---------------------------------------------------------------------------
// DB-backed helpers (only used when SKIP_DB is false)
// ---------------------------------------------------------------------------

/** Map seed item → Prisma create input (preserve seed ids) */
function seedToCreateInput(item) {
  return {
    id: item.id,
    name: item.name,
    scientificName: item.scientificName || item.name,
    category: item.category || "Planet",
    diameter: item.diameter || "",
    mass: item.mass || "",
    gravity: item.gravity || "",
    temperature: item.temperature || "",
    distance: item.distance || "",
    yearDiscovered: item.yearDiscovered || "",
    imageUrl: item.imageUrl || "",
    description: item.description || "",
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  };
}

/**
 * Rename English category labels still stored in DB to Indonesian.
 * Safe to run on every list/get — only touches legacy values.
 */
export async function migrateLegacyCategories() {
  if (SKIP_DB) return;
  const entries = Object.entries(CATEGORY_LEGACY_MAP);
  for (const [from, to] of entries) {
    if (from === to) continue;
    await prisma.celestialObject.updateMany({
      where: { category: from },
      data: { category: to },
    });
  }
}

/** If DB empty, insert catalog seed. Also migrates legacy category names. */
export async function ensureSeeded() {
  if (SKIP_DB) return { seeded: false, count: SEED_OBJECTS.length };
  const count = await prisma.celestialObject.count();
  if (count === 0) {
    await prisma.celestialObject.createMany({
      data: SEED_OBJECTS.map(seedToCreateInput),
    });
    const after = await prisma.celestialObject.count();
    return { seeded: true, count: after };
  }

  await migrateLegacyCategories();
  return { seeded: false, count };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listObjects() {
  if (SKIP_DB) {
    return SEED_OBJECTS.map(seedToSerialized);
  }
  await ensureSeeded();
  const rows = await prisma.celestialObject.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeObject);
}

export async function getObjectById(id) {
  if (SKIP_DB) {
    const item = SEED_OBJECTS.find((obj) => obj.id === id);
    return item ? seedToSerialized(item) : null;
  }
  await ensureSeeded();
  const row = await prisma.celestialObject.findUnique({ where: { id } });
  return serializeObject(row);
}

export async function createObject(data) {
  if (SKIP_DB) throw new Error(READ_ONLY_ERROR);
  const row = await prisma.celestialObject.create({
    data: {
      name: data.name,
      scientificName: data.scientificName,
      category: data.category,
      diameter: data.diameter || "",
      mass: data.mass || "",
      gravity: data.gravity || "",
      temperature: data.temperature || "",
      distance: data.distance || "",
      yearDiscovered: data.yearDiscovered || "",
      imageUrl: data.imageUrl || "",
      description: data.description,
    },
  });
  return serializeObject(row);
}

export async function updateObject(id, data) {
  if (SKIP_DB) throw new Error(READ_ONLY_ERROR);
  try {
    const row = await prisma.celestialObject.update({
      where: { id },
      data: {
        name: data.name,
        scientificName: data.scientificName,
        category: data.category,
        diameter: data.diameter || "",
        mass: data.mass || "",
        gravity: data.gravity || "",
        temperature: data.temperature || "",
        distance: data.distance || "",
        yearDiscovered: data.yearDiscovered || "",
        imageUrl: data.imageUrl || "",
        description: data.description,
      },
    });
    return serializeObject(row);
  } catch {
    return null;
  }
}

export async function deleteObject(id) {
  if (SKIP_DB) throw new Error(READ_ONLY_ERROR);
  try {
    await prisma.celestialObject.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function resetToSeed() {
  if (SKIP_DB) throw new Error(READ_ONLY_ERROR);
  await prisma.celestialObject.deleteMany();
  await prisma.celestialObject.createMany({
    data: SEED_OBJECTS.map(seedToCreateInput),
  });
  return listObjects();
}
