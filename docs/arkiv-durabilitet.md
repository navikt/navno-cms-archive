# Durabilitet og backup for CMS-arkivene

## (AI-generert notat med noen små justeringer, kan forekomme feil. Opprettet for å huske å sjekke mer opp i dette senere)

Notat fra en diskusjon om datavarighet for `legacy-archive` og `xp-archive`.
Formålet er å fange opp risiko og åpne spørsmål — ikke en ferdig beslutning.

## Bakgrunn

Begge arkivene lagrer innhold i Aiven-managed OpenSearch:

- **legacy-archive** — innhold fra original Enonic CMS (2006–2019). Kilde-CMS er
  **avviklet**. OpenSearch er i praksis eneste kopi (system of record). (dette er ikke verifisert)
- **xp-archive** — innhold fra Enonic XP (2019+). Intensjonen er at arkivet skal
  være source of truth i mange år, også **etter at Enonic XP eventuelt avvikles**.

Nøkkelinnsikt: så snart kilden (XP) er borte, kan ikke arkivet re-indekseres fra
kilde. Da er OpenSearch-indeksen eneste kopi, og et uhell (feil `DELETE`, tapt
instans, utløpt backup) gir **permanent, uopprettelig tap**.

Et konkret eksempel dukket opp under feilsøking: en nødvendig endring av
index-mapping krevde at indeksen ble slettet og hentet på nytt fra XP. Hadde XP
vært avviklet, ville denne endringen vært umulig å gjøre trygt.

## Funn (per 2026-07)

|                                     | legacy                                              | xp               |
| ----------------------------------- | --------------------------------------------------- | ---------------- |
| Aiven-instans                       | `enonic-cms-archive` (nav-prod, startup-8, 755 GiB) | `xp-cms-archive` |
| App-tilgang (`openSearch.access`)   | `read`                                              | `readwrite`      |
| Snapshot/backup i repo              | ingen                                               | ingen            |
| Autoritativ kopi utenfor OpenSearch | ingen kjent                                         | ingen            |

- **legacy** har `read`-tilgang → app-credentials kan ikke skrive/slette. Innebygd
  guardrail på uerstattelig data.
- **xp** har `readwrite` → den brukervendte appen kan slette sitt eget arkiv-index.
  Ingen tilsvarende guardrail.
- Ingen snapshot-til-GCS er konfigurert i repoet for noen av arkivene.
- nais behandler tradisjonelt OpenSearch som «ephemeral». Aiven tar automatiske
  backups, men retention er plan-avhengig og ofte kort (dager, ikke år), og styres
  utenfor dette repoet (Nais Console / Aiven).
- Den opprinnelige migreringskilden for legacy-innholdet er ikke funnet bevart i
  repoet. `indexStaticAssets.ts` leste statiske assets fra en lokal filsystem-dump
  ved engangs-migrering; om den dumpen fortsatt finnes er uavklart.
- **ACL-nyanse (dev, xp `readwrite`):** app-brukeren kan opprette indekser
  (PUT = 200) og lese/skrive/slette _dokumenter_, men kan **ikke slette indekser**
  (DELETE = 403) og ikke gjøre HEAD/GET på index-metadata (403). Sletting av en indeks
  krever Aiven-admin (`avnadmin`). At web-appen ikke kan droppe en indeks er isolert
  sett en bra guardrail.

## Risiko

1. **Permanent datatap** ved sletting/korrupsjon av et sole-source index (gjelder
   legacy nå, xp etter XP-avvikling).
2. **Ingen versjonskontrollert backup-strategi** — vi kan ikke resonnere om eller
   garantere retention fra koden.
3. **xp-appen kan slette indekserte dokumenter** pga. `readwrite` (men ikke selve
   indeksen — DELETE index er blokkert av ACL).
4. **Låst datastruktur** — uten kildekopi kan mapping/format ikke endres trygt
   etter at kilden er borte.

## Åpne spørsmål / handlinger

