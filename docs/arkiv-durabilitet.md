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
