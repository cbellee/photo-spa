# Photo SPA — Simplification & Modularisation Plan

## Overview

This plan covers three phases of improvements to the photo-spa React application.
Phase 0 (tooling) and Phase 1 (tests) are complete. Phases 2 and 3 are the refactoring work.

---

## Phase 0 — Tooling & Infrastructure ✅

| # | Task | Status |
|---|------|--------|
| 0.1 | Add `tsconfig.json` (strict mode, path aliases) | Done |
| 0.2 | Install Vitest, Testing Library, happy-dom | Done |
| 0.3 | Configure Vitest in `vite.config.js` | Done |
| 0.4 | Create `src/test/setup.ts` (jest-dom, CSS mocks, localStorage, matchMedia) | Done |
| 0.5 | Create `src/test/test-utils.tsx` (renderWithProviders, mock factories) | Done |
| 0.6 | Add `test`, `test:watch`, `test:coverage` scripts | Done |

---

## Phase 1 — Unit Tests for Existing Behaviour ✅

**107 tests across 18 test files — all green.**

| # | Test File | Tests | Notes |
|---|-----------|-------|-------|
| 1.1 | Footer.test.tsx | 5 | Year, text, dark theme, CSS typo documented |
| 1.2 | About.test.tsx | 3 | Description, tech mentions, dark theme |
| 1.3 | ErrorPage.test.tsx | 4 | Heading, error message, statusText, container id |
| 1.4 | PhotoExifData.test.tsx | 5 | Valid JSON, heading, null/empty, invalid JSON crash documented |
| 1.5 | Layout.test.tsx | 3 | Header/Footer presence, Outlet, dark theme |
| 1.6 | MultiRadio.test.tsx | 6 | Label, radio name, handler, checked/unchecked, htmlFor |
| 1.7 | Header.test.tsx | 10 | Nav links, auth-gated Upload, logo, hamburger, welcome msg, theme toggle |
| 1.8 | SignInAndOut.test.tsx | 7 | Sign In/Out toggle, loginPopup, logoutPopup, dead token bug |
| 1.9 | TagSelect.test.tsx | 5 | Labels, tag fetch, children, dropdowns, dead state documented |
| 1.10 | TagSelectEdit.test.tsx | 6 | Labels, tag fetch, defaults, children, duplication + onFocus bug |
| 1.11 | Collections.test.tsx | 9 | Loading, fetch, photos, collection links, breadcrumb, error, dead state |
| 1.12 | AlbumCollections.test.tsx | 8 | Loading, fetch, albums, breadcrumb, links, error, duplication |
| 1.13 | Photos.test.tsx | 11 | Loading, fetch, photos, breadcrumb, edit auth, toggle, save bug, error |
| 1.14 | Upload.test.tsx | 8 | Auth gate, form, file input, upload button, validation, tag select, typo bug |
| 1.15 | FileUploadService.test.ts | 5 | Upload POST, photo field, onProgress, update PUT, getFiles GET |
| 1.16 | utils.test.ts | 4 | acquireTokenSilent, setToken callback, error logging, any-typed instance |
| 1.17 | ThemeContext.test.tsx | 5 | Default dark, toggle, round-trip, localStorage persist, error outside provider |
| 1.18 | App.test.tsx | 3 | Render without crash, router-in-body bug, dead props documented |

### Known Bugs Documented by Tests

