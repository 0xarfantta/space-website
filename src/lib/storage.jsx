import {
  SEED_OBJECTS,
  SEED_VERSION,
  SEED_VERSION_KEY,
  STORAGE_KEY,
} from "./data";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getAll() {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[OrbitraStorage] Failed to read:", err);
    return [];
  }
}

export function saveAll(objects) {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
    return true;
  } catch (err) {
    console.error("[OrbitraStorage] Failed to save:", err);
    return false;
  }
}

function getSeedVersion() {
  if (!canUseStorage()) return "0";
  try {
    return localStorage.getItem(SEED_VERSION_KEY) || "0";
  } catch {
    return "0";
  }
}

function setSeedVersion(version) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(SEED_VERSION_KEY, String(version));
  } catch {
    /* ignore */
  }
}

/**
 * Ensure storage has seed data. When SEED_VERSION increases,
 * merge any missing seed objects by id (does not overwrite user data).
 */
export function initStorage() {
  const existing = getAll();
  if (existing.length === 0) {
    saveAll(SEED_OBJECTS);
    setSeedVersion(SEED_VERSION);
    return [...SEED_OBJECTS];
  }

  if (getSeedVersion() !== String(SEED_VERSION)) {
    const ids = new Set(existing.map((o) => o.id));
    const missing = SEED_OBJECTS.filter((o) => !ids.has(o.id));
    if (missing.length > 0) {
      saveAll([...existing, ...missing]);
    }
    setSeedVersion(SEED_VERSION);
    return getAll();
  }

  return existing;
}

export function resetToSeed() {
  saveAll(SEED_OBJECTS);
  setSeedVersion(SEED_VERSION);
  return [...SEED_OBJECTS];
}

export function getById(id) {
  return getAll().find((item) => item.id === id) || null;
}

export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `obj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createObject(data) {
  const objects = getAll();
  const now = new Date().toISOString();
  const item = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  objects.push(item);
  saveAll(objects);
  return item;
}

export function updateObject(id, updates) {
  const objects = getAll();
  const index = objects.findIndex((item) => item.id === id);
  if (index === -1) return null;

  objects[index] = {
    ...objects[index],
    ...updates,
    id: objects[index].id,
    createdAt: objects[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  saveAll(objects);
  return objects[index];
}

export function removeObject(id) {
  const objects = getAll();
  const next = objects.filter((item) => item.id !== id);
  if (next.length === objects.length) return false;
  saveAll(next);
  return true;
}

export function getStats(objects = getAll()) {
  const categoryCount = {};

  objects.forEach((obj) => {
    const cat = obj.category || "Unknown";
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
