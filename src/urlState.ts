// urlState.ts - Functions for managing state in the URL

/**
 * Encodes application state to base64 for URL storage
 * @param state - The state object to encode
 * @returns Base64 encoded string representation of the state
 */
export const encodeStateToBase64 = (state: any): string => {
  return btoa(JSON.stringify(state));
};

/**
 * Decodes base64 encoded state from URL
 * @param base64 - Base64 encoded string to decode
 * @returns Decoded state object or null if decoding fails
 */
export const decodeBase64ToState = (base64: string): any => {
  try {
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error('Failed to decode state from URL:', e);
    return null;
  }
};

/**
 * Updates the URL with encoded state
 * @param state - The state object to encode and store in URL
 */
export const updateUrlWithState = (state: any): void => {
  const encodedState = encodeStateToBase64(state);
  const url = new URL(window.location.href);
  url.hash = encodedState;
  window.history.replaceState({}, '', url.toString());
};

/**
 * Retrieves state from URL hash
 * @returns Decoded state object or null if no state in URL
 */
export const getStateFromUrl = (): any => {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  return decodeBase64ToState(hash);
};