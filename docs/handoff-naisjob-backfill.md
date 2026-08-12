# Handoff — XP-arkiv backfill NaisJob (2026-08-11)

> Handoff-dokument for å fortsette arbeidet i en ny chat uten tilgang til den forrige samtalen.
> Skrevet detaljert med vilje. Den korte "Session Start"-versjonen ligger nederst.

---

## 1. Prosjektoversikt

**Repo:** `navno-cms-archive` (pnpm monorepo), `/Users/bdahle/Documents/navno/navno-cms-archive`.
Branch: `xp-arkiv-v2`. PR #344 ("Xp arkiv v2"). Default branch: `main`.

**Hva vi bygger:** Frontend-arkiv for NAVs CMS-innhold. To uavhengige apper:

- `legacy-archive` — innhold 2006–2019 (opprinnelig Enonic CMS, lagret i OpenSearch). Kilde-CMS **avviklet**.
- `xp-archive` — innhold 2019+ (Enonic XP). **Alt arbeidet her gjelder xp-archive.**

**Overordnet mål:** Gjøre xp-arkivet selvstendig fra det kjørende XP-systemet, slik at arkivet
(dokumenter + søk + tre-navigasjon) fungerer også etter at Enonic XP eventuelt avvikles.

**Kritisk arkitektur-innsikt (bruker-bekreftet):** `main`/prod xp-archive bruker IKKE OpenSearch i dag —
prod-arkivet er en **live XP-pass-through** (henter on-demand fra XP, filtrerer `isExcludedFromExternalArchive`
ved fetch, persisterer ingenting). Hele OpenSearch-laget (indeksering, event-push, backfill,
content-tree-fra-indeks) er **ny capability** som kun finnes på feature-branchene. Det finnes altså
ingen prod-arkiv-indeks å korrumpere — blank tavle for go-live-beslutninger.

**Nåværende objektiv:** Ferdigstille og kjøre en **NaisJob** som backfiller hele xp-arkivet inn i
OpenSearch (dev først). Backfill er for tung til å kjøre i den brukervendte poden (OOM-krasj, se §6).
NaisJob-en isolerer backfillen i egen pod med mer RAM og gjenopptar automatisk fra en cursor ved krasj.

---

## 2. Nåværende status — hvor vi slapp

Bruker er tilbake fra 3 ukers ferie og re-orienterer seg. All NaisJob-kode er **bygget og lint-ren
(EXIT=0)**, men **ustaget og aldri kjørt/deployet**.

### Ustaget akkurat nå (verifisert med `git status`)

```
 M xp-archive/server/build.mjs                                  # bygger job.cjs i tillegg til server.cjs
 M xp-archive/server/src/opensearch/XpArchiveOpenSearchClient.ts # save/get/clearCursor
 M xp-archive/server/src/routing/site.ts                        # BackfillService(indexingService, openSearchClient)
 M xp-archive/server/src/services/BackfillService.ts            # runStandaloneBackfill + cursor
?? xp-archive/.nais/backfill-job.yml                            # NaisJob-manifest (NYTT)
?? xp-archive/.nais/vars/backfill-job-dev.yml                   # env-vars dev (NYTT)
?? xp-archive/.nais/vars/backfill-job-prod.yml                  # env-vars prod (NYTT)
?? xp-archive/server/src/job.ts                                 # NaisJob-entrypoint (NYTT)
```

> Merk: mange filer som tidligere var ustaget (BrowserManager, IndexingService-logging, content-tree,
> getVersionsFromIndex, paths.ts, useContentTree.ts, ContentTreeService, ContentService) er **allerede
> committet** på `xp-arkiv-v2`. De er ferdige og verifiserte (se §5). Kun NaisJob-biten står igjen ustaget.

### Siste 5 commits på branchen

```
9d8f71f fix: replace hardcoded BROWSER_RECYCLE_INTERVAL with BATCH_SIZE constant
c524132 fix: adjust browser recycle interval for stability during long indexing runs
bcd9468 fix: remove browser recycling logic from createStaticSnapshot method
a2fba7b feat: add clearChromiumLock function to manage Chromium instance locks
909af46 fix: improve logging for empty HTML snapshots in IndexingService
```

### Neste steg (prioritert)

1. **VERIFISER env-lasting i NaisJob-en før deploy** (se §6 "Åpent funn: dotenv i NaisJob"). Dette er
   det viktigste blokkeringspunktet — job-en kan feile umiddelbart på manglende `XP_ORIGIN`/`HTML_RENDER_API`.
2. Verifiser `command`-stien mot Dockerfile (allerede sjekket her — se §4, stien er korrekt).
3. Bruker stager/committer NaisJob-filene (bruker gjør git selv — se §8).
4. Deploy NaisJob til dev (via CI eller `kubectl apply`/nais deploy-action).
5. Trigger + følg: `kubectl -n navno logs -f job/navno-xp-archive-backfill`.
6. La backfillen kjøre ferdig i dev, overvåk minne og feilrate.

