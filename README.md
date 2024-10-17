# NAV CMS-arkiv

Frontend for CMS-arkivet. Dokumentasjon kommer!

https://cms-arkiv.intern.nav.no

## Enonic CMS legacy arkiv (2006-2019)

## Oppsett for utvikling
Credentials for opensearch må legges inn i .env filer lokalt. Disse kan hentes ut fra kubernetes secret `aiven-navno-cms-archive-*`.

`kubectl edit secret aiven-navno-cms-archive-<id>`

Kopier .env-template til .env.development/.env.prod-local. Erstatt disse feltene med tilsvarende verdier fra secrets:
```
OPEN_SEARCH_URI=http://my-opensearch-instance
OPEN_SEARCH_USERNAME=username
OPEN_SEARCH_PASSWORD=password
```

Husk å ikke commit secrets! 👿

For tilgang til aiven opensearch må du logge på aiven-prod gateway i naisdevice.