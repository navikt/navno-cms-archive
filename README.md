# NAV CMS-arkiv

Frontend for CMS-arkivet. Den er delt i to applikasjoner, en som viser arkivinnhold fra 2006-2019 (CMS legacy arkiv) og en som viser innhold fra 2019 som kommer fra Enonic XP.

https://cms-arkiv.intern.nav.no

## Lokal utvikling

For å kjøre opp applikasjonene må man gjøre følgende:

1. Installere avhengigheter
   Både i rot men også inne i de to respektive applikasjonene. Avhengigheter i common-mappa blir installert fra rot da det er definert som et workspace.

```
npm install
```

2. Bygge appene

```
npm run build -C legacy-archive
npm run build -C xp-archive
```

3. (Kun første gang) Kopiere .env-template.
   Husk å endre NODE_ENV=production i .env.prod-local filen.

```
cp legacy-archive/.env-template xp-archive/.env.development
cp legacy-archive/.env-template xp-archive/.env.prod-local

cp xp-archive/.env-template xp-archive/.env.development
cp xp-archive/.env-template xp-archive/.env.prod-local
```

For legacy arkivet trenger du også credentials for open-search, se [Enonic CMS legacy arkiv](#enonic-cms-legacy-arkiv-2006-2019)

4. Starte applikasjon i dev-modus

```
npm run dev -C legacy-archive
npm run dev -C xp-archive
```

5. Relaterte applikasjoner
   Vi bruker tjenester i nav-enonicxp for å hente ut innholdsinformasjon og nav-enonicxp-frontend for å rendre innholdet, så de må kjøres opp lokalt for å få hentet informasjon.

### Troubleshooting

Hvis du har problemer med at css og js ikke laster ved første oppstart i dev-modus, prøv å start appen i prod-modus en gang og se om det løser problemet.

```
npm run start-local -C xp-archive
```

Hvis iframes ikke vises, sjekk om du får cors-issues i srcdoc. Disse vil oppstå hvis du kjører nav-enonicxp-frontend i dev-modus og ikke i prod-modus.

## <a name="enonic-legacy"></a> Enonic CMS legacy arkiv (2006-2019)

### Oppsett for utvikling

Credentials for opensearch må legges inn i .env filer lokalt. Disse kan hentes ut fra kubernetes secret `aiven-navno-cms-archive-*`.

liste ut secrets

```
kubectl get secret -n personbruker
```

```
kubectl edit secret aiven-navno-cms-archive-<id>
```

Kopier .env-template til .env.development/.env.prod-local. Erstatt disse feltene med tilsvarende verdier fra secrets:

```
OPEN_SEARCH_URI=http://my-opensearch-instance
OPEN_SEARCH_USERNAME=username
OPEN_SEARCH_PASSWORD=password
```

Secretene er base64.encodet så de må decodes.

Husk å ikke commit secrets! 👿

For tilgang til aiven opensearch må du logge på aiven-prod gateway i naisdevice.
