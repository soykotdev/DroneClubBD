import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — Navbar/useReducedMotion/etc. read it,
// so every test gets a harmless default ("no preference matched") stub.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}
