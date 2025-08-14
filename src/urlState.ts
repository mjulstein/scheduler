// urlState.ts - Functions for managing state in the URL

// Types representing items and URL state shapes
export type UrlItem = { id: string; text: string };
export type UrlItemTuple = [string, string];
export type UrlItemInput = UrlItem | UrlItemTuple;
export type UrlItemsMap = Record<string, UrlItemInput[]>;
export type UrlItemsMapNormalized = Record<string, UrlItem[]>;
export type UrlStateInput = UrlItemsMap | { items: UrlItemsMap };
export type UrlStateCompact = Record<string, UrlItemTuple[]>;

// Helpers
const toStringSafe = (v: unknown): string => (v == null ? '' : String(v));

const toTuple = (entry: unknown): UrlItemTuple => {
  if (Array.isArray(entry)) {
    return [toStringSafe(entry[0]), toStringSafe(entry[1])];
  }
  const e = entry as { id?: unknown; text?: unknown } | null | undefined;
  return [toStringSafe(e?.id), toStringSafe(e?.text)];
};

/**
 * Encodes items mapping to base64 for URL storage in a compact form
 * Compact form: { [isoDate]: [[id, text], ...] }
 * Accepts either the items mapping directly, or an object with an `items` property.
 */
export const encodeStateToBase64 = (
  state: UrlStateInput | UrlItemsMap | null | undefined
): string => {
  // Accept both { items } wrapper or plain mapping
  const source: unknown =
    state && typeof state === 'object' && 'items' in state
      ? (state as { items: unknown }).items
      : state;

  const itemsObj =
    source && typeof source === 'object'
      ? (source as Record<string, unknown>)
      : {};

  // Convert to compact tuples
  const compact: UrlStateCompact = {};
  for (const [date, arr] of Object.entries(itemsObj)) {
    const list = Array.isArray(arr) ? (arr as unknown[]) : [];
    compact[date] = list.map(toTuple);
  }

  return btoa(JSON.stringify(compact));
};

/**
 * Decodes base64 encoded state from URL (backward compatible)
 * Supports:
 *  - New compact form: { [date]: [[id, text], ...] }
 *  - Legacy: { items: { [date]: [{id, text}, ...] } }
 * Returns a normalized mapping: { [date]: [{ id, text }, ...] }
 */
export const decodeBase64ToState = (
  base64: string
): UrlItemsMapNormalized | null => {
  try {
    const parsed: unknown = JSON.parse(atob(base64));

    // If legacy wrapper exists, unwrap it
    const raw: unknown =
      parsed && typeof parsed === 'object' && 'items' in (parsed as object)
        ? (parsed as { items: unknown }).items
        : parsed;

    if (!raw || typeof raw !== 'object') return {};

    const normalized: UrlItemsMapNormalized = {};

    for (const [date, arr] of Object.entries(raw as Record<string, unknown>)) {
      const list = Array.isArray(arr) ? (arr as unknown[]) : [];
      normalized[date] = list.map((entry: unknown): UrlItem => {
        if (Array.isArray(entry)) {
          return { id: toStringSafe(entry[0]), text: toStringSafe(entry[1]) };
        }
        const e = entry as { id?: unknown; text?: unknown } | null | undefined;
        return { id: toStringSafe(e?.id), text: toStringSafe(e?.text) };
      });
    }

    return normalized;
  } catch (e) {
    console.error('Failed to decode state from URL:', e);
    return null;
  }
};

/**
 * Updates the URL hash with encoded items (compact form)
 * Accepts either the items mapping directly, or an object with an `items` property.
 */
export const updateUrlWithState = (
  state: UrlStateInput | UrlItemsMap | null | undefined
): void => {
  const encodedState = encodeStateToBase64(state);
  const url = new URL(window.location.href);
  url.hash = encodedState;
  window.history.replaceState({}, '', url.toString());
};

/**
 * Retrieves items mapping from URL hash (normalized object form)
 * @returns { [date]: [{ id, text }, ...] }
 */
export const getStateFromUrl = (): UrlItemsMapNormalized | null => {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  return decodeBase64ToState(hash);
};
