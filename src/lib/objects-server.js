import { prisma } from "@/lib/prisma";
import {
  CATEGORY_LEGACY_MAP,
  normalizeCategory,
  SEED_OBJECTS,
} from "@/lib/data";

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

export async function listObjects() {
  await ensureSeeded();
  const rows = await prisma.celestialObject.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeObject);
}

export async function getObjectById(id) {
  await ensureSeeded();
  const row = await prisma.celestialObject.findUnique({ where: { id } });
  return serializeObject(row);
}

export async function createObject(data) {
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
  try {
    await prisma.celestialObject.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function resetToSeed() {
  await prisma.celestialObject.deleteMany();
  await prisma.celestialObject.createMany({
    data: SEED_OBJECTS.map(seedToCreateInput),
  });
  return listObjects();
}
