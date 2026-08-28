# Handoff — XP-arkiv backfill NaisJob (2026-08-14, v2)

> Handoff-dokument for å fortsette arbeidet i en ny chat uten tilgang til den forrige samtalen.
> Skrevet detaljert med vilje. Den korte "Session Start"-versjonen ligger nederst.
> Denne versjonen ERSTATTER 2026-08-11-versjonen: NaisJob-en er nå fullt verifisert ende-til-ende i dev.
> Gjenstående arbeid er kun P2/P3/P4-opprydding (se §10), ingen P0/P1-blokkere lenger.

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

## 2. Nåværende status — FULLT VERIFISERT ENDE-TIL-ENDE (2026-08-14)

Alt NaisJob-relatert arbeid som var ustaget i 2026-08-11-versjonen er nå **committet, deployet, kjørt
og verifisert vellykket** i dev. Sjekk alltid `git status` selv — ikke stol på gamle fil-lister.

**Resultat av full backfill-kjøring:** `Backfill ferdig: 9000 noder indeksert, 0 feilet – 7818s`
(job `navno-xp-archive-backfill-7`, restartet 1 gang underveis — dette var den første reelle testen
av cursor-resume, og den besto: jobben endte `Complete`, `1/1`, med 0 feilet totalt).
OpenSearch-indeks `xp-archive-content-v3` har 30 347 docs totalt (kumulativt over alle kjøringer).

**To rotårsaker ble funnet og fikset underveis** (ingen av de opprinnelige P0/P1-hypotesene i denne
handoff-en fra 2026-08-11 var de faktiske blokkerne — se §6 for full historikk):

1. **NetworkPolicy — topartsavtale manglet.** `navno-xp-archive-backfill` (ny app-identitet, egen
   NaisJob) manglet `accessPolicy.inbound`-regel i `nav-enonicxp-frontend`s `config.yml`. Caller-siden
   (vår egress) var OK, men target-siden (deres ingress) manglet oss. Fikset i søsterrepoet
   (commit `31a85f044`, branch `xp-arkiv-v2`).
2. **Puppeteer/Chromium versjonsmismatch.** `apk add --no-cache chromium` (upinnet i `Dockerfile_xp`)
   hadde installert en Chromium 3 hovedversjoner nyere enn det pinnede Puppeteer-npm-paketet forventet
   → 100 % `Connection closed` på ALL `newPage()`/snapshot, uavhengig av CPU/shm/zygote (tre blindveier,
   alle reversert). Fikset ved å bumpe `puppeteer` i `pnpm-workspace.yaml`-katalogen til en versjon som
   matcher den faktisk installerte Chromium-build-linjen.

**Kjent, delvis uløst drift-risiko:** dev1 er et DELT miljø. Etter at backfill-kjøringen fullførte, ble
NetworkPolicy-fiksen i `nav-enonicxp-frontend` midlertidig BORTE fra live state (noen redeployet appen
fra en annen branch/eldre commit — config.yml erstattes fullstendig ved hver deploy, merges ikke).
Bruker redeployet fra `xp-arkiv-v2` igjen 2026-08-14, og fiksen er **verifisert tilbake** (se §9 for
kommandoen som bekrefter dette). Men fiksen er ikke merget til `main` i søsterrepoet ennå — den kan i
prinsippet forsvinne igjen ved neste vilkårlige redeploy fra andre team/branches. Vurder å merge/lande
den permanent (se §10, P4).

### Neste steg (kun opprydding igjen, ingen blokkere)

Se full prioritert liste i §10. Kort oppsummert: (a) produktbeslutning om type-filter for "arkiverbar
side" (76 % av indeksert innhold er strukturell støy), (b) undersøk hvorfor en tidligere, mye mindre
testkjøring hadde ~1150 node-spesifikke XP-500-feil som IKKE gjentok seg i denne fulle 9000-node-kjøringen
(0 feilet — uforklart avvik, ikke hastverk), (c) slett døde v1/v2 OpenSearch-indekser via Aiven-admin,
(d) vurder å merge NetworkPolicy-fiksen til `main` i nav-enonicxp-frontend for å stoppe drift-risikoen,
(e) read-write-split (parkert, se `docs/arkiv-durabilitet.md`).

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

### NaisJob-spesifikke (nå COMMITTET + deployet + kjørt vellykket)

**`xp-archive/server/src/job.ts`** — NaisJob-entrypoint. Senere omdøpt til `backfillJob.ts`
(og tilsvarende `dist/server/backfillJob.cjs`) — sjekk faktisk filnavn i workspace, ikke stol blindt på
dette dokumentet for eksakt navn.

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

**`xp-archive/.nais/backfill-job.yml`** — `kind: Naisjob`, navn `navno-xp-archive-backfill`, ns `navno`.
DEPLOYET OG KJØRT VELLYKKET (2026-08-13/14).

- `command: [node, -r, dotenv/config, /app/xp-archive/server/dist/server/backfillJob.cjs, dotenv_config_path=/app/xp-archive/.env]`
  (dotenv-argumentet var P0-fiksen — se §6).
- `openSearch.access: readwrite`, `accessPolicy.outbound` (xpFrontendApp, xpHost, cdn.nav.no),
  `envFrom.secret`, `resources.requests.cpu: 2000m` (bumpet fra 500m under feilsøking — IKKE den
  faktiske rotårsaken, men beholdt som rimelig siden jobben spawner opptil 24 samtidige Chromium-renderere),
  `resources.limits.memory: 4096Mi`, `restartPolicy: OnFailure`, `backoffLimit: 10`, `ttlSecondsAfterFinished: 86400`.
