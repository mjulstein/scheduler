// Vitest + Testing Library setup
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure a clean DOM after each test
afterEach(() => {
  cleanup();
});
