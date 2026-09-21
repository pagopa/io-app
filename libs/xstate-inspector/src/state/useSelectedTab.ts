/**
 * The tab on screen. It lives in the URL hash so a reload reopens the same
 * machine, and falls back to the first tab when the hash names a machine that is
 * gone.
 */
import { useCallback, useEffect, useState } from "react";

export interface TabSelection {
  select: (key: string) => void;
  selected: string | undefined;
}

const hashKey = (): string =>
  decodeURIComponent(window.location.hash.replace(/^#/, ""));

export const useSelectedTab = (keys: ReadonlyArray<string>): TabSelection => {
  const [hash, setHash] = useState(hashKey);

  useEffect(() => {
    const onHashChange = () => setHash(hashKey());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = useCallback((key: string) => {
    window.location.hash = encodeURIComponent(key);
  }, []);

  return { select, selected: keys.includes(hash) ? hash : keys[0] };
};