---

## 3. Arkitektur — beslutninger og begrunnelser

### Todeling XP vs xp-archive (grunnprinsipp)

- **enonic-xp eier «hva»**: inklusjonslogikk + enumerering. `isExcludedFromExternalArchive` = previewOnly |
  externalProductUrl | `_path` inneholder 'utkast' | mangler `publish.from`. **Denne logikken finnes KUN i
  enonic-xp — aldri dupliser den i xp-archive.**
- **xp-archive eier «hvordan»**: rendering (Puppeteer static snapshot) + OpenSearch-lagring.

### Arkivet er strengt ADDITIVT

- Fanger alt XP har som arkivet mangler; fjerner ALDRI noe fordi XP endret/slettet.
- `indexAllVersions` overskriver per doc-ID, sletter aldri. Doc-ID = `${nodeId}:${versionId}`.
- Versjoner er immutable → trygt for alltid når fanget. Eneste lovlige sletting = bevisst GDPR/juridisk.

### To komplementære mekanismer

1. **Event-push (fast path)** — FINNES + VIRKER I DEV. enonic-xp PR #2636: `requestArchiveIndexing` på
   `node.pushed` → POST `/api/index?id&locale&versionId` med retry. `ARCHIVE_ORIGIN` dev satt.
   Prod `archiveOrigins.p = ''` → event-push er **no-op i prod** (bevisst, til go-live).
2. **Sweep/backfill NaisJob (completeness)** — DET VI BYGGER NÅ. Førstegangs-backfill + framtidig nattlig sweep.

### Cursor-basert resume (kjernen i NaisJob-designet)

- Backfillen er tung (~3,3 versjoner/sek, timer for hele nav.no). OOM-krasj ville ellers miste all fremdrift.
- Løsning: lagre siste prosesserte `_path` (`after`) per locale i en fast OpenSearch-indeks
  (`xp-archive-backfill-cursor`) hver 10. node. Ved krasj/OOM restarter k8s poden (`restartPolicy: OnFailure`,
  `backoffLimit: 10`), og `runStandaloneBackfill` leser cursor og fortsetter der den slapp.
- Når en locale er ferdig: slett cursor for den locale. Når alt er ferdig: `process.exit(0)`.

### Keyset/cursor-paginering (ikke offset)

- `nodeList`-kontrakten i enonic-xp bruker keyset på `_path` (ikke offset). Grunn: offset traff
  `max_result_window` (~10k) og ga ustabil paginering (skip/dupe) uten sort. Request: `?locale=&after=&count=`
  (`after=''` for start). Respons: `{ nodes, count, nextAfter, hasMore }`. `nextAfter` = fullt `_path` til
  siste RÅ-treff (flyttes over ekskluderte også). `hasMore = hits.length === count`.

### Content-tree fra OpenSearch (allerede committet + verifisert)

- Arkivets tre-navigasjon var en ren XP-proxy → dør XP, mister vi navigering selv om dokumentene overlever.
- Bygget `getContentTreeLevel` (OpenSearch), nytt endepunkt `/api/contentTreeFromIndex`. Klienten bruker
  dette som default nå. Original `/api/contentTree` (XP-proxy) beholdes som rollback (har TODO om sletting).

### Read-write-split (parkert, dokumentert)

- I dag gjør én pod tre ting med `readwrite`: serverer arkivet, event-push-skriving, tung backfill.
- NaisJob-splittingen løser to ting samtidig: (a) **sikkerhet** — den offentlige poden trenger ikke lenger
  slette-kapable credentials (kan bli `read`-only som legacy-arkivet), (b) **isolasjon** — et backfill-krasj
  rammer ikke lenger arkiv-visningen. Nyanse: event-push skriver også og må håndteres separat for full
  `read`-only-paritet. Ikke startet — kommer etter dev-backfill er ferdig.

---

## 4. Filer og komponenter

### NaisJob-spesifikke (ustaget)

**`xp-archive/server/src/job.ts`** (NY) — NaisJob-entrypoint.

- Booter kun backfill-avhengigheter (ingen Express/HTTP): `BrowserManager.create()`, `ContentService`,
  `XpArchiveOpenSearchClient`, `IndexingService`, `BackfillService`.
- Sjekker påkrevde env-vars (`XP_ORIGIN`, `SERVICE_SECRET`, `HTML_RENDER_API`, `OPEN_SEARCH_URI/USERNAME/PASSWORD`)
  og `process.exit(1)` om noe mangler.
- Kaller `backfillService.runStandaloneBackfill()`. Top-level `.catch` → `process.exit(1)`.

**`xp-archive/server/src/services/BackfillService.ts`** (ENDRET) — kjerne-driver.