- **Footer.tsx**: CSS class `text-centeruppercase` — missing space between utilities
- **PhotoExifData.tsx**: Crashes on invalid JSON with no error boundary
- **Upload.tsx**: `progressMessage` uses typo `progess`
- **Upload.tsx**: `await setImagePreviews(...)` is a no-op (setState doesn't return a promise)
- **SignInAndOut.tsx**: Acquires token via `acquireTokenSilent` but never uses or exposes it
- **Header.tsx**: Declares `userName` state but never calls `setUserName`
- **App.tsx**: Passes `instance` prop to `<Layout>` which doesn't accept it; `<Router>` wraps `<body>` element
- **Photos.tsx**: "Save All Photos" sends updates to every photo, not just changed ones
- **TagSelectEdit.tsx**: Nearly identical to TagSelect (duplication); `onFocus` handler has stale ref

---

## Phase 2 — Types, Hooks & API Layer

### 2A — Shared Types (`src/types/index.ts`)

| # | Task |
|---|------|
| 2A.1 | Create `Photo`, `CollectionPhoto`, `Album`, `Collection` interfaces from inline shapes in Collections, AlbumCollections, Photos |
| 2A.2 | Create `TagsResponse` type (Record<string, string[]>) used by TagSelect, TagSelectEdit, Upload |
| 2A.3 | Create `ImagePreview` interface used by Upload |
| 2A.4 | Create `ExifData` interface for PhotoExifData |
| 2A.5 | Replace all inline/implicit types with shared imports across components |

### 2B — Centralised API Client (`src/services/apiClient.ts`)

| # | Task |
|---|------|
| 2B.1 | Create axios instance with `baseURL` from `apiConfig.photoApiEndpoint` |
| 2B.2 | Add request interceptor for auth token injection |
| 2B.3 | Add response interceptor for error normalisation |
| 2B.4 | Create `photoService.ts` — typed functions: `getCollections()`, `getAlbums(collection)`, `getPhotos(collection, album)`, `getTags()`, `updatePhoto(id, data)` |
| 2B.5 | Migrate Collections, AlbumCollections, Photos, Upload, TagSelect, TagSelectEdit to use `photoService` |
| 2B.6 | Update FileUploadService to use shared `apiClient` |

### 2C — Custom Hooks

| # | Task |
|---|------|
| 2C.1 | `useAuth()` — wraps useMsal + useIsAuthenticated + useAccount + getAccessToken; returns `{ isAuthenticated, account, token, login, logout }` |
| 2C.2 | `usePhotos(collection, album)` — fetches photos, manages loading/error state |
| 2C.3 | `useCollections()` — fetches collections, manages loading/error state |
| 2C.4 | `useAlbums(collection)` — fetches albums, manages loading/error state |
| 2C.5 | `useTags()` — fetches tags, manages loading/error state |
| 2C.6 | Migrate components to use hooks instead of inline fetch logic |

### 2D — Config & Environment

| # | Task |
|---|------|
| 2D.1 | Move hardcoded API endpoint to `VITE_API_ENDPOINT` env var |
| 2D.2 | Move MSAL clientId/authority to env vars |
| 2D.3 | Remove `_template` config files or add `.env.example` |

---

## Phase 3 — Component Splitting & Cleanup

### 3A — Component Refactoring

| # | Task |
|---|------|
| 3A.1 | Extract `NavLinks` sub-component from Header (desktop + mobile nav share same link list) |
| 3A.2 | Extract `MobileMenu` sub-component from Header |
| 3A.3 | Merge TagSelect + TagSelectEdit into single `TagSelector` with mode prop (`"create"` / `"edit"`) |
| 3A.4 | Extract `PhotoGrid` component (shared between Collections, AlbumCollections, Photos) |
| 3A.5 | Extract `Breadcrumb` component (duplicated in Collections, AlbumCollections, Photos) |
| 3A.6 | Extract `LoadingSpinner` component (duplicated everywhere) |
| 3A.7 | Split Upload into `UploadForm` + `ImagePreviewGrid` sub-components |

### 3B — Dead Code & Dependency Cleanup

| # | Task |
|---|------|
| 3B.1 | Remove unused dependencies: `antd`, `bootstrap`, `react-bootstrap`, `styled-components`, `@mui/styled-engine-sc`, `localforage`, `match-sorter`, `sort-by`, `js-base64` |
| 3B.2 | Remove dead state: `userName` in Header, `index` in Collections, `options` in TagSelect |
| 3B.3 | Remove dead `useEffect` dependency arrays (Collections, AlbumCollections) |
| 3B.4 | Fix `text-centeruppercase` CSS typo in Footer |
| 3B.5 | Add error boundary around PhotoExifData JSON parsing |
| 3B.6 | Fix "Save All" in Photos to only send changed photos |

### 3C — Re-validate

| # | Task |
|---|------|
| 3C.1 | Run full test suite after each sub-phase |
| 3C.2 | Update tests for any changed component APIs |
| 3C.3 | Run `npm run build` to verify no TypeScript / build errors |