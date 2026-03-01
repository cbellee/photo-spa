# Phase 2 Summary — Types, Hooks & API Layer

## Overview

Phase 2 introduced a centralised types system, API client, custom hooks, and environment-driven configuration. All components were migrated to use these new modules, and all tests were updated to match.

**Result:** 20 test files, 116 tests — all passing.

---

## New Modules (5 files)

| File | Purpose |
|------|---------|
| `src/types/index.ts` | 8 shared interfaces/types: `CollectionPhoto`, `Photo`, `ImagePreview`, `UploadPhoto`, `UpdatePhoto`, `TagsResponse`, `CollectionRouteParams`, `PhotoRouteParams` |
| `src/services/apiClient.ts` | Centralised axios instance with `baseURL` from `apiConfig` |
| `src/services/photoService.ts` | Typed read-only API functions: `fetchCollections()`, `fetchAlbums(collection)`, `fetchPhotos(collection, album)`, `fetchTags()` |
| `src/hooks/useAuth.ts` | Auth hook wrapping `useMsal`, `useIsAuthenticated`, `useAccount` + silent token acquisition |
| `src/hooks/useTags.ts` | Tags hook wrapping `fetchTags()` + `Map<string, string[]>` construction |

### Design decisions

- **photoService** handles all read operations; **FileUploadService** continues to handle writes (kept using raw axios to avoid breaking its existing tests).
- **photoService** functions return unwrapped data (`.then(res => res.data)`), so consumers receive data directly instead of `{ data: ... }`.
- **useAuth** returns `{ isAuthenticated, account, token, instance, accounts, inProgress }` where `token` is `string | null` (null until async acquisition completes).
- **useTags** returns `{ collectionAlbumData }` as a `Map<string, string[]>` mapping collection names to album arrays.

---

## Migrated Components (8 files)

### Collections.tsx / AlbumCollections.tsx
- Removed inline `Photo` and `Params` interfaces
- Replaced `axios.get(url)` with `fetchCollections()` / `fetchAlbums(collection)`
- Imported `CollectionPhoto` and `CollectionRouteParams` from shared types

### Photos.tsx
- Removed inline `Photo` and `Params` interfaces
- Replaced `useMsal()` + `getAccessToken()` + `useState(token)` with `useAuth()`
- Replaced `axios.get(url)` with `fetchPhotos(collection, album)` and `fetchTags()`
- Added null-token guard in `saveEditedData`

### Upload.tsx
- Replaced `useIsAuthenticated` + `useMsal` + `getAccessToken` with `useAuth()`
- Replaced `<AuthenticatedTemplate>` / `<UnauthenticatedTemplate>` with `{isAuthenticated ? (...) : (...)}`
- Replaced `axios.get('/tags')` with `fetchTags()` in `checkCollectionExists` / `checkAlbumExists`
- Removed inline `ImagePreview` interface (now imported from types)

### TagSelect.tsx / TagSelectEdit.tsx
- Replaced inline `axios.get` + `useEffect` + `Map` construction with `useTags()` hook
- Removed dead `options` state variable
- Cleaned up unused destructured variables

### FileUploadService.tsx
- Removed 3 inline interface definitions (`Photo`, `UploadPhoto`, `UpdatePhoto`)
- Imported from shared types

---

## Config & Environment (2 files)

### apiConfig.ts
- All 3 values (`tenantId`, `storageApiEndpoint`, `photoApiEndpoint`) now read from `import.meta.env.VITE_*` with `||` fallbacks to original hardcoded values.
- Env vars: `VITE_AZURE_TENANT_ID`, `VITE_STORAGE_API_ENDPOINT`, `VITE_PHOTO_API_ENDPOINT`

### msalConfig.ts
- `clientId`, `authority`, `postLogoutRedirectUri`, and `tokenRequest.scopes` all read from env vars with fallbacks.
- **Fix:** `postLogoutRedirectUri` changed from hardcoded `http://localhost:5173` to `"/"`.
- Env vars: `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_AUTHORITY`, `VITE_POST_LOGOUT_REDIRECT_URI`, `VITE_MSAL_SCOPE`

---

## Test Updates (8 files)

### Updated existing tests (6 files)

| Test file | Change |
|-----------|--------|
| `Collections.test.tsx` | `vi.mock('axios')` → `vi.mock('../services/photoService')` |
| `AlbumCollections.test.tsx` | Same pattern with `fetchAlbums` |
| `Photos.test.tsx` | `vi.mock('axios')` → `vi.mock('../services/photoService')` + `vi.mock('../hooks/useAuth')` with `setupAuthenticated()` / `setupUnauthenticated()` helpers |
| `Upload.test.tsx` | Removed complex MSAL mock (`_isAuthenticated`, `mockUseMsal`, `AuthenticatedTemplate` overrides) → simple `vi.mock('../hooks/useAuth')` |
| `TagSelect.test.tsx` | `vi.mock('axios')` → `vi.mock('../hooks/useTags')` returning a pre-built Map |
| `TagSelectEdit.test.tsx` | Same pattern as TagSelect |

**FileUploadService.test.ts** — unchanged (still mocks raw axios).

### New hook tests (2 files)

| Test file | Tests |
|-----------|-------|
| `src/test/useAuth.test.ts` | 5 tests: unauthenticated returns, token acquisition, error handling, instance passthrough, no-acquire when unauthenticated |
| `src/test/useTags.test.ts` | 4 tests: starts empty, fetches and populates Map, handles error, calls fetchTags once |

### test-utils.tsx
- Added `import type { CollectionPhoto, Photo, TagsResponse }` from shared types
- `createMockPhoto()` return type → `Photo`
- `createMockCollectionPhoto()` return type → `CollectionPhoto`
- `mockTagsResponse` typed as `TagsResponse`