- Konstruktør: `(indexingService: IndexingService, openSearchClient?: XpArchiveOpenSearchClient)`.
- `PAGE_SIZE = 1000`. `private running` (én kjøring om gangen for HTTP-trigger).
- `fetchLocales()` → GET `externalArchive/locales` (dynamisk liste fra XP).
- `fetchNodeListPage(locale, after)` → GET `externalArchive/nodeList?locale&after&count`.
- `runBackfill(locales, maxNodes?)`: per locale leser cursor (`getCursor`), looper `while (hasMore)`,
  per node `await indexAllVersions(id, locale)` SEKVENSIELT (naturlig pacing, aldri N samtidige renders),
  lagrer cursor hver 10. node (`saveCursor`), sletter cursor når locale er ferdig (`clearCursor`).
- `runStandaloneBackfill()`: NaisJob-inngang — henter locales, `runBackfill(locales)`, `process.exit(0)`.
- `backfillHandler: RequestHandler`: HTTP-trigger (202), fortsatt tilgjengelig på `POST /api/backfill`
  (brukt til dev-testing; NaisJob erstatter den for full kjøring).

**`xp-archive/server/src/opensearch/XpArchiveOpenSearchClient.ts`** (ENDRET) — cursor-persistens.

- `CURSOR_INDEX = 'xp-archive-backfill-cursor'`, `CURSOR_ID = 'current'`, doc-id `${locale}:current`.
- `saveCursor(locale, after)` → `index()` (body: `{ locale, after, updatedAt }`), swallow-error.
- `getCursor(locale)` → `get()` → `._source.after ?? ''`, `.catch(() => '')` (indeks finnes ikke ennå → start på nytt).
- `clearCursor(locale)` → `delete()`, ignorer 404.
- (Fra før, committet: `XP_ARCHIVE_INDEX = 'xp-archive-content-v3'`, mapping med `parentPath: keyword` og
  `html: { type: text, index: false }`; `getContentTreeLevel`; `getVersionsFromIndex`.)

**`xp-archive/server/src/routing/site.ts`** (ENDRET) — wiring.

- Linje 46: `const backfillService = new BackfillService(indexingService, openSearchClient);`
- `ContentTreeService(openSearchClient)`, ruter `/api/contentTree` (TODO slette) + `/api/contentTreeFromIndex`
    - `POST /api/backfill`.

**`xp-archive/server/build.mjs`** (ENDRET) — bygger `dist/server/job.cjs` i tillegg til `server.cjs`
(esbuild via `navno-cms-archive-common/src/server/buildServer.mjs`, `platform: node`, `packages: external`).

**`xp-archive/.nais/backfill-job.yml`** (NY) — `kind: Naisjob`, navn `navno-xp-archive-backfill`, ns `navno`.

- `command: [node, -r, dotenv/config, /app/xp-archive/server/dist/server/job.cjs]`
- `openSearch.access: readwrite`, `accessPolicy.outbound` (xpFrontendApp, xpHost, cdn.nav.no),
  `envFrom.secret`, `resources.limits.memory: 4096Mi` (vs 2048Mi for hovedpoden),
  `restartPolicy: OnFailure`, `backoffLimit: 10`, `ttlSecondsAfterFinished: 86400`.
- `schedule` er **kommentert ut** (manuell/on-demand trigger for initial backfill; sett cron for nattlig sweep senere).

**`xp-archive/.nais/vars/backfill-job-dev.yml`**:

```yaml
openSearchInstance: xp-cms-archive
xpHost: www.dev.nav.no
xpFrontendApp: nav-enonicxp-frontend-dev1
secret: nav-enonicxp-dev1
```

**`xp-archive/.nais/vars/backfill-job-prod.yml`**:

```yaml
openSearchInstance: xp-cms-archive
xpHost: www.nav.no
xpFrontendApp: nav-enonicxp-frontend
secret: nav-enonicxp
```

### Relevante allerede-committede filer

- `xp-archive/server/src/services/IndexingService.ts` — `BATCH_SIZE = 24` (module-level),
  `BROWSER_RECYCLE_INTERVAL = BATCH_SIZE`. Recycle-sjekk MELLOM batches (aldri mid-batch, unngår race).
  Lagrer `path: stripArchiveRootPrefix(json._path)` + `parentPath`. Forbedret logging (warn kun når
  `content.html` fantes men snapshot feilet; stille for foldere/render-løse typer).
- `xp-archive/server/src/services/BrowserManager.ts` — delt Chromium-eier. `getBrowser()` dedupliserer
  samtidig relaunch (én `relaunching`-promise). `recycle()`: `close()` → 500ms sleep → `clearChromiumLock()`
  (rm SingletonLock/Socket/Cookie fra `/tmp/.chromium`) → relaunch.
- `xp-archive/server/src/utils/paths.ts` — `getParentPath`, `getPathName`, `stripArchiveRootPrefix`
  (strip `/content/www.nav.no`-prefiks slik at stier matcher klientens rot=`/`-konvensjon).
