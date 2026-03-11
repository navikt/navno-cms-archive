# NAV CMS-arkiv

Frontend for CMS-arkivet. Den er delt i to applikasjoner, en som viser arkivinnhold fra 2006-2019 (CMS legacy arkiv) og en som viser innhold fra 2019 som kommer fra Enonic XP.

https://cms-arkiv.intern.nav.no

## Lokal utvikling

For å kjøre opp applikasjonene må man gjøre følgende:

1. Installere avhengigheter
   Både i rot men også inne i de to respektive applikasjonene. Avhengigheter i common-mappa blir installert fra rot da det er definert som et workspace.

```
pnpm install
```

2. Bygge appene

```
pnpm run build -C legacy-archive
pnpm run build -C xp-archive
```

3. (Kun første gang) Kopiere .env-template.
   Husk å endre NODE_ENV=production i .env.prod-local filen.

```
cp legacy-archive/.env-template legacy-archive/.env.development
cp legacy-archive/.env-template legacy-archive/.env.prod-local

cp xp-archive/.env-template xp-archive/.env.development
cp xp-archive/.env-template xp-archive/.env.prod-local
```

Sett NODE_ENV=production i xp-archive/.env.prod-local og legacy-archive/.env.prod-local

4. Starte applikasjon i dev-modus
   For legacy arkivet trenger du også credentials for open-search, se [Enonic CMS legacy arkiv](#enonic-cms-legacy-arkiv-2006-2019), og så må man logge på aiven-prod i naisdevice. Brukernavn og passord roterer, så disse må oppdateres med jevne mellomrom.

```
pnpm run dev -C legacy-archive
pnpm run dev -C xp-archive
```

5. Relaterte applikasjoner
   Vi bruker tjenester i nav-enonicxp for å hente ut innholdsinformasjon og nav-enonicxp-frontend for å rendre innholdet, så de må kjøres opp lokalt for å få hentet informasjon.

### Troubleshooting

#### CSS + JS laster ikke

Hvis du har problemer med at css og js ikke laster ved første oppstart i dev-modus, prøv å start appen i prod-modus en gang og se om det løser problemet.

```
pnpm run start-local -C xp-archive
```

Hvis iframes ikke vises, sjekk om du får cors-issues i srcdoc. Disse vil oppstå hvis du kjører nav-enonicxp-frontend i dev-modus og ikke i prod-modus.

#### OpenSearch error: Response Error ved oppstart av legacy-arkiv

Antageligvis er du enten ikke koblet til aiven-prod eller så har du ikke oppdatert brukernavn og passord til opensearch, se [Oppsett for lokal utvikling](#oppsett-for-utvikling).

## Prodsetting

Lag en PR til main, og merge inn etter godkjenning (En automatisk release vil oppstå ved deploy til main)

## Enonic CMS legacy arkiv (2006-2019)

Dette er et arkiv av innhold fra Enonic CMS, som Nav benyttet fra 2006-2019. Arkivet har to deler: SBS (nav.no og annet åpent innhold) og FSS (intranett).

Innholdet ble migrert til en Opensearch-database: https://opensearch-navno-enonic-cms-archive-nav-prod.a.aivencloud.com

Migrerings-applikasjonen finnes her: https://github.com/navikt/enonic-cms-site-extractor

Logger for migreringsjobbene finnes i Opensearch-databasen, under index'ene `cmssbs_migrationlogs` og `cmsfss_migrationlogs`.

### Oppsett for utvikling

Credentials for opensearch må legges inn i .env filer lokalt. Disse kan hentes ut fra kubernetes secret `aiven-navno-cms-archive-*`.

Sett context til prod-gcp:

```
kubectl config use-context prod-gcp
```

List ut secrets:

```
kubectl get secret -n navno
```

Be om tilgang til aiven-prod i naisdevice.

Åpne secret:

```
kubectl edit secret -n navno aiven-opensearch-navno-cms-archive-<id> //Bytt ut <id> med id fra lista
```

Dekod OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME og OPEN_SEARCH_PASSWORD fra base64:

```
echo <OPEN_SEARCH_URI> | base64 --decode
```

Fjern eventuelt trailing prosent-tegn.

Erstatt disse feltene med dekodede verdier fra secrets i .env.prod-local og .env.development: (IKKE i .env-template)

```
OPEN_SEARCH_URI=http://my-opensearch-instance
OPEN_SEARCH_USERNAME=username
OPEN_SEARCH_PASSWORD=password
```

Husk å ikke commit secrets! 👿