- Template-placeholders (`{{ image }}` osv.) må IKKE ha mellomrom mellom klammene — en formatter kan
  mangle dem til `{ { image } }` ved lagring; pakk inn i enkeltfnutter (`'{{ image }}'`) for å hindre dette.
- `schedule` er **kommentert ut** (manuell/on-demand trigger for initial backfill; sett cron for nattlig sweep senere).
- CI: `.github/workflows/xp-archive-deploy-dev.yml` har nå et eget deploy-steg for denne manifesten
  (gjenbruker image fra hovedbygget via `outputs.image` på den delte composite-action). Bevisst IKKE
  lagt i prod-workflowen (unngår at hver push til main auto-trigger en tung backfill i prod).

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

### Ferdig OG kjørt vellykket (2026-08-13/14)

- **NaisJob** (entrypoint + `BackfillService.runStandaloneBackfill` + cursor-metoder + manifest + vars +
  `build.mjs`): committet, deployet, kjørt til `Complete` med 9000 noder / 0 feilet.
- **Cursor-persistens**: utøvd i praksis — jobben restartet 1 gang midt i kjøringen og fortsatte korrekt
  fra cursor (bekreftet via at sluttresultatet var konsistent, 0 feilet totalt).
- **NetworkPolicy-fiks** (nav-enonicxp-frontend): committet og verifisert live (se §2).
- **Puppeteer/Chromium-versjonsfiks**: committet i `pnpm-workspace.yaml`, verifisert løser problemet 100 %.

### Gjenstår (kun opprydding/produktbeslutninger, se §10 for full prioritert liste)

- Type-filter for "arkiverbar side" (PARKERT). 76 % av indeksert innhold er strukturell støy.
- Slett døde v2/v1-indekser via Aiven-admin (~3,2 GB page-cache-press).
- Undersøk hvorfor ~1150 node-spesifikke XP 500-feil fra en tidligere, mye mindre testkjøring IKKE
  gjentok seg i denne fulle 9000-node-kjøringen (0 feilet) — uforklart avvik, ikke hastverk.
- Verifiser `ARCHIVE_ROOT_PREFIX` for en/nn/se (kun `no` bekreftet).
- Land `noDecorator`-endring i nav-enonicxp-frontend (committet på branch, ikke i main/prod).
- Vurder å merge NetworkPolicy accessPolicy-fiksen til `main` i nav-enonicxp-frontend (drift-risiko, se §2).
- Vurder å pinne `chromium`-versjonen i `Dockerfile_xp` (eller droppe `PUPPETEER_SKIP_DOWNLOAD`/
  `PUPPETEER_EXECUTABLE_PATH` slik at Puppeteer laster sin egen matchende build) — systemisk drift-risiko
  siden `apk add` uten versjonspin installerer nyeste hver gang imaget bygges på nytt.

---

## 6. Bugs og feilsøking

### LØST (2026-08-14): NetworkPolicy — topartsavtale manglet for ny app-identitet

- **Rot:** Nais NetworkPolicy krever at BEGGE sider lister hverandre: callerens `accessPolicy.outbound`
  OG targetens `accessPolicy.inbound`. `navno-xp-archive-backfill` er en helt ny app-identitet (egen
  NaisJob, ikke samme identitet som `navno-xp-archive`), og `nav-enonicxp-frontend`s `config.yml` hadde
  kun `navno-xp-archive` i sin inbound-allowlist, ikke den nye backfill-identiteten.
- **Symptom:** 100 % `TypeError: fetch failed` fra `ContentService.getContentHtml()` mot
  `render-from-props`, selv om caller-siden (vår egress) så identisk ut som den fungerende hovedappen.
  Første (feilaktige) hypotese: sammenlignet kun egress-reglene og konkluderte "ikke en policy-feil" —
  ufullstendig, fordi ingress-siden hos target aldri ble sjekket.
- **Verifisering:** `kubectl exec deploy/navno-xp-archive -- node -e "fetch(...)"` ga `status 404`
  (hovedappen NÅR target), mens NaisJob-en feilet vedvarende — beviste at det var identitetsspesifikt,
  ikke et generelt DNS/nettverksproblem.
- **Fiks:** la til `navno-xp-archive-backfill` i `nav-enonicxp-frontend/.nais/config.yml` sin
  `accessPolicy.inbound.rules`. Committet der (`31a85f044`, branch `xp-arkiv-v2`).
- **Drift-risiko (delvis uløst):** dev1 er delt miljø — config.yml erstattes helt (ikke merges) ved
  hver deploy. Fiksen forsvant midlertidig fra live state da noen redeployet fra en annen branch/commit,
  men ble gjenopprettet 2026-08-14 (se §2, §9). Vurder å merge til `main` for å stoppe gjentakelse.

### LØST (2026-08-14): Puppeteer/Chromium versjonsmismatch — "Connection closed" på ALL snapshot

- **Symptom:** etter at NetworkPolicy-fiksen løste HTML-henting, feilet HVER ENESTE
  `createStaticSnapshot()`-kall med `Connection closed` fra Puppeteer.
- **Tre blindveier prøvd og forkastet (alle basert på plausible, men feil hypoteser):**
  (a) `/dev/shm` for lite → la til `--disable-dev-shm-usage` + Memory-backed emptyDir. Ingen effekt.
  (b) CPU-sult fra 24 samtidige Puppeteer-sider → bumpet `requests.cpu` 500m→2000m. Ingen effekt
  (beholdt likevel som rimelig, se §4).
  (c) Zygote/seccomp-støy (`Failed to adjust OOM score... Permission denied (13)`) → la til `--no-zygote`.
  Ingen effekt (reversert).