- `xp-archive/server/src/services/ContentService.ts` — bruker `getVersionsFromIndex` når doc finnes i
  OpenSearch (unngår XP-avhengighet for indeksert innhold).
- `xp-archive/server/src/services/ContentTreeService.ts` — `getContentTreeFromIndexHandler` + original
  `getContentTreeHandler` (rollback).
- `xp-archive/client/hooks/useContentTree.ts` — peker på `/api/contentTreeFromIndex`.
- `xp-archive/server/src/server.ts` — har `process.on('unhandledRejection')` safety-net
  (dekker IKKE `uncaughtException`).

### Søster-repo (enonic-xp, egne branches, redigerbare via absolutte stier)

- `/Users/bdahle/Documents/navno/nav-enonicxp/` — branch `index-opensearch-archive`.
  `src/main/resources/lib/external-archive/node-list.ts` (COMMITTED `d373ee7e7`): keyset-paginering på
  `_path`, `buildExternalArchiveNodeList(locale, after, count)`, filter
  `isContentLocalized && !isExcludedFromExternalArchive`. `Number.isFinite`-bug fikset (`parsedCount > 0`).
  Services: `externalArchive/nodeList/nodeList.ts`, `externalArchive/locales/locales.ts`.
- `/Users/bdahle/Documents/navno/nav-enonicxp-frontend/` — branch `xp-arkiv-v2`.
    > `grep_search`/`file_search` i denne workspacen når IKKE søster-repoene. Bruk absolutte stier + terminal.

---

## 5. Implementasjonsdetaljer — ferdig / delvis / gjenstår

### Ferdig OG verifisert (committet)

- Content-tree-fra-OpenSearch: bygget + browser-verifisert ende-til-ende med ekte data.
- Browser-krasj-mitigering (BrowserManager, recycle mellom batches, lock-clearing): deployet, feilrate
  stabil (~8, ingen kaskade).
- Empty-HTML-logging-distinksjon: bygget + verifisert i logg.
- `getVersionsFromIndex` (XP-uavhengig versjonsliste): bygget + lint-ren.
- v3-indeks med `parentPath`: opprettet; 15 896 docs indeksert før OOM.

### Ferdig men IKKE kjørt/deployet (ustaget)

- **NaisJob (job.ts + BackfillService.runStandaloneBackfill + cursor-metoder + manifest + vars + build.mjs)**:
  bygget, lint EXIT=0. **Aldri kjørt.**
- Cursor-persistens: bygget, lint-ren, aldri utøvd i praksis.

### Gjenstår

- Verifiser env-lasting i NaisJob (§6 dotenv-funn) — **blokkerer deploy**.
- Kjør backfillen i dev, overvåk.
- Type-filter for "arkiverbar side" (PARKERT — se §9). 76% av indeksert innhold er strukturell støy.
- Slett døde v2/v1-indekser via Aiven-admin (~3,2 GB page-cache-press).
- Undersøk ~1150 node-spesifikke XP 500-feil (§6).
- Verifiser `ARCHIVE_ROOT_PREFIX` for en/nn/se (kun `no` bekreftet).
- Land `noDecorator`-endring i nav-enonicxp-frontend (committet på branch, ikke i main/prod).

---

## 6. Bugs og feilsøking

### LØST: `Number.isFinite is not a function` (enonic nodeList 500)

- **Rot:** XP-runtime = **Nashorn (ES5.1)** — mangler ES6 runtime-APIer (`Number.isFinite/isInteger`,
  `Array.includes/from`, `Object.values/entries`, `String.includes`). TS transpilerer SYNTAX (spread/arrow/
  template) men polyfiller IKKE runtime-APIer. **Bruk ES5-trygge varianter i ALL enonic-xp-kode.**
- **Fiks:** `const countNum = parsedCount > 0 ? Math.min(parsedCount, MAX_COUNT) : DEFAULT_COUNT`
  (`parsedCount > 0` fanger NaN + negativ). COMMITTET (`d373ee7e7`).

### LØST: Content-tree tomt / expand virket ikke

- **Rot 1:** dokumentene lagret rå XP-sti (`/content/www.nav.no/aap`), matchet aldri klientens rot=`/`.
  Fiks: `stripArchiveRootPrefix` ved indeksering.
- **Rot 2:** rot-nivået har aldri eget dokument (kun etterkommere enumereres). Fiks: syntetisk `isEmpty`-node.
- **Rot 3:** `getParentPath`-bug ga rot-stier seg selv som parent. Fikset til `'/'`.
- Verifisert i browser med ekte AAP-node. "Expand virket ikke" forsvant med rent, sammenhengende ekte data
  (den eksakte årsaken til at syntetisk data feilet er ikke fastslått, men `NavigationItem.tsx` ble aldri endret).

### LØST/MITIGERT: Puppeteer `TargetCloseError` + "browser already running"

