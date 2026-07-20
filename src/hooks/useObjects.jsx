"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createObject,
  getAll,
  getStats,
  initStorage,
  removeObject,
  resetToSeed,
  updateObject,
} from "@/lib/storage";

export function useObjects() {
  const [objects, setObjects] = useState([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setObjects(getAll());
  }, []);

  useEffect(() => {
    initStorage();
    refresh();
    setReady(true);
  }, [refresh]);

  const stats = useMemo(() => getStats(objects), [objects]);

  const create = useCallback(
    (data) => {
      const item = createObject(data);
      refresh();
      return item;
    },
    [refresh]
  );

  const update = useCallback(
    (id, data) => {
      const item = updateObject(id, data);
      refresh();
      return item;
    },
    [refresh]
  );

  const remove = useCallback(
    (id) => {
      const ok = removeObject(id);
      refresh();
      return ok;
    },
    [refresh]
  );

  const reset = useCallback(() => {
    resetToSeed();
    refresh();
  }, [refresh]);

  return {
    objects,
    stats,
    ready,
    refresh,
    create,
    update,
    remove,
    reset,
  };
}