- [ ] Verifiser i Aiven Console (https://console.aiven.io) om det tas snapshots av
      `enonic-cms-archive` og `xp-cms-archive`, og hva retention er. (Krever tilgang
      til Aiven-prosjektet — be om det ved behov.)
- [ ] Avklar om den opprinnelige legacy-migreringsdumpen fortsatt finnes arkivert
      et durabelt sted (f.eks. GCS).
- [ ] Beslutt om begge arkivene skal ha en **autoritativ kopi i GCS** (versjonert,
      lifecycle-styrt) bak OpenSearch, slik at OpenSearch blir en gjenoppbyggbar
      projeksjon i stedet for eneste kopi.
- [ ] Vurder å flytte xp-indeksering til en egen **naisjob** med skrivetilgang, og
      sette web-appen til `read` — samme guardrail som legacy har.
- [ ] Dokumenter en gjenopprettingsrutine (restore fra snapshot / re-index fra GCS).
- [ ] Rydd med Aiven-admin (`avnadmin`) i dev: den foreldreløse `xp-archive-content`
      (erstattet av `xp-archive-content-v1`) og throwaway-indeksen `acl-probe-tmp`.

## Mulige tiltak (ikke besluttet)

- **Autoritativ GCS-kopi:** skriv `json` + html-snapshot til en GCS-bøtte som
  autoritativ kilde; behold OpenSearch som søkbar projeksjon. Gir holdbarhet
  uavhengig av Aiven/XP og gjør mapping-endringer trygge.
- **Aiven-snapshots til egen GCS-bøtte** med lang retention (minimum backup-vei).
- **Skille lagring fra søk** som prinsipp: et søke-index bør ikke være eneste kopi
  av uerstattelig data.
- **Rå-node-fallback i XP:** korrupte kildeversjoner (ugyldig property for
  innholdstypen) kan ikke arkiveres i dag – `externalArchive/content` gir 500 og vi
  får verken json eller html. Skal vi kunne arkivere _absolutt alt_, må
  `nav-enonicxp` tilby et lavnivå node-uttrekk (`nodeLib.get` uten
  innholdstype-validering). Lav prioritet: gjelder få versjoner, og en frisk
  publisert versjon finnes som regel rett etterpå.

## Snapshot-fullstendighet: binære ressurser ikke fanget

Snapshotet er selvforsynt for struktur + CSS-tekst (CSS inlines), men **binære
ressurser bakes ikke inn** – de forblir eksterne referanser:

- **Bilder:** `<img src>` skrives kun om til original-URL. Nettleseren henter bildet
  live fra nav.no/CDN ved visning. Slettes/flyttes kilde-bildet, blir det ødelagt i
  arkivet.
- **Fonter:** referert via `@font-face { src: url(...) }` i inlinet CSS – ikke
  embeddet. Samme visnings-avhengighet.
- **Video (Qbrick):** videoer spilles av via Qbrick (ekstern player/embed, ofte
  iframe + scripts). Siden vi fjerner scripts og aborterer eksterne ressurser, fanges
  **ikke** videoinnholdet i det hele tatt – kun evt. en placeholder/plakat. Ekte
  arkivering av video krever en egen strategi (hente ned selve videofila fra Qbrick
  og lagre den durabelt), som er vesentlig tyngre enn bilder. (ikke avklart i teamet)

Ikke akutt mens nav.no/CDN/Qbrick lever, men en reell luke for et _ekte_
langtidsarkiv. Mulig tiltak: **lagre binærene separat** (eget asset-index i
OpenSearch eller GCS) og skriv referansene om til arkivets egen kopi – slik
legacy-arkivet gjør (`indexStaticAssets.ts` → base64-assets i eget index). Ikke
inline base64 i html-dokumentet (blåser opp doc-størrelsen). Passer inn i
backfill-arbeidet: fang bildene mens vi likevel går gjennom alt innhold. Video
(Qbrick) er en egen, større vurdering.

## Naisjob-splitting løser to problemer samtidig (2026-07-14)

Utdyper punktet under "Åpne spørsmål / handlinger" om å flytte xp-indeksering til
egen naisjob. I dag gjør **én pod** tre ting med samme `readwrite`-credential:

1. Serverer arkivet live til brukere
2. Event-push-skriving (`/api/index`, én node om gangen, trigges av XP ved publisering)
3. Tung backfill (`BackfillService` – tusenvis av Puppeteer-renderinger over timer)

Å splitte den tunge backfillen ut i en egen naisjob (egen pod, egen service-konto)
løser to separate problemer med én endring:

- **Sikkerhet:** Den offentlig tilgjengelige poden trenger ikke lenger
  slette-kapable credentials. Samme guardrail som legacy-arkivet allerede har
  (`read`-only app-tilgang). En feil/sårbarhet i noe internett-nåbart kan da ikke
  slette permanent arkivdata, fordi tilgangen ikke finnes.
- **Pålitelighet/isolasjon:** Bekreftet av hendelsen 2026-07-13 – Puppeteer krasjet
  under en lang backfill-kjøring og tok ned **hele poden**, inkludert den som
  serverer arkivet til brukere. Flytter man backfillen til en egen pod, rammer et
  nytt slikt krasj kun batch-jobben, ikke arkiv-visningen.

**Nyanse ikke løst av dette alene:** event-push (`/api/index`) skriver også, og
ligger i dag i samme app. Skal hovedappen bli fullstendig `read`-only (ekte
paritet med legacy), må denne enkelt-node-skrivingen også flyttes et sted – enten
en egen liten alltid-på skrive-tjeneste, eller bli værende i hovedappen med
smalt scopet skrivetilgang (mindre risikooverflate enn den tunge backfillen, men
ikke null).

Vurdert, men ikke startet – kommer etter at nåværende backfill-kjøring i dev er
ferdig og etter at content-tree-fra-OpenSearch er sett på.

## Innholdstre fra OpenSearch i stedet for XP live (2026-07-14)

Arkivets navigasjonstre (`ContentTreeService`) var en ren proxy mot XP sitt
`externalArchive/contentTree` – dør XP, mister vi trenavigasjon selv om selve
dokumentene overlever i OpenSearch. Bygget og bekreftet (query-design + faktisk
klikk-gjennom i browser mot ekte data): `XpArchiveOpenSearchClient.getContentTreeLevel`

- nytt endepunkt `/api/contentTreeFromIndex`. Klienten (`useContentTree.ts`) bruker
  dette som default nå (besluttet: dette er retningen for arkivet, ikke en engangstest).

To ting måtte fikses for at dette skulle fungere i det hele tatt:

- **Sti-konvensjon**: dokumentene lagret tidligere XP sin fulle, rå sti
  (`/content/www.nav.no/aap`), som aldri matchet klientens relative konvensjon
  (rot = `/`, samme som XP sine egne `stripPathPrefix`-baserte tjenester). Løst med
  `stripArchiveRootPrefix` (`server/src/utils/paths.ts`) – strippes ved indeksering.
- **Tomt rot-nivå**: rot-stien har aldri et eget dokument (backfill enumererer kun
  etterkommere). Løst med en syntetisk `isEmpty`-node, samme konsept som XP sitt eget
  `content-tree-archive.ts` bruker for strukturelle "tomme" tre-noder.

**Åpent, ikke verifisert:** `ARCHIVE_ROOT_PREFIX` (`/content/www.nav.no`) er kun
bekreftet mot `locale=no`. Ukjent om `en`/`nn`/`se`-repoene bruker samme prefiks –
kan feile stille (no-op fallback, ingen feilmelding) for de locales inntil sjekket.

**Fremtidig opprydding (ikke gjort ennå):** `/api/contentTree` (XP-live-proxy,
`getContentTreeHandler` i `ContentTreeService.ts`) har ingen gjenværende consumers,
men beholdes bevisst som rollback-vei til migreringen er fullt tillitsvekkende:

- [ ] Verifiser `ARCHIVE_ROOT_PREFIX` for alle 4 locales, ikke bare `no`.
- [ ] Avklar barn-rekkefølge (i dag alfabetisk på sti, ikke XP sin authored `childOrder`).
- [ ] Håndter 1000-barns-taket i `getContentTreeLevel` (ingen paginering i dag).
- [ ] La OpenSearch-treet kjøre stabilt i dev en stund uten å trenge fallback.

Når disse er ryddet: slett `getContentTreeHandler` + ruta + `CONTENT_TREE_API`/
`xpServiceUrl`-koblingen i `ContentTreeService.ts` – da er det reell død kode.