- **Rot:** recycle fyrte inne i samtidige `createStaticSnapshot`; delt langtlevende Chromium ble ustabil.
- **Fiks:** recycle MELLOM batches, lock-clearing + 500ms sleep, recycle-intervall senket 200 → 24 (=BATCH_SIZE).
  Dramatisk færre feil (~8 stabile vs kaskade).
- Lokalt: nodemon+puppeteer kan etterlate zombie-Chromium som holder `/tmp/.chromium`-lock. Fix: kill
  prosessen med `--user-data-dir=/tmp/.chromium` + `rm SingletonLock/-Socket/-Cookie`.

### DREV NaisJob-beslutningen: OOM-kill (Exit 137, OOMKilled)

- Backfill i hovedpoden traff 2 GB-grensen etter ~1280 noder / ~40 min. → NaisJob med 4 GB + cursor-resume.
- Tidligere full-kjøring krasjet også med `TargetCloseError` etter ~9820 noder / 90 min (ufanget exception
  utenfor try/catch → prosessen døde → k8s restartet poden; additivt, ingenting korrupt, men fremdrift tapt
  fordi running-flag var in-memory). Dette motiverte cursor-persistens.

### ÅPENT: ~1150 node-spesifikke XP 500-feil

- Feilrate eksploderte med skala: 2 % ved 100 noder → 53 % ved 1000 noder. Feil = XP `externalArchive/content` 500.
- **Bruker hadde rett, agent tok feil:** ren test bekreftet at `d4750660` OG `1c807e52` gir HTTP 500 fra XP
  mens XP er IDLE → **NODE-SPESIFIKT bekreftet, last REFUTERT**. En klasse innhold XP ikke klarer å hente.
  Disse blir ALDRI indeksert uansett last.
- **Hypotese:** guillotine-query feiler for visse content-typer/configs (jf. "No type found for input type"-WARN
  i XP-logg). **NESTE:** hent XP-stacktrace for content-500 på én av dem (bruker har XP-logg-tilgang).
- **Robusthetsgap:** driveren mangler per-node timeout — én hengende fetch fryser hele loopen (ikke skjedd, men gap).

### ÅPENT FUNN (ny, oppdaget i denne handoff-gjennomgangen): dotenv i NaisJob

- **Hovedserveren** starter med (Dockerfile CMD):
  `["-r", "dotenv/config", "./dist/server/server.cjs", "dotenv_config_path=../.env"]`
  Base-image ENTRYPOINT = `node`. `WORKDIR /app/xp-archive/server`. `.env` bakes inn på `/app/xp-archive/.env`.
- **`config.yml` har INGEN eksplisitt `env:`** for `XP_ORIGIN`/`HTML_RENDER_API` — de kommer sannsynligvis
  fra den innbakte `.env`-fila (lastet via `dotenv_config_path=../.env`), IKKE fra k8s-secret.
- **NaisJob-kommandoen mangler `dotenv_config_path`:**
  `[node, -r, dotenv/config, /app/xp-archive/server/dist/server/job.cjs]` — cwd = WORKDIR, så dotenv leter
  etter `/app/xp-archive/server/.env` som IKKE finnes (.env ligger på `/app/xp-archive/.env`).
- **Konsekvens (må verifiseres, ikke bekreftet):** NaisJob-en kan feile umiddelbart på `job.ts` sin
  requiredEnv-sjekk fordi `XP_ORIGIN` + `HTML_RENDER_API` ikke er lastet. `OPEN_SEARCH_*` injiseres av nais
  `openSearch:`-blokka; `SERVICE_SECRET` ligger trolig i k8s-secret (`envFrom`).
- **Sannsynlig fiks:** legg til `dotenv_config_path=/app/xp-archive/.env` (eller `../.env`) som siste arg i
  NaisJob `command`, ELLER bekreft at `XP_ORIGIN`/`HTML_RENDER_API` finnes i secret `nav-enonicxp-dev1`.
  **IKKE inspiser secret-innhold lokalt — bruker verifiserer.** Command-STIEN til `job.cjs` er derimot korrekt
  (WORKDIR `/app/xp-archive/server` + COPY `nonsymlink/xp-server/` → `dist/server/job.cjs`).

### LØST tidligere: mapping-konflikt, snapshot-timeout, korrupt versjon

- v1-indeks m/ eksplisitt mapping (`json.enabled=false`). Request-interception i `createStaticSnapshot`
  (abort alt unntatt `document`). Korrupt versjon `c74d032e` (AAP, ugyldig property) — `indexAllVersions`
  samler failed IDs, logger `Skipped N/M`, returnerer suksess med mindre ALT feiler.

---

## 7. Tekniske rammer og begrensninger

- **xp-archive server:** Express + TypeScript, port **3499**, basepath `/xp`. esbuild via `build.mjs`
  (`packages: external`, CommonJS `.cjs`). SSR-hydrering (se copilot-instructions).
