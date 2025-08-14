// urlState.ts - Functions for managing state in the URL

/**
 * Encodes items mapping to base64 for URL storage in a compact form
 * Compact form: { [isoDate]: [[id, text], ...] }
 * Accepts either the items mapping directly, or an object with an `items` property.
 */
export const encodeStateToBase64 = (state: any): string => {
  // Accept both { items } wrapper or plain mapping
  const items: Record<string, any[]> = (state && state.items) ? state.items : (state || {});

  // Convert to compact tuples
  const compact: Record<string, [string, string][]> = {};
  for (const [date, arr] of Object.entries(items)) {
    const list = Array.isArray(arr) ? arr : [];
    compact[date] = list.map((entry: any) => {
      if (Array.isArray(entry)) {
        // [id, text] already
        return [String(entry[0] ?? ''), String(entry[1] ?? '')];
      }
      // { id, text }
      return [String(entry?.id ?? ''), String(entry?.text ?? '')];
    });
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
export const decodeBase64ToState = (base64: string): Record<string, { id: string; text: string }[]> | null => {
  try {
    const parsed = JSON.parse(atob(base64));

    // If legacy wrapper exists, unwrap it
    const raw = (parsed && parsed.items && typeof parsed.items === 'object') ? parsed.items : parsed;

    if (!raw || typeof raw !== 'object') return {};

    const normalized: Record<string, { id: string; text: string }[]> = {};

    for (const [date, arr] of Object.entries(raw)) {
      const list = Array.isArray(arr) ? arr : [];
      normalized[date] = list.map((entry: any) => {
        if (Array.isArray(entry)) {
          return { id: String(entry[0] ?? ''), text: String(entry[1] ?? '') };
        }
        return { id: String(entry?.id ?? ''), text: String(entry?.text ?? '') };
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
export const updateUrlWithState = (state: any): void => {
  const encodedState = encodeStateToBase64(state);
  const url = new URL(window.location.href);
  url.hash = encodedState;
  window.history.replaceState({}, '', url.toString());
};

/**
 * Retrieves items mapping from URL hash (normalized object form)
 * @returns { [date]: [{ id, text }, ...] }
 */
export const getStateFromUrl = (): Record<string, { id: string; text: string }[]> | null => {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  return decodeBase64ToState(hash);
};