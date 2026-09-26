/* ==========================================================================
   I PROGETTI DEL PORTFOLIO
   --------------------------------------------------------------------------
   QUESTO È L'UNICO FILE DA TOCCARE PER CAMBIARE LA GALLERIA.

   Per ogni progetto:

     slug    nome breve che collega il progetto alla sua pagina, in
             js/data/project-pages.js. Minuscolo, trattini, niente spazi.
             Non si vede da nessuna parte: si può cambiare il titolo senza
             toccarlo.
     title   il nome che compare sopra l'immagine e in cima alla sua pagina
     shape   'landscape' (150x100) | 'square' (120x120) | 'portrait' (100x150)
             Sono i tre formati delle tavole Figma. Non aggiungerne altri
             senza ripensare la griglia.
     image   percorso dell'immagine, relativo a index.html ('webp/nome.webp').
             null -> riquadro rosso di segnaposto.
             Le immagini sono WebP, lato lungo 800 px: il doppio abbondante di
             quanto serve anche su uno schermo retina. Nomi in minuscolo con
             trattini, perché sul server online le maiuscole contano.
     alt     testo alternativo: il nome del progetto
     url     null  -> l'elemento non è cliccabile
             'progetti/nome.html' -> diventa un link alla pagina del progetto

   COME L'IMMAGINE ENTRA NEL RIQUADRO (facoltativi):

     fit       'cover'   (predefinito) riempie il riquadro, taglia l'eccesso
               'contain' mostra l'immagine intera, con bande nere se serve
     position  quale parte tenere quando si taglia, come object-position.
               '50% 50%' (predefinito) il centro · '50% 0%' la parte alta
     zoom      ingrandimento leggero oltre il riempimento. 1 = nessuno

   L'ORDINE conta ed è quello di lettura del desktop: si riempiono le righe
   da sinistra a destra, tre per volta.

     desktop   3 colonne x 4 righe, scorre in verticale
     mobile    3 righe x 4 colonne, scorre in orizzontale

   REGOLA DELLA GRIGLIA MOBILE
   Su telefono le righe del desktop diventano colonne, quindi si affiancano
   il 1°, il 4°, il 7° e il 10° progetto (e così per gli altri due gruppi).
   Un `landscape` è largo quanto la cella che lo contiene: due `landscape`
   affiancati si toccano e sembrano un rettangolo unico.
   Quindi: mai due `landscape` a distanza di tre posizioni.
   ========================================================================== */

export const projects = [
  // --- riga 1 : orizzontale, quadrato, quadrato -----------------------------
  {
    slug: 'museo-pagani',
    title: 'Museo Horacio Pagani',
    shape: 'landscape',
    image: 'webp/museo-pagani.webp',
    alt: 'Museo Horacio Pagani',
    url: null,
    // Screenshot del sito, più alto del riquadro: contano l'header e la
    // prima card grande, che stanno in alto. La parte bassa può uscire.
    position: '50% 0%',
  },
  {
    slug: 'morficer',
    title: 'Morphi chair',
    shape: 'square',
    image: 'webp/morficer.webp',
    alt: 'Morphi chair',
    url: null,
  },
  {
    slug: 'link-campus',
    title: 'Link Campus',
    shape: 'square',
    image: 'webp/link-campus.webp',
    alt: 'Link Campus',
    url: null,
  },

  // --- riga 2 : verticale, orizzontale, verticale ---------------------------
  {
    slug: 'echoes',
    title: 'Echoes',
    shape: 'portrait',
    image: 'webp/echoes.webp',
    alt: 'Echoes',
    url: null,
    // Verticale 2:3, esattamente il formato del riquadro: entra intero.
  },
  {
    slug: 'parallax',
    title: 'Parallax',
    shape: 'landscape',
    image: 'webp/parallax.webp',
    alt: 'Parallax',
    url: null,
  },
  {
    slug: 'rumori-hub',
    title: 'Rumo.Ri Hub',
    shape: 'portrait',
    image: 'webp/rumori-hub.webp',
    alt: 'Rumo.Ri Hub',
    url: null,
    // Poster: va visto intero, compreso il logo in basso. Bande nere sopra e
    // sotto piuttosto che un taglio.
    fit: 'contain',
  },

  // --- riga 3 : orizzontale, quadrato, quadrato -----------------------------
  {
    slug: 'pulp-fiction',
    title: 'Pulp Fiction',
    shape: 'landscape',
    image: 'webp/pulp-fiction.webp',
    alt: 'Pulp Fiction',
    url: null,
    // Un filo più larga del riquadro, con la scritta attaccata al bordo
    // destro: riempiendo si perdeva il punto interrogativo. Intera, con due
    // bande di pochi pixel che spariscono nel nero.
    fit: 'contain',
  },
  {
    slug: 'escape-borgo',
    title: 'Escape Borgo',
    shape: 'square',
    image: 'webp/escape-borgo.webp',
    alt: 'Escape Borgo',
    url: null,
    // Il logo occupa il centro dell'immagine su fondo bianco. Un ingrandimento
    // del 10% lo porta alle proporzioni della tavola e lo lascia comunque
    // tutto dentro, con margine su ogni lato.
    zoom: 1.1,
  },
  {
    slug: 'abitacolo',
    title: 'Abitacolo',
    shape: 'square',
    image: 'webp/abitacolo.webp',
    alt: 'Abitacolo',
    url: null,
  },

  // --- riga 4 : quadrato, verticale, quadrato -------------------------------
  // PUI sta al centro del gruppo: su desktop fra i due quadrati della riga,
  // su mobile — dove le righe diventano colonne — a metà della colonna.
  {
    slug: 'portello-per-yacht',
    title: 'Portello per yacht',
    shape: 'square',
    image: 'webp/portello-per-yacht.webp',
    alt: 'Portello per yacht',
    url: null,
  },
  {
    slug: 'pui',
    title: 'PU-YI',
    shape: 'portrait',
    image: 'webp/pui.webp',
    alt: 'PU-YI',
    url: null,
  },
  {
    slug: 'sgardafoni',
    title: 'Sgardaphonik',
    shape: 'square',
    image: 'webp/sgardafoni.webp',
    alt: 'Sgardaphonik',
    url: null,
  },
];
