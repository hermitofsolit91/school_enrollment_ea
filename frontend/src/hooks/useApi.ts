import { useEffect, useState } from "react";
import { HEADERS } from "../constants/api";

export function useApi<T>(url: string | null, skipKey = false) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let alive = true;
    setLoading(true);
    setError(null);

    fetch(url, { headers: skipKey ? {} : HEADERS })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [url, skipKey]);

  return { data, loading, error };
}