- **Nais app:** `navno-xp-archive`, ns `navno`, dev-gcp. Ingresser: `{{appOrigin}}/xp` + `{{internOrigin}}/xp`.
  Hovedpod: 1 replica, `cpu 500m` request, `memory 1024Mi`/`2048Mi`. `openSearch.access: readwrite`.
- **NaisJob:** samme secret/instans, `memory` limit 4096Mi, `OnFailure`/`backoffLimit: 10`.
- **OpenSearch:** Aiven-instans `xp-cms-archive`. Indeks `xp-archive-content-v3`. Cursor-indeks
  `xp-archive-backfill-cursor`.
    - **ACL (dev, xp `readwrite`):** doc-ops + `_count`/`_mapping`/`_settings`/search OK; **PUT create index = 200**;
      **HEAD exists = 403**; **DELETE index = 403**; **GET /<index>-metadata = 403**. → Appen kan opprette men
      IKKE slette indekser eller lese index-metadata. Sletting krever Aiven-admin (`avnadmin`).
      `ensureIndex` er create-and-swallow pga dette.
- **XP-runtime:** Nashorn (ES5.1). XP kjører **on-prem** (`portal-admin-dev.oera.no`, NAV-IP, Telenor),
  UTENFOR nais. Kryss-sky XP→nais må gå via `intern.dev.nav.no`-ingress (ikke `ansatt`, den når XP ikke →
  ConnectException). Løst med `cms-arkiv.intern.dev.nav.no`-ingress.
- **Dockerfile_xp:** base `node:24-dev` (chainguard pull-through), `apk add chromium`,
  `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`, `XDG_CONFIG_HOME`/`XDG_CACHE_HOME=/tmp/.chromium`,
  kjører som `nonroot`. WORKDIR `/app/xp-archive/server`. COPY `nonsymlink/xp-server/` → WORKDIR.
- **Ytelse:** backfill ~3,3 versjoner/sek (batch=24, ~2 CPU-kjerner, ~600Mi). Grovt 25–84 t for hele nav.no
  (ANSLAG). Steady-state sweep er triviell (1 enumerering + diff).
- **Snapshot-fullstendighet:** binærer (bilder, fonter, Qbrick-video) bakes IKKE inn — forblir eksterne
  referanser. Ikke akutt mens nav.no/CDN/Qbrick lever, men luke for ekte langtidsarkiv. Se `docs/arkiv-durabilitet.md`.

---

## 8. Kodekonvensjoner og bruker-preferanser

- **Git (KRITISK):** kjør ALDRI `git add`/`stage`/`commit`/`push` selv, selv når bruker sier "fix"/"go ahead".
  Bruker vil ha full manuell kontroll. Rediger filer fritt; staging/commit gjør bruker selv. Hvis bruker ber
  om commit-melding: gi kun teksten, kjør ikke `git commit`. Korte commit-meldinger, ingen verbose body.
- **IKKE spam commit-meldinger.** Ikke foreslå commit-melding når treet er rent / endringer committet.
- **Språk:** svar på norsk, konsist. Utforsk/forklar FØR implementering. Én ting av gangen. Stopp ved
  logiske bruddpunkter og vent på bekreftelse.
- **VERIFISER, ikke påstå.** Bruker har korrigert agenten mange ganger (last-vs-node-spesifikk, prod-antakelser,
  "throwaway"-rammer). Ikke kall noe "last"/"throwaway"/"prod" uten bevis.
- **Secrets:** håndter ALDRI secrets lokalt (redigér/redakter). Bruker deployer/tester selv (dev-gcp).
- **Cleanups underveis:** se etter dupliserte deps, lokale kopier av delte utilities. Delte deps hoistes via
  workspace — sjekk om ny dep finnes i annen pakke.
- **Ikke lag markdown-doc-filer** for å dokumentere endringer med mindre bruker ber om det (dette dokumentet
  er eksplisitt bedt om).
- **Kodekonvensjoner:** TS path-aliaser (`@common/*`, `client/*`, `shared/*`, `services/*`, `utils/*`).
  Services = klasser; public metoder er Express `RequestHandler`, private gjør fetching/prosessering.
  CSS Modules. Ikke legg til kommentarer/docstrings i kode du ikke endret.
- **Ikke dramatisér durabilitet/hastverk:** XP lever i årevis fremover, ikke en race. xp-archive er en
  gjenoppbyggbar projeksjon av XP. Måneder-lang utviklingsjobb; prioritér brukerverdi/byggerekkefølge.

---

## 9. Kommandoer, URLer, ressurser

