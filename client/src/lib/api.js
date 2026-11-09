import { useEffect, useState } from 'react';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function api(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(BASE + path, {
    method,
    signal,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

/** Turns a stored "/uploads/..." path into a full URL (needed only for split deployments). */
export function mediaUrl(url) {
  return url && url.startsWith('/uploads/') ? BASE + url : url;
}

/* ---------------------------------------------------------------------------
 * Tiny stale-while-revalidate cache: pages render instantly from memory when
 * revisited, and data can be prefetched on hover before the user clicks.
 * ------------------------------------------------------------------------- */
const cache = new Map(); // path -> { data, time, promise }
const FRESH_MS = 30_000;

function load(path) {
  const entry = cache.get(path);
  if (entry?.promise) return entry.promise;
  const promise = api(path)
    .then((data) => {
      cache.set(path, { data, time: Date.now() });
      return data;
    })
    .catch((err) => {
      cache.set(path, { data: entry?.data, time: entry?.time || 0 });
      throw err;
    });
  cache.set(path, { data: entry?.data, time: entry?.time || 0, promise });
  return promise;
}

export function prefetch(path) {
  const entry = cache.get(path);
  if (entry?.promise || (entry?.data && Date.now() - entry.time < FRESH_MS)) return;
  load(path).catch(() => {});
}

export function invalidate(prefix = '') {
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

export function useApi(path) {
  const [state, setState] = useState(() => {
    const entry = path ? cache.get(path) : null;
    return { data: entry?.data, error: null, loading: Boolean(path) && !entry?.data };
  });

  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    const entry = cache.get(path);
    setState({ data: entry?.data, error: null, loading: !entry?.data });
    if (entry?.data && Date.now() - entry.time < FRESH_MS) return undefined;

    load(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState((s) => ({ data: s.data, error, loading: false })));
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
