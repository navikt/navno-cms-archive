// 🔴 RØD SONE — søkekvalitet avhenger av denne funksjonen.
// Skriv implementasjonen selv. Stubben under returnerer tom streng slik at
// indekseringsspiken kjører ende-til-ende mens logikken ennå ikke er skrevet.
//
// Oppgave: gjør om rendret HTML til ren, søkbar tekst.
// Vurder:
// - Fjern <script>/<style> og deres innhold (skal ikke være søkbart)
// - Strip resten av taggene, behold tekstnoder
// - Dekod HTML-entiteter (&amp; → &, &nbsp; → mellomrom)
// - Normaliser whitespace (kollaps gjentatt whitespace til ett mellomrom, trim)
// - Vurder om decorator-header/footer skal fjernes (jf. PdfService-regex)
export const extractSearchText = (html: string | undefined): string => {
    if (!html) {
        return '';
    }

    // TODO(rød sone): implementer HTML → ren tekst.
    return '';
};
