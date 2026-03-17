# Copilot Instructions

## What this project is

CMS archive frontend for NAV. Two independent archive apps:

- **legacy-archive** – content from 2006–2019 (original Enonic CMS, stored in OpenSearch)
- **xp-archive** – content from 2019+ (Enonic XP CMS, fetched via HTTP API)

## Commands

```bash
# Lint and type-check everything
pnpm run lint

# Dev (run from workspace root or use -C flag)
pnpm run dev -C legacy-archive
pnpm run dev -C xp-archive

# Production build (runs build:client, build:ssr, build:server)
pnpm run build -C legacy-archive
pnpm run build -C xp-archive

# Start production server
pnpm run start -C legacy-archive
pnpm run start -C xp-archive
```

No test suite exists in this repository.

## Architecture

pnpm monorepo with three workspaces:

```
common/src/
  client/    # Shared React components (AppLayout, ArchiveSelector, AppTopSection)
  server/    # Shared Express setup (SSR renderer, error handlers, CSP middleware)
  shared/    # Shared types and utilities

legacy-archive/
  client/    # React UI (search, category tree, content viewer)
  server/    # Express + OpenSearch client
  shared/    # Types shared between legacy client and server

xp-archive/
  client/    # React UI (content tree, content viewer)
  server/    # Express + HTTP calls to nav-enonicxp
  shared/    # Types shared between xp client and server
```

**Each app has three separately-built bundles:**

1. `build:client` – Vite client bundle (ES modules)
2. `build:ssr` – Vite SSR bundle (used by the server to render HTML)
3. `build:server` – esbuild bundle of the Express server (CommonJS `.cjs`)

**SSR hydration flow:**

1. Express server imports the SSR bundle and calls `render()` to produce initial HTML
2. Browser receives HTML with initial state embedded in `<script id="root">`
3. `main-client.tsx` calls `hydrateRoot` to take over
4. SWR hooks call `/api/*` routes for subsequent data fetching

## Key conventions

### TypeScript path aliases

Defined in `tsconfig.json` at root – use these instead of relative imports:

- `@common/*` → `common/src/*`
- `client/*` → `<app>/client/*`
- `shared/*` → `<app>/shared/*`
- `services/*` → `<app>/server/src/services/*`
- `utils/*` → `<app>/server/src/utils/*`

### Where things live

- **Shared types**: `<app>/shared/types.ts`
- **Legacy CMS document types**: `legacy-archive/shared/cms-documents/`
- **Site configs** (legacy archive sites like SBS, FSS): `common/src/shared/siteConfigs.ts`
- **Express routing**: `<app>/server/src/routing/site.ts`
- **API handlers**: `<app>/server/src/services/` (classes with public handler methods typed as Express `RequestHandler`)

### Service pattern

Services are classes; public methods are Express `RequestHandler`s, private methods do the fetching/processing. Example: `ContentService`, `SearchService`, `PdfService`.

### Environment variables

Each app has its own `.env-template`. Key vars:

- **legacy-archive**: `OPEN_SEARCH_URI`, `OPEN_SEARCH_USERNAME`, `OPEN_SEARCH_PASSWORD`, `APP_PORT=3399`
- **xp-archive**: `XP_ORIGIN`, `SERVICE_SECRET`, `HTML_RENDER_API`, `APP_PORT=3499`

### Styling

- CSS Modules (`.module.css`) for component-scoped styles
- Emotion for dynamic styling in legacy-archive
- Global styles in `common/src/client/global.css`
- NAV design system: `@navikt/ds-react`

### Build flags

- `WATCH=true` → esbuild watch mode for server bundle
- `ANALYZE=true` → adds Vite bundle visualizer

### Legacy archive specifics

- Content stored as XML in OpenSearch; parsed with `xml2js` and converted to HTML via `xmlToHtml.ts`
- Multiple named sites (SBS, FSS, etc.) each get their own Express router via `setupSites()`

### XP archive specifics

- Data fetched from `nav-enonicxp` proxy (URL: `XP_ORIGIN` env var) using `SERVICE_SECRET` header
- `HTML_RENDER_API` used to render XP content components server-side via a separate render service
- PDF export uses Puppeteer (launched once per server process)
