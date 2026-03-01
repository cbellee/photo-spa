import '@testing-library/jest-dom';

// Mock CSS imports that vitest/jsdom can't handle
vi.mock('react-photo-album/rows.css', () => ({}));
vi.mock('yet-another-react-lightbox/styles.css', () => ({}));
vi.mock('yet-another-react-lightbox/plugins/thumbnails.css', () => ({}));
vi.mock('../styles/multiradio.css', () => ({}));
vi.mock('../styles/tailwind.output.css', () => ({}));
vi.mock('./index.css', () => ({}));
vi.mock('./app.css', () => ({}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Suppress console.error for expected errors in tests (optional, can be overridden per test)
// const originalConsoleError = console.error;
// beforeAll(() => {
//   console.error = (...args: any[]) => {
//     if (typeof args[0] === 'string' && args[0].includes('React does not recognize')) return;
//     originalConsoleError(...args);
//   };
// });
// afterAll(() => {
//   console.error = originalConsoleError;
// });