- **Avgjørende A/B-test:** kjørte SAMME kode (med alle 3 "fikser" fortsatt aktive) via hovedappens
  HTTP-endepunkt (`POST /api/backfill`) i stedet for NaisJob-en — feilet 100 % IDENTISK. Beviste at det
  var en kode-/avhengighetsregresjon delt av begge deployments, IKKE et NaisJob-spesifikt miljøproblem.
- **Faktisk rotårsak:** `kubectl exec ... -- chromium --version` → `Chromium 151.0.7922.137`. Kryssjekket
  mot Puppeteers offisielle kompatibilitetstabell (https://pptr.dev/supported-browsers) → pinnet
  Puppeteer-versjon forventet Chrome for Testing **148.0.7778.97** — 3 hovedversjoner avvik. Dette
  forklarer symptommønsteret eksakt: DevTools-websocket koblet alltid til fint (bekreftet via
  `dumpio: true`-diagnostikk, "DevTools listening on ws://..." hver gang), men nyere/inkompatibel
  CDP-semantikk for `Target.createTarget`/sideopprettelse feilet konsekvent.
- **Fiks:** reverterte alle 3 blindveier (shm-flagg og zygote-flagg reversert, CPU-bump beholdt som
  harmløs), bumpet `puppeteer` i `pnpm-workspace.yaml`-katalogen til en versjon som matcher den faktisk
  installerte Chromium-build-linjen (samme build-linje 7922.x). `pnpm install` (unsandboxed) regenererte
  lockfilen, `pnpm run lint` bekreftet ingen TS/API-brekkasje fra major-versjonsbumpen.
- **LÆRDOM (systemisk, ikke fullt løst):** `apk add --no-cache chromium` (upinnet) i `Dockerfile_xp`
  installerer alltid nyeste Chromium ved image-rebuild — vil drifte igjen. Permanent fiks (ikke gjort):
  pin chromium-versjonen eksplisitt, ELLER fjern `PUPPETEER_SKIP_DOWNLOAD`/`PUPPETEER_EXECUTABLE_PATH`
  slik at Puppeteer laster ned sin egen matchende Chrome for Testing-binær i stedet.

### LØST/AVKLART: `kubectl logs -f`-strømming brytes midt i lange kjøringer

- `read tcp ...: connection reset by peer` under en flere-timers `kubectl logs -f` er en CLIENT-side
  TCP-frakobling (vanlig for langvarige log-streaming-sesjoner), IKKE et tegn på at jobben/poden feilet.
  Bekreft alltid faktisk jobb-helse via `kubectl get pods`/`get job` i stedet for å stole på om
  log-strømmen forble tilkoblet.

### LØST tidligere (2026-08-11, historisk — dotenv/env i NaisJob)

- Opprinnelig hypotese om at NaisJob-en manglet `dotenv_config_path` og derfor ville feile på manglende
  `XP_ORIGIN`/`HTML_RENDER_API` VISTE SEG Å VÆRE KORREKT og var den faktiske P0-fiksen — se `command`
  i §4. Denne var reell og nødvendig, men var IKKE hovedblokkeren for at kjøringen lyktes — de to nye
  rotårsakene over (NetworkPolicy, Puppeteer/Chromium) var det som faktisk avgjorde suksess/fiasko.

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

# Deploy dev (bruker gjør selv) — rører IKKE backfill-jobben
gh workflow run "Deploy XP archive to dev" --ref xp-arkiv-v2

# Deploy dev OG start full backfill (se §10 P1.1c)
gh workflow run "Deploy XP archive to dev" --ref xp-arkiv-v2 -f startBackfill=true

# NaisJob (etter deploy)
kubectl -n navno logs -f job/navno-xp-archive-backfill
kubectl -n navno describe job navno-xp-archive-backfill
kubectl -n navno get job navno-xp-archive-backfill    # sjekk faktisk COMPLETIONS/status, ikke bare logg-strømmen

# Verifiser at NetworkPolicy-fiksen er live (topartsavtale — se §2, §6)
kubectl -n navno get networkpolicy nav-enonicxp-frontend-dev1 -o yaml | grep -B3 "navno-xp-archive"
# forventet: både "navno-xp-archive" OG "navno-xp-archive-backfill" i output

# Sjekk installert Chromium-versjon i poden (drift-risiko, se §6)
kubectl -n navno exec deploy/navno-xp-archive -- chromium --version

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

**Ingen P0/P1-blokkere lenger.** NaisJob-en er fullt verifisert ende-til-ende (§2). Gjenstående punkter
er opprydding og produktbeslutninger, ingen av dem hindrer normal drift.

> **Nytt 2026-08-25:** verifisering mot XP avdekket flere forhold, se **§12**. Kort oppsummert, vektet
> etter at søk er primær inngang og treet sekundært:
>
> - **Dekningen er verifisert og god** (§12.9): `no` 99,97 %, `nn` 100 %, `en` 99,93 %, `se` 5 av 6.
>   De få manglende er innhold publisert bak cursoren under kjøringen — jobb for den nattlige sweepen.
> - **De fire sidene som vises i `main` men mangler i arkivet er IKKE et hull** (§12.4). XP enumererer
>   dem ikke; de er upubliserte. Arkivet gjør det riktige.
> - **Søket treffer kun på tittel** (§12.1) — `searchText` fylles aldri. Vurdert akseptabelt for nå,
>   men det er den reelle begrensningen på hovedinngangen.
> - **Foreldreløse noder** (§12.3) — kosmetisk, innholdet er søkbart.
> - **Arkivtreet er historisk, XP sitt er nåtidig** (§12.2) — produktbeslutning, ikke feil.
>   Ikke bruk tre-diff mot XP som dekningsmål.

**P1 — drift-risiko som bør lukkes snart**

1. **Merge NetworkPolicy accessPolicy-fiksen til `main`** i nav-enonicxp-frontend (§2, §6) — den er kun
   på `xp-arkiv-v2` og kan forsvinne igjen når noen redeployer dev1 fra en annen branch/commit.
   1b. **Den «nattlige sweepen» finnes ikke — backfillen er en full omkjøring.** ⚠️ Ikke bare fjern
   kommentaren foran `schedule` i `.nais/backfill-job.yml`. To grunner:
    - `runBackfill` re-indekserer **alt** hver kjøring. Den hopper ikke over versjoner som allerede
      finnes i indeksen, så den kan ikke brukes som inkrementell sweep slik den står.
    - `concurrencyPolicy` står på standardverdien `Allow`. Tar en kjøring lengre tid enn intervallet,
      stabler jobbene seg oppå hverandre.

    **Kjøretiden er ikke verifisert.** Bruker husker at hele backfillen ble ferdig på under et døgn.
    Den eksakte varigheten står i sluttlinja `Backfill ferdig: N noder indeksert, M feilet – Xs` —
    finnes i Loki for `navno-xp-archive-backfill` rundt 18.–19. august 2026. Avklar den før du
    velger intervall.

1c. **NaisJob-en startet full reindeks ved hver deploy — LØST I DEV 2026-08-28.** Uten `schedule`
kjører en NaisJob når den blir applied, og dev-workflowen applier den ved hver eneste deploy av
appen. Det var **et bevisst testtiltak** mens backfillen ble utviklet i dev: hver deploy ga en fersk
full kjøring uten manuelt steg.

    **Fikset i dev:** `xp-archive-deploy-dev.yml` har nå en `workflow_dispatch`-input
    `startBackfill` (boolean, default `false`), og backfill-steget står bak
    `if: ${{ inputs.startBackfill }}`. Et vanlig deploy rører dermed ikke NaisJob-en. Den
    eksisterende jobbressursen blir stående i clusteret, men re-kjører ikke før manifestet applies
    på nytt — altså når man krysser av.

    **Fortsatt åpent for prod:** backfill-steget finnes **kun** i dev-workflowen. Prod har derfor
    ingen mekanisme for å kjøre backfillen i det hele tatt. Den planlagte fulle reindekseringen i
    prod har ingen vei via CI i dag, og det må løses før den dagen. Det er en større beslutning enn
    dev-avkrysningen: hvem som skal kunne trigge den, og hvordan man unngår at et rutinedeploy gjør
    det utilsiktet.

    Konsekvensene som gjorde dette nødvendig, for ordens skyld:
    - Et deploy som ikke har noe med indeksering å gjøre trigget en flertimers full reindeks.
    - En pågående backfill ble drept midt i (§12.8), og cursoren har bare side-granularitet.

    De 16 restnodene fra §12.9 (innhold publisert bak cursoren under kjøringen) krever uansett en ekte
    inkrementell sweep — designarbeid, ikke bare en konfigendring. Alternativt kan event-push (§3) dekke
    behovet i steady state, og sweepen reduseres til en sjelden fullkontroll.

2. **Chromium/Puppeteer-versjonsdrift** — utredet 2026-08-17, beslutning tatt, IKKE implementert ennå.
Rotårsaken er at `apk add chromium` (upinnet, Wolfi ruller fritt) og `puppeteer` i pnpm-katalogen har
to uavhengige oppdateringstakter. Mer enn ~2 majors avvik gir 100 % `Connection closed` på all
`newPage()`, uten brukbar feilmelding. Gjelder BÅDE `Dockerfile_xp` og `Dockerfile_legacy` (sistnevnte
kjører i prod).

    **Status 2026-08-17:** Wolfi gir Chromium 151.0.7922.137, `puppeteer@25.5.0` vil ha 151.0.7922.71.
    Samme major, altså i synk. Ingen drift ennå — ikke akutt.

    **Å pinne versjonen er forkastet.** Wolfi-repoet beholder normalt bare nyeste bygg av hver pakke, så
    en hard pin slutter å bygge når versjonen ryddes bort — og fryser CVE-fikser i mellomtiden.

    **Valgt løsning: byggtids-versjonssjekk.** Behold rullende `apk add chromium`, men legg til et steg
    som sammenligner `chromium --version` mot `PUPPETEER_REVISIONS.chrome` fra `puppeteer-core` i imaget
    og feiler bygget ved mer enn 1 major avvik. Da blir drift en tydelig byggfeil i stedet for et stille
    runtime-krasj. Toleranse 1 major fordi Chrome slipper ny major hver ~4. uke og `minimumReleaseAge`
    i `pnpm-workspace.yaml` er 3 døgn — 0 toleranse ville brutt bygget nesten månedlig.

    **Alternativet «la Puppeteer eie sin egen Chrome» er utredet og PARKERT.** Det ville gjort drift
    strukturelt umulig, men koster mer enn det smaker. Funn fra utredningen, verdt å beholde:
    - De 25 manglende `.so`-filene løses automatisk med `apk add so:<biblioteknavn>` — apk utleder
      pakken selv, ingen pakkenavn-gjetting nødvendig.
    - Fonter mangler (`Could not find any font: , sans`). Rammer PDF-eksport, IKKE snapshots —
      `createStaticSnapshot` returnerer `page.content()` (serialisert DOM, ingen rasterisering).
      Distro-chromium drar inn `font-opensans` + `fontconfig` gratis; en manuell lukking må replikere det.
    - Chrome for Testing publiserer ingen linux-arm64-build. Alternativet binder imaget til amd64.
    - Lokal røyktest er umulig på Apple Silicon: `qemu: unknown option 'type=utility'` — QEMU klarer ikke
      emulere Chromiums flerprosess-modell. Sluttverifisering måtte uansett skjedd i dev.

    Nyttige teknikker hvis noen tar opp tråden: base-imaget har ikke `ldd` — bruk
    `LD_TRACE_LOADED_OBJECTS=1 /lib/ld-linux-x86-64.so.2 <binær>`. Og `apk info -R chromium` inne i et
    prøve-image kan vise foreldet indeks (viste 133 mens faktisk installert var 151) — verifiser alltid
    med `apk add` etterfulgt av `--version`.

3. Cursor-resume er verifisert én gang (1 restart under 9000-node-kjøringen) — trolig OK, men fortsatt
kun én datapunkt.

**P2 — datakvalitet / opprydding**

4. **Type-filter for "arkiverbar side"** (PARKERT): 76 % av indeksert innhold er strukturell støy
   (megamenu-item 160, page-template 56, user-tests-config 26, base:folder, template-folder). Ville gå i
   node-list.ts (enonic). **Produktavgjørelse:** hvilke typer er arkiverbar side? Merk: brukers screenshot av
   XP sitt EKTE live-tre viste samme støy → ikke en ny regresjon, paritet med XP. `SearchService.curatedTypes`
   er startpunkt, men mangler office-page og har link-typer uten html.
5. **Undersøk avviket:** en tidligere, mye mindre testkjøring hadde ~1150 node-spesifikke XP 500-feil
   (§6, node-spesifikt bekreftet den gang — IKKE last), men denne fulle 9000-node-produksjonsskala-kjøringen
   hadde 0 feilet. Årsak til avviket ukjent (endret XP-innhold siden sist? annen enumereringsrekkefølge?).
   Ikke hastverk, men verdt å forstå før man stoler blindt på fremtidige kjøringer.
6. Slett døde v2 (3,1 GB) + v1 (149 MB) indekser via `avnadmin` (page-cache-press). Også foreldreløse
   `xp-archive-content` + `acl-probe-tmp`.

**P3 — content-tree-opprydding (fra durabilitet-doc)**

7. Verifiser `ARCHIVE_ROOT_PREFIX` for en/nn/se (kun `no` bekreftet — kan feile stille).
8. Barn-rekkefølge alfabetisk vs XP authored `childOrder`. 1000-barns-tak uten paginering.
9. Når P3 ryddet: slett `getContentTreeHandler` + `/api/contentTree`-ruta (reell død kode; TODO ligger i site.ts).

**P4 — arkitektur/sikkerhet**

10. **Read-write-split**: hovedpod → `read`-only (paritet med legacy). Event-push-skriving må da
    flyttes/scopes. Dette er den ene gjenværende oppgaven i denne lista med reell sikkerhetsarkitektur-avveining
    — vurder å bruke en stærkere modell (Opus) for design-fasen hvis tilgjengelig, resten av lista er rutinemessig
    nok for en standard modell (Sonnet).
11. Aiven snapshot/GCS-backup-strategi (durabilitet-doc). Roter eksponert dev-secret `nav-enonicxp-dev1`.
12. Land `noDecorator` i nav-enonicxp-frontend.

---

## 11. Kontekst som sparer neste AI for gjentatt utredning / samme feil

- **`git status` ≠ den gamle summary-en.** Alt NaisJob-relatert er nå committet, deployet og kjørt
  vellykket (§2). Ikke stol blindt på eldre fil-lister — sjekk `git status`.
- **NetworkPolicy i Nais er en topartsavtale.** En ny app-identitet (som en NaisJob) trenger BÅDE egen
  `accessPolicy.outbound` OG en eksplisitt `accessPolicy.inbound`-regel hos MÅLET. Å bare sjekke egress
  hos seg selv og konkludere "ikke en policy-feil" er en klassisk ufullstendig diagnose (§6).
- **Upinnet `apk add <pakke>` er en tikkende bombe** for verktøy med strenge versjonskrav (som Puppeteer/
  Chromium). Driften skjedde en gang allerede denne økten og vil skje igjen ved neste image-rebuild med
  mindre permanent løst (§10, P1).
- **Delte dev-navnerom kan overskrives av andre teams/branches deploys.** Committet config i git er ikke
  en garanti for hva som faktisk kjører live — verifiser alltid mot faktisk cluster-state (§2, §9).
- **`kubectl logs -f`-frakobling under lange kjøringer er normalt** og betyr IKKE at jobben feilet —
  sjekk `kubectl get job`/`get pods` for faktisk status.
- **Prod bruker IKKE OpenSearch.** Ikke anta at endringer her rører prod-arkivet. Ingen prod-indeks finnes.
  76 %-junken er et rent DEV-fenomen; type-filter kan besluttes FØR go-live (blank tavle).
- **Nashorn ES5.1 i enonic-xp.** Ikke bruk ES6 runtime-APIer i søster-repo-koden. TS-build lurer deg
  (syntaks OK, runtime feiler).
- **`grep_search`/`file_search` når ikke søster-repoene.** Bruk absolutte stier + terminal for nav-enonicxp
  og nav-enonicxp-frontend.
- **Node-spesifikke 500 er BEKREFTET node-spesifikke, ikke last** (fra en tidligere, mindre testkjøring).
  Men denne fulle 9000-node-kjøringen hadde 0 feilet — avviket er ikke forklart, ikke gjenta konklusjonen
  ukritisk på nye datapunkter uten å sjekke om mønsteret faktisk gjentar seg.
- **Aiven readwrite ≠ index-admin.** Kan create doc/index, kan ikke DELETE index eller HEAD/GET metadata (403).
- **Arkivet er additivt.** Aldri foreslå sletting som "opprydding" av indeksert innhold.
- **Content-tree-migreringen ER retningen** (bruker-bekreftet), ikke en engangstest. `/api/contentTreeFromIndex`
  er default; `/api/contentTree` beholdes bevisst som rollback.
- **Modellvalg for videre arbeid:** de fleste gjenstående oppgavene (§10) er rutinemessige nok for en
  standard modell. Read-write-split (P4.10) er den ene oppgaven med reell sikkerhetsarkitektur-avveining
  hvor en sterkere modell kan være verdt kostnaden, hvis tilgjengelig.

---

## 12. Verifiseringsfunn (2026-08-25)

Etter at backfillen fullførte ble arkivet sammenlignet mot XP. Alt under er **verifisert** — hypoteser
som ble falsifisert underveis er bevisst utelatt.

> **Viktigste kontekst for prioritering (bruker-bekreftet):** _søket_ er den primære måten å finne
> innhold på. Innholdstreet er sekundært. Tittelsøk vurderes som godt nok inntil videre. Vekt funnene
> under deretter — flere av dem er kosmetiske gitt den premissen.

### 12.1 Søket treffer kun på tittel

- `IndexingService.ts` setter `searchText: ''` — feltet fylles **aldri**.
- `searchDocuments` gjør `wildcard` på `displayName.keyword` og spør aldri etter `searchText`.
- `html` er mappet med `index: false` — lagret, men ikke søkbart.

Konsekvens: en side kan bare finnes hvis man husker deler av overskriften. Å endre dette krever ny
indeks og full reindeksering. Vurdert som akseptabelt for nå.

**Å skru på indeksering av `html`/`json` er FEIL løsning — se §12.10 for hvorfor, og for den billige
varianten som faktisk gir fritekstsøk.**

### 12.2 Arkivtreet er historisk, XP sitt tre er nåtidig

Indeksen lagrer `path` slik den var i hver versjon, og treet bygges på nyeste versjon. XP viser nodens
**nåværende** plassering. Flyttes innhold uten å republiseres, endres `_path` uten at det lages en
versjon arkivet kan fange — og de to trærne divergerer permanent.

Dokumentert på node `471570db-fc30-4c02-a13c-ce07dac8602d`: to stier i indeksen (flyttet 2025-10),
mens XP viser den på en tredje plassering under `/kontor/`. Nav har reorganisert kontorstrukturen fra
`/no/lokalt/hjelpemiddelsentraler/` til `/kontor/`.

**Konsekvens for testing: å diffe arkivtreet mot XP-treet er IKKE et dekningsmål.** De måler ulike ting.
En «25 % dekning» fra en slik diff er meningsløs. Riktig dekningstest er en flat sammenligning av
node-IDer fra `nodeList` mot indeksen, uten hierarki.

### 12.3 Foreldreløse noder (kosmetisk, gitt at søk er primært)

- 271 av 2000 undersøkte `parentPath`-verdier finnes ikke som node.
- Årsak: mapper indekseres nesten ikke (kun 543 `base:folder` totalt), fordi de mangler `publish.from`
  og dermed faller på `isExcludedFromExternalArchive`.
- `getContentTreeLevel` finner barn med eksakt `term`-match på `parentPath`. Mangler mappen, kan man
  aldri navigere inn i den.
- Flytting i XP produserer nye foreldreløse, så tallet vokser over tid.
- Hele `/content/redirects`-undertreet er indeksert med **ustrippede** stier (`parentPath=/content`) og
  er foreldreløst per definisjon.

**Innholdet er ikke utilgjengelig** — det er fullt søkbart, siden `searchDocuments` ikke filtrerer på sti.

### 12.4 Fire sider vises i `main`, men er IKKE et dekningshull

> **Avklart 2026-08-26.** `nodeList` enumererer ikke disse fire. XP anser dem altså ikke som
> arkiverbare — ekskludert av `isExcludedFromExternalArchive`, mest sannsynlig fordi de er upubliserte
> (`arbeid-og-opphold-pa-svalbard` sto som «New» i Content Studio). **Arkivet gjør det riktige ved å
> ikke ha dem.** At de likevel vises i `main`s tre skyldes filterforskjellen i §12.5.

Sidene det gjelder, i tilfelle de dukker opp igjen i en senere sammenligning:

| nodeId                                 | type                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| `6d294fa1-fe29-4669-bb94-9b7e0eb453e8` | current-topic-page (kompetansesatsing-sosiale-tjenester) |
| `bd5b4539-49df-4a41-a2e0-58bbbd3ce9d2` | main-article (send-soknad-om-sykepenger)                 |
| `8bb408ff-5814-433b-87a0-febccfc47618` | main-article (arbeid-og-opphold-pa-svalbard)             |
| `0e96e4d7-50a0-42af-a732-26e360a318d6` | main-article (jobb-i-utlandet)                           |

Alle ligger rett under roten, så ingen mellomliggende mappe kan forklare det. Må feilsøkes mot
`isExcludedFromExternalArchive` i søsterrepoet. Merk at `arbeid-og-opphold-pa-svalbard` sto som «New»
(upublisert) i Content Studio — sjekk om de øvrige tre har samme status.

### 12.5 Filtrene i XP er ulike på de to sidene

```
content-tree.ts:41   if (content && !isExcludedFromExternalArchive(content))
node-list.ts:75      if (isContentLocalized(content) && !isExcludedFromExternalArchive(content))
```

Live-treet krever **ikke** `isContentLocalized`. Indekseringen gjør det. Forklarer hvorfor `nn` og `en`
viser flere (arvede) mapper i XP enn i arkivet.

### 12.6 XP-branchens betydning

Diff mellom `main` og `index-opensearch-archive` i `nav-enonicxp`:

- `content-tree.ts` — **identisk**. Tre-sammenligning påvirkes derfor ikke av hvilken branch dev kjører.
- `node-list.ts`, `locales.ts`, `nodeList.ts` — **kun på feature-branchen**. Backfill krever den.
- `search/search.ts` — **slettet** på feature-branchen. Kjører dev XP feature-branchen, har `main`-arkivet
  et ødelagt søk per konstruksjon. Ikke bruk søket til å sammenligne branchene.

### 12.7 Tre-sortering

Barn sorteres på `timestamp desc` (fra `sort` i `getContentTreeLevel`), ikke alfabetisk. Klienten
sorterer ikke om. `docs/arkiv-durabilitet.md` sier «alfabetisk» — det stemmer ikke med koden.

### 12.8 Backfill-drift i dev

- Pod-feilene var **ikke** OOM, men `ScaleDown` — cluster-autoscaleren kaster ut poden ved
  node-nedskalering. Å øke `memory` hjelper ikke.
- Naisjob-spesifikasjonen eksponerer **ikke** pod-annotasjoner, så `safe-to-evict` kan ikke settes.
  `backoffLimit` er den eneste knappen (hevet til 50, se `.nais/backfill-job.yml`).
- Cursoren har **side-granularitet** (`PAGE_SIZE = 1000`), ikke node-granularitet. Kommentaren i
  `BackfillService` som lover «~10 noder» ved krasj er feil — reelt tap er opptil én side.
- Fullføres en locale, slettes cursoren. Neste kjøring starter **den locale-en fra scratch**. Det finnes
  ingen «fortsett der vi slapp» for hele jobben.
- Dev-workflowen deployer appen **og** NaisJob-en i samme kjøring. Enhver dev-deploy erstatter en
  kjørende backfill. **Endret 2026-08-28:** backfill-steget krever nå `-f startBackfill=true`, så et
  vanlig deploy lar en pågående kjøring være i fred (§10 P1.1c).
- Noen noder har 2000–3000 versjoner (arbeidslivssenter-kontorsider, ca. ti stykker) og tar ~50 minutter
  hver. `Done indexing` logges først når en node er ferdig, så telleren står stille i mellomtiden.

### 12.9 Dekning per locale — målt 2026-08-26

Flat sammenligning av node-IDer fra `nodeList` mot indeksen. Ingen hierarki — se §12.2 for hvorfor
tre-diff ikke duger som dekningsmål.

| locale | XP enumererte | i indeksen | mangler | dekning |
| ------ | ------------- | ---------- | ------- | ------- |
| `no`   | 46 723        | 46 707     | 16      | 99,97 % |
| `nn`   | 1208          | 1208       | 0       | 100 %   |
| `en`   | 1390          | 1389       | 1       | 99,93 % |
| `se`   | 6             | 5          | 1       | 83,3 %  |

**Arkivet er i praksis komplett.** Indeksen har 46 733 noder for `no` — 26 flere enn XP enumererer.
Det er historisk innhold (`okonomi-og-gjeld`, `beskjed`, `footer-contactus-*`) som er slettet eller
avpublisert i XP. Arkivprinsippet fungerer.

De manglende fordeler seg slik:

- **16 i `no`**: testsider (`/no/eivind-tester` + to regneark), en side med `-copy` i navnet, tre
  `/redirects/sok-nav-kontor*`, et par fragmenter, et bilde, en PDF og noen lokale sider. Alle bærer
  preg av å være publisert **bak cursoren** mens backfillen kjørte. Enumereringen går alfabetisk over
  mange timer, så innhold som dukker opp på en allerede passert posisjon blir ikke fanget. Det er
  nettopp dette den nattlige sweepen (§3, `schedule` utkommentert i `.nais/backfill-job.yml`) skal ta.
- **1 i `en`**: `e5ee2f6e-1eab-428c-b2f4-98fe2de4d53e`,
  `/no/bedrift/ansatt-venter-barn/tester-01.07.2026`. Samme forklaring.
- **1 i `se`**: `baf59cae-6de9-48fb-b8fb-4d873a275112` (AAP-noden). Kjent fra tidligere økt: 284
  publiserte versjoner i `no`, hvorav `c74d032e` er **korrupt i XP** og ikke kan åpnes i Content Studio
  heller.

Merk også: `no` vokste fra 29 159 noder (18. august) til 46 733 (26. august). Backfillen fortsatte
lenge etter at den ble sluttet fulgt med på, og fikk med seg ~17 000 noder til.

**Feilkilder som ga sterkt misvisende tall tidligere:**

- `nodeList` med lav `count` gir null treff for alle locales, fordi de første nodene alfabetisk er
  `/_templates`-maler som ikke er lokalisert.
- Å stoppe pagineringen på et sidetak. En tidligere måling med tak på 30 sider ga `nn ≥332` og `en ≥322`
  — de reelle tallene er fire ganger så høye. Paginer til `hasMore` er `false`.

### 12.10 Fritekstsøk: ikke indekser `html`/`json` — fyll `searchText` (2026-08-27)

**Ikke gjort. Notert for senere.** Oppsto av spørsmålet «hadde vi trengt mer lagring hvis `html` og
`json` var i det inverterte indeksen?». Svaret er ja, men begge feiler på hver sin måte, og ingen av
dem er veien til fritekstsøk.

Målt tilstand i dev 2026-08-27:

|                                   |          |
| --------------------------------- | -------- |
| dokumenter (node-versjoner)       | 136 746  |
| unike noder                       | ~46 788  |
| lagret (primaries)                | 18,34 GB |
| per dokument                      | 140,6 kB |
| rå HTML per dokument (målt snitt) | 411 kB   |

Komprimeringsforholdet er dermed ~2,9× — normalt for LZ4 på repetitiv markup. Siden `html` er
`index: false` og `json.enabled: false`, er praktisk talt hele de 18 GB komprimert `_source`.

**Hvorfor `index: true` på `html` er feil:** man ville indeksert markup, ikke prosa. Analysatoren
tokeniserer klassenavn og Next.js-hashede identifikatorer, som gir enorm term-diversitet. Et invertert
indeks komprimerer godt nettopp når termer gjentar seg — unike hasher er verste tilfelle.

**Hvorfor `json.enabled: true` er verre:** her er plass ikke hovedproblemet. Dynamisk mapping over
vilkårlig innholds-JSON gir mapping-eksplosjon (1000-feltgrensen) og type-konflikter når samme sti er
streng i én innholdstype og objekt i en annen. Da feiler **indekseringen av dokumentet**, ikke bare
søket. Mistanken er at det er derfor feltet står avskrudd — ikke lagringshensyn. Verifiser før du
konkluderer.

**Den billige varianten:** `searchText` finnes allerede i mappingen, men settes alltid til `''` i
`IndexingService`. Fyll den med ren tekst strippet for markup. Grovt anslag: 5–15 kB prosa per side →
~1–2 GB råtekst for hele indeksen → invertert indeks under 1 GB. Det løser §12.1 til en brøkdel av
kostnaden ved å indeksere HTML-en.

⚠️ Anslagene for prosa-andel og indeksstørrelse er **ikke målt** — kun komprimeringsforholdet og
tabellen over er verifisert. Mål faktisk tekstmengde per side før du dimensjonerer.

Krever ny indeks og full reindeksering (§12.1).

---

# Session Start (lim inn som første melding i ny chat)

Du er nav-pilot. Svar på norsk, konsist. Jeg fortsetter arbeid på `navno-cms-archive`
(`/Users/bdahle/Documents/navno/navno-cms-archive`, branch `xp-arkiv-v2`, PR #344). Full handoff ligger i
`docs/handoff-naisjob-backfill.md` — les den ved behov.

**Hva vi gjorde:** Ferdigstilte og kjørte en **NaisJob** som backfiller xp-arkivet inn i OpenSearch (dev).
Backfill er for tung for den brukervendte poden (OOM-krasj, Exit 137). NaisJob-en isolerer backfillen i egen
pod (4 GB RAM) og gjenopptar automatisk fra en OpenSearch-cursor (`xp-archive-backfill-cursor`) ved OOM/krasj.

**Status: FULLT VERIFISERT ENDE-TIL-ENDE (2026-08-14).** Jobben kjørte til `Complete`:
`Backfill ferdig: 9000 noder indeksert, 0 feilet – 7818s` (1 restart underveis, cursor-resume besto testen).
Alt er committet, ingen ustaget NaisJob-kode lenger. To rotårsaker ble funnet og fikset underveis:

1. **NetworkPolicy-topartsavtale**: `navno-xp-archive-backfill` (ny app-identitet) manglet
   `accessPolicy.inbound` hos `nav-enonicxp-frontend`. Fikset der (commit `31a85f044`, branch `xp-arkiv-v2`).
   **Kjent drift-risiko:** dev1 er delt miljø — denne fiksen ble midlertidig borte fra live state da noen
   redeployet fra en annen branch, men er verifisert gjenopprettet 2026-08-14. IKKE merget til `main` ennå.
2. **Puppeteer/Chromium versjonsmismatch**: upinnet `apk add chromium` i `Dockerfile_xp` installerte en
   Chromium 3 hovedversjoner nyere enn pinnet Puppeteer forventet → 100 % `Connection closed` på snapshot.
   Fikset ved å bumpe `puppeteer` i `pnpm-workspace.yaml`-katalogen til en matchende versjon.

**Neste steg (kun opprydding, ingen blokkere — se §10 i handoff for full prioritert liste):**

1. **P1:** vurder å merge NetworkPolicy-fiksen til `main` i nav-enonicxp-frontend (drift-risiko).
   Vurder å pinne Chromium-versjonen permanent i `Dockerfile_xp` (samme drift-risiko-klasse).
2. **P2:** produktbeslutning om type-filter for "arkiverbar side" (76 % strukturell støy); undersøk hvorfor
   en tidligere, mindre testkjøring hadde ~1150 node-spesifikke XP-500-feil som IKKE gjentok seg i denne
   fulle kjøringen (0 feilet — uforklart, ikke hastverk); slett døde v1/v2-indekser via `avnadmin`.
3. **P4:** read-write-split (hovedpod → read-only) er parkert — eneste gjenstående punkt med reell
   sikkerhetsarkitektur-avveining. Vurder sterkere modell for design-fasen der.

**Kritiske regler:**

- **Git:** kjør ALDRI `git add/commit/push` — bruker gjør all git selv. Rediger filer fritt.
- **VERIFISER, ikke påstå.** Bruker har korrigert agenten ofte. Ikke håndter secrets lokalt.
- **Prod bruker IKKE OpenSearch** (live XP-pass-through). OpenSearch-laget er ny capability kun på branchen —
  ingen prod-data å korrumpere.
- **NetworkPolicy = topartsavtale.** Ny app-identitet trenger BÅDE egen outbound OG target sin inbound-regel.
- **Enonic-xp = Nashorn (ES5.1)** — ingen ES6 runtime-APIer i søster-repo `nav-enonicxp`
  (`/Users/bdahle/Documents/navno/nav-enonicxp/`, branch `index-opensearch-archive`). `grep_search` når IKKE dit.
- **Aiven readwrite ≠ index-admin:** kan create, kan ikke DELETE index (403). Arkivet er additivt.
- **Delte dev-miljøer kan overskrives** av andres deploys — verifiser alltid mot faktisk cluster-state,
  ikke bare committet config.
- Utforsk/forklar før implementering, én ting av gangen, stopp ved bruddpunkter.
