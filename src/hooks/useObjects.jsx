"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiCreateObject,
  apiDeleteObject,
  apiGetObjects,
  apiResetObjects,
  apiUpdateObject,
} from "@/lib/api";

import { normalizeCategory } from "@/lib/data";

function computeStats(objects) {
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

export function useObjects() {
  const [objects, setObjects] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGetObjects();
      setObjects(data.objects || []);
      setError(null);
      return data.objects || [];
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
      return [];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const stats = useMemo(() => computeStats(objects), [objects]);

  const create = useCallback(
    async (data) => {
      const item = await apiCreateObject(data);
      await refresh();
      return item;
    },
    [refresh]
  );

  const update = useCallback(
    async (id, data) => {
      const item = await apiUpdateObject(id, data);
      await refresh();
      return item;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id) => {
      await apiDeleteObject(id);
      await refresh();
      return true;
    },
    [refresh]
  );

  const reset = useCallback(async () => {
    await apiResetObjects();
    await refresh();
  }, [refresh]);

  return {
    objects,
    stats,
    ready,
    error,
    refresh,
    create,
    update,
    remove,
    reset,
  };
}