```bash
# Lint (fra repo-rot) — EXIT=0 = rent
pnpm run lint                       # tsc --noEmit && eslint

# Dev
pnpm run dev -C xp-archive          # port 3499, basepath /xp
pnpm run build -C xp-archive        # build:client + build:ssr + build:server

# Deploy dev (bruker gjør selv)
gh workflow run "Deploy XP archive to dev" --ref xp-arkiv-v2

# NaisJob (etter deploy)
kubectl -n navno logs -f job/navno-xp-archive-backfill
kubectl -n navno describe job navno-xp-archive-backfill

# OpenSearch-diagnostikk fra poden (readwrite-ACL: _cat/_count OK, ikke DELETE)
kubectl -n navno exec deploy/navno-xp-archive -- <curl _cat/indices etc>

# Backfill HTTP-trigger (dev-testing, ikke full kjøring) — i poden:
# POST http://localhost:3499/xp/api/backfill?locales=no&maxNodes=100  header: secret: $SERVICE_SECRET
```

- PR #344: https://github.com/navikt/navno-cms-archive/pull/344
- Aiven Console: https://console.aiven.io
- Durabilitet-notat: `docs/arkiv-durabilitet.md` (ACL, korrupte versjoner, binær-luke, naisjob-rasjonale, content-tree)
- Minne-filer (repo-scoped, i memory-verktøyet): `/memories/repo/backfill-arkitektur.md`,
  `/memories/repo/navno-cms-archive.md`, `/memories/repo/xp-indexing-session-handoff.md`, `/memories/git-workflow.md`
- Full uncompacted transcript (ved behov for eksakte snippets/feilmeldinger):
  `/Users/bdahle/Library/Application Support/Code/User/workspaceStorage/6556b9e95a85ddd9dffcf7a91eb33ecd/GitHub.copilot-chat/transcripts/3ab45f17-ecf0-4986-8945-42fe0d054aed.jsonl`

---

## 10. Åpne spørsmål, risiko og TODOs (prioritert)

**P0 — blokkerer NaisJob-kjøring**

1. **dotenv/env i NaisJob** (§6): verifiser at `XP_ORIGIN`/`HTML_RENDER_API` når job-en. Sannsynlig fiks:
   legg `dotenv_config_path=/app/xp-archive/.env` sist i `command`, ELLER bekreft at de finnes i k8s-secret.

**P1 — kjøring og korrekthet** 2. Bruker stager/committer NaisJob-filene, deployer til dev, trigger, overvåker minne + feilrate. 3. Cursor-resume aldri utøvd — verifiser at et OOM-restart faktisk plukker opp `after` korrekt. 4. Per-node timeout mangler i driveren (én hengende XP-fetch fryser loopen).

**P2 — datakvalitet / opprydding** 5. **Type-filter for "arkiverbar side"** (PARKERT): 76 % av indeksert innhold er strukturell støy
(megamenu-item 160, page-template 56, user-tests-config 26, base:folder, template-folder). Ville gå i
node-list.ts (enonic). **Produktavgjørelse:** hvilke typer er arkiverbar side? Merk: brukers screenshot av
XP sitt EKTE live-tre viste samme støy → ikke en ny regresjon, paritet med XP. `SearchService.curatedTypes`
er startpunkt, men mangler office-page og har link-typer uten html. 6. Undersøk ~1150 node-spesifikke XP 500 (§6) — hent stacktrace fra XP-logg for `1c807e52`/`d4750660`. 7. Slett døde v2 (3,1 GB) + v1 (149 MB) indekser via `avnadmin` (page-cache-press). Også foreldreløse
`xp-archive-content` + `acl-probe-tmp`.

**P3 — content-tree-opprydding (fra durabilitet-doc)** 8. Verifiser `ARCHIVE_ROOT_PREFIX` for en/nn/se (kun `no` bekreftet — kan feile stille). 9. Barn-rekkefølge alfabetisk vs XP authored `childOrder`. 1000-barns-tak uten paginering. 10. Når P3 ryddet: slett `getContentTreeHandler` + `/api/contentTree`-ruta (reell død kode; TODO ligger i site.ts).

**P4 — arkitektur/sikkerhet** 11. Read-write-split: hovedpod → `read`-only (paritet med legacy). Event-push-skriving må da flyttes/scopes. 12. Aiven snapshot/GCS-backup-strategi (durabilitet-doc). Rotér eksponert dev-secret `nav-enonicxp-dev1`. 13. Land `noDecorator` i nav-enonicxp-frontend.

---

## 11. Kontekst som sparer neste AI for gjentatt utredning / samme feil

- **`git status` ≠ den gamle summary-en.** Mye tidligere "ustaget" arbeid er nå committet. Kun NaisJob-biten
  (4 modified + 4 new) er ustaget. Ikke stol blindt på eldre fil-lister — sjekk `git status`.
- **Prod bruker IKKE OpenSearch.** Ikke anta at endringer her rører prod-arkivet. Ingen prod-indeks finnes.
  76 %-junken er et rent DEV-fenomen; type-filter kan besluttes FØR go-live (blank tavle).
- **Nashorn ES5.1 i enonic-xp.** Ikke bruk ES6 runtime-APIer i søster-repo-koden. TS-build lurer deg
  (syntaks OK, runtime feiler).
- **`grep_search`/`file_search` når ikke søster-repoene.** Bruk absolutte stier + terminal for nav-enonicxp
  og nav-enonicxp-frontend.
- **Node-spesifikke 500 er BEKREFTET node-spesifikke, ikke last.** Ikke gjenta "last"-hypotesen.
- **Aiven readwrite ≠ index-admin.** Kan create doc/index, kan ikke DELETE index eller HEAD/GET metadata (403).
- **Arkivet er additivt.** Aldri foreslå sletting som "opprydding" av indeksert innhold.
- **Content-tree-migreringen ER retningen** (bruker-bekreftet), ikke en engangstest. `/api/contentTreeFromIndex`
  er default; `/api/contentTree` beholdes bevisst som rollback.
- **NaisJob-command-STIEN er korrekt** (verifisert mot Dockerfile). Det åpne punktet er env-lasting (dotenv), ikke stien.

---

# Session Start (lim inn som første melding i ny chat)

Du er nav-pilot. Svar på norsk, konsist. Jeg fortsetter arbeid på `navno-cms-archive`
(`/Users/bdahle/Documents/navno/navno-cms-archive`, branch `xp-arkiv-v2`, PR #344). Full handoff ligger i
`docs/handoff-naisjob-backfill.md` — les den ved behov.

**Hva vi gjør:** Ferdigstille og kjøre en **NaisJob** som backfiller xp-arkivet inn i OpenSearch (dev først).
Backfill er for tung for den brukervendte poden (OOM-krasj, Exit 137). NaisJob-en isolerer backfillen i egen
pod (4 GB RAM) og gjenopptar automatisk fra en OpenSearch-cursor (`xp-archive-backfill-cursor`) ved OOM/krasj.

**Status:** All NaisJob-kode er bygget og lint-ren (`pnpm run lint` EXIT=0) men **ustaget og aldri kjørt**.
Ustaget: `xp-archive/server/src/job.ts` (ny entrypoint), `.../services/BackfillService.ts`
(`runStandaloneBackfill` + cursor), `.../opensearch/XpArchiveOpenSearchClient.ts` (save/get/clearCursor),
`.../routing/site.ts` (wiring), `server/build.mjs` (bygger `job.cjs`), `.nais/backfill-job.yml` (manifest),
`.nais/vars/backfill-job-{dev,prod}.yml`.

**Neste steg (prioritert):**

1. **P0 — verifiser env-lasting i NaisJob FØR deploy.** Hovedserveren laster innbakt `.env` via
   Dockerfile CMD `dotenv_config_path=../.env`. `config.yml` har ingen eksplisitt `env:` for `XP_ORIGIN`/
   `HTML_RENDER_API`, så de kommer trolig fra `.env`, ikke k8s-secret. NaisJob-`command` mangler
   `dotenv_config_path` → kan feile på `job.ts` requiredEnv-sjekk. Sannsynlig fiks: legg
   `dotenv_config_path=/app/xp-archive/.env` sist i `command`, ELLER bekreft at `XP_ORIGIN`+`HTML_RENDER_API`
   finnes i secret `nav-enonicxp-dev1`. (Command-STIEN `/app/xp-archive/server/dist/server/job.cjs` er
   allerede verifisert korrekt mot Dockerfile.)
2. Bruker stager/committer, deployer til dev, trigger, følger `kubectl -n navno logs -f job/navno-xp-archive-backfill`.
3. Verifiser at cursor-resume faktisk plukker opp `after` ved et restart (aldri utøvd).

**Kritiske regler:**

- **Git:** kjør ALDRI `git add/commit/push` — bruker gjør all git selv. Rediger filer fritt.
- **VERIFISER, ikke påstå.** Bruker har korrigert agenten ofte. Ikke håndter secrets lokalt.
- **Prod bruker IKKE OpenSearch** (live XP-pass-through). OpenSearch-laget er ny capability kun på branchen —
  ingen prod-data å korrumpere.
- **Enonic-xp = Nashorn (ES5.1)** — ingen ES6 runtime-APIer i søster-repo `nav-enonicxp`
  (`/Users/bdahle/Documents/navno/nav-enonicxp/`, branch `index-opensearch-archive`). `grep_search` når IKKE dit.
- **Aiven readwrite ≠ index-admin:** kan create, kan ikke DELETE index (403). Arkivet er additivt.
- Utforsk/forklar før implementering, én ting av gangen, stopp ved bruddpunkter.

**Kjente åpne (ikke-blokkerende):** ~1150 node-spesifikke XP 500 (bekreftet node-spesifikke, ikke last —
hent XP-stacktrace); type-filter for "arkiverbar side" (76 % strukturell støy, produktavgjørelse, PARKERT);
`ARCHIVE_ROOT_PREFIX` kun verifisert for `no`; døde v2/v1-indekser bør slettes av `avnadmin`; per-node
timeout mangler i driveren.
