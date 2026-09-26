/* ==========================================================================
   LE PAGINE DEI PROGETTI
   --------------------------------------------------------------------------
   QUESTO È L'UNICO FILE DA TOCCARE PER CAMBIARE IL CONTENUTO DI UN PROGETTO.

   Ogni pagina è collegata al suo progetto dal nome breve (`slug`), lo stesso
   scritto in js/data/projects.js. Il titolo invece NON sta qui: arriva da
   projects.js, così resta uno solo per tutto il sito.

   Testi e informazioni vengono dal PDF del portfolio
   (references/01_PORTFOLIO_SAMUELE_MARINI_UNIRSM_STAGE_2027.pdf), riportati
   parola per parola. Dove il PDF non dice niente, qui non c'è niente.

   Per ogni pagina:

     images   le immagini, nell'ordine in cui vanno viste. La prima è quella
              grande all'apertura; le altre sono le miniature sotto.
                img('nome')          WebP_Progetti/nome.webp, con la sua
                                     miniatura WebP_Progetti/miniature/nome.webp
                { shape: 'square' }  un segnaposto rosso ('landscape' |
                                     'square' | 'portrait'), finché manca
              Il nome è quello del file originale in img/, in minuscolo e con
              i trattini: img/morphy_chair_2.png -> img('morphy-chair-2').
              Un `alt` scritto a mano sostituisce il testo alternativo
              automatico ("Titolo, immagine 2 di 8").

     text     i paragrafi della descrizione, uno per riga dell'elenco.
              Un progetto senza descrizione ha l'elenco vuoto.

     info     le informazioni in fondo. Ogni voce ha un'etichetta e un
              valore; le etichette vanno scritte normalmente, il sito le
              mette in maiuscolo da solo. Le voci vuote non compaiono.
                lab        il laboratorio, o l'azienda / l'associazione
                people     docente, collaboratori, gruppo di lavoro...
                technical  caratteristiche, software, strumenti...
              Nei valori, \n va a capo: gli elenchi tecnici hanno una voce
              per riga, come nel PDF.

   CASO SPECIALE — Museo Horacio Pagani (`pairs: true`)
   Ogni schermata desktop ha la sua versione mobile:
       pair('sito-pagani-1', 'sito-pagani-mobile-1')
   Nella presentazione grande le due versioni stanno affiancate; nelle
   miniature compare solo quella desktop, e scegliendola cambia anche la
   mobile. Vale SOLO per questo progetto.

   CASO SPECIALE — il video (Pulp Fiction)
       { video: 'percorso.mp4', poster: 'immagine.webp', ratio: 16 / 9 }
   Il poster è l'immagine che si vede prima del play.

   LE IMMAGINI NON SI SCARICANO ALL'AVVIO DEL SITO.
   Partono solo quando si apre il progetto (vedi js/project.js).
   ========================================================================== */

const DIR = 'WebP_Progetti/';

/* Un'immagine: il file grande e la sua miniatura, con lo stesso nome. */
const img = (name) => ({ src: `${DIR}${name}.webp`, thumb: `${DIR}miniature/${name}.webp` });

/* Museo Pagani: la schermata desktop con la sua versione mobile.
   `extra` serve solo al caso dello store (vedi sotto, `mobileRatio`). */
const pair = (desktop, mobile, extra) => ({
  ...img(desktop),
  mobile: `${DIR}${mobile}.webp`,
  ...extra,
});

export const pages = {
  'museo-pagani': {
    pairs: true,
    images: [
      pair('sito-pagani', 'sito-pagani-mobile'), //     home page
      pair('sito-pagani-1', 'sito-pagani-mobile-1'), // store
      /* Biglietti: è l'unica schermata corta. Sul telefono la pagina è alta
         1139 su 375 di larghezza, e senza dirlo il riquadro stretto la
         lasciava più bassa della sua versione desktop. Dichiarando la
         proporzione vera, le due arrivano alla stessa altezza. */
      pair('sito-pagani-2', 'sito-pagani-mobile-2', { mobileRatio: 375 / 1139 }),
    ],
    text: [
      "Questo progetto è stato sviluppato mettendo al centro l'esperienza dell'utente. Il layout Bento Box rende la navigazione immediata e aiuta a trovare rapidamente le informazioni principali, mantenendo ordine e gerarchia visiva.",
      "L'interfaccia, realizzata con i font Satoshi e Bebas Neue e con la palette nero e giallo, è stata progettata in ottica responsive per garantire un'esperienza coerente su desktop e smartphone. Il sito comprende anche uno store con un flusso d'acquisto completo, pensato per simulare un'esperienza reale.",
      'Dopo aver completato la homepage, sono stati sviluppati prompt strutturati per Claude AI in grado di generare le pagine successive mantenendo automaticamente layout, componenti, stile grafico e coerenza del codice.',
      "Questo approccio ha velocizzato lo sviluppo garantendo uniformità tra tutte le pagine del sito e facilitando la progettazione di nuove sezioni senza compromettere l'identità del sito.",
    ],
    info: {
      lab: 'LABORATORIO DI WEB DESIGN E MULTIMEDIA',
      people: [
        { label: 'Docente', value: 'Corrado Loschi' },
        { label: 'Collaboratori', value: 'Elena Cavallin' },
        {
          label: 'Gruppo di lavoro',
          value: 'Samuele Marini, Rita Barani, Shasa Pazzaglia, Kevin Koloniari, Giacomo Garattoni',
        },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value: 'Sito web responsive desktop/mobile,\nLayout Bento Box',
        },
        { label: 'Linguaggi utilizzati', value: 'HTML, CSS, JavaScript' },
        { label: 'Software utilizzati', value: 'Figma, Claude AI' },
      ],
    },
  },

  morficer: {
    images: [
      img('morphy-chair'), //   img/morphy_chair.png
      img('morphy-chair-2'), // img/morphy_chair_2.png  (nella cartella non c'è un _1)
      img('morphy-chair-3'),
      img('morphy-chair-4'),
      img('morphy-chair-5'),
      img('morphy-chair-6'), // img/morphy_chair_6.jpg
      img('morphy-chair-7'), // img/morphy_chair_7.jpg
      img('morphy-chair-8'),
    ],
    text: [
      "Morphy nasce dall'idea di unire ergonomia e versatilità in un'unica seduta. Attraverso un sistema meccanico regolabile, la sedia può trasformarsi da seduta ergonomica con appoggio sulle ginocchia a una configurazione tradizionale.",
      "L'obiettivo era progettare un prodotto realmente realizzabile, utilizzando componenti standard e soluzioni costruttive semplici ma efficaci.",
    ],
    info: {
      lab: 'METODI E PROCESSI DI PROGETTAZIONE E PRODUZIONE',
      people: [
        { label: 'Docente', value: 'Dario Croccolo' },
        { label: 'Collaboratori', value: 'Andrea Paffetti' },
        {
          label: 'Gruppo di lavoro',
          value: 'Samuele Marini, Beatrice Birsigotti, Asia Pompili, Aurora Giulianelli, Eleonora Fiorini',
        },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value:
            'Seduta ergonomica regolabile,\nStruttura in tubolare di acciaio inox piegato,\nMeccanismi di regolazione in altezza e inclinazione,\nProgettazione orientata alla produzione',
        },
        { label: 'Software utilizzati', value: 'Autocad, Fusion, Chat GPT' },
      ],
    },
  },

  'link-campus': {
    images: [
      img('link-campus'), //   img/link_campus.png
      img('link-campus-1'),
      img('link-campus-2'),
      img('link-campus-3'),
      img('link-campus-4'),
      img('link-campus-5'),
      img('link-campus-6'),
    ],
    text: [
      "Link nasce dall'equilibrio tra privacy e condivisione. Il progetto organizza lo studentato come una sequenza di spazi che favoriscono relazioni spontanee senza rinunciare all'intimità individuale: dalla camera privata alla cucina condivisa, dai terrazzi comuni fino al tetto sociale.",
      "L'architettura diventa così uno strumento capace di trasformare la quotidianità in occasioni di incontro, mantenendo sempre il giusto equilibrio tra individuo e comunità.",
      "Ogni scelta progettuale nasce per favorire la qualità dell'abitare.",
      'Le camere non condividono pareti tra loro, garantendo silenzio e privacy.',
      'Cucina, terrazzi e corridoi diventano spazi sociali flessibili, mentre il piano terra e il tetto estendono la vita collettiva alla città.',
    ],
    info: {
      lab: "STORIA DELL'ARCHITETTURA CONTEMPORANEA",
      people: [
        { label: 'Docente', value: 'Paolo Lucchetta' },
        { label: 'Gruppo di lavoro', value: 'Samuele Marini, Francesco Lombardi, Irene Davoli' },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value:
            '1 studente > 1 camera,\n2 studenti > 1 bagno,\n4 studenti > 1 cucina,\n12 studenti > 1 terrazzo,\n96 studenti > corridoi, ponti e tetto sociale,\nCittà > servizi pubblici al piano terra',
        },
        { label: 'Software utilizzati', value: 'Rhinoceros, Indesign, Chat gpt' },
      ],
    },
  },

  /* Echoes e Parallax: due progetti distinti dello stesso corso,
     Geometria per il Design. Nel PDF stanno su due pagine affiancate. */
  echoes: {
    images: [
      img('echoes-1'), // img/echoes_1.JPG — non c'è un file senza numero: è
      img('echoes-2'), //                    la stessa foto della galleria
      img('echoes-3'),
      img('echoes-4'),
    ],
    text: [
      'Echoes nasce dallo studio delle trasformazioni geometriche. Partendo da un modulo composto da un quadrato e un cerchio, ogni elemento viene scalato, ruotato e traslato fino a generare una forma tridimensionale.',
      'Il modello, sviluppato in Rhinoceros e realizzato tramite taglio laser, trasforma delle semplici regole geometriche in una composizione che cambia aspetto a seconda del punto di osservazione.',
    ],
    info: {
      lab: 'GEOMETRIA PER IL DESIGN',
      people: [
        { label: 'Docente', value: 'Ramin Razzani' },
        { label: 'Collaboratori', value: 'Desiree Eugenia Sisto' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      // Nel PDF la pagina di Echoes non ha informazioni tecniche: quelle
      // (Rhinoceros; stampa 3D, taglio laser) stanno sulla pagina di Parallax.
      technical: [],
    },
  },

  parallax: {
    images: [
      img('parallax'), //   img/parallax.png
      img('parallax-1'),
    ],
    text: [
      'Parallax nasce dallo studio delle tassellazioni geometriche e del rapporto tra forma e luce.',
      'Attraverso una composizione di moduli progettati in Rhino e stampati in 3D, ogni superficie è inclinata per guidare e filtrare la luce, trasformando un semplice pannello luminoso in un elemento capace di creare profondità, ombre e percezioni sempre diverse.',
    ],
    info: {
      lab: 'GEOMETRIA PER IL DESIGN',
      people: [
        { label: 'Docente', value: 'Ramin Razzani' },
        { label: 'Collaboratori', value: 'Desiree Eugenia Sisto' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      technical: [
        { label: 'Software utilizzati', value: 'Rhinoceros' },
        { label: 'Strumenti', value: 'Stampa 3D, taglio laser' },
      ],
    },
  },

  'rumori-hub': {
    images: [
      img('rumo-ri-hub'), //   img/rumo-ri_hub.jpeg — la copertina
      img('rumo-ri-hub-0'), // img/rumo-ri_hub_0.png — la prima dopo la copertina
      img('rumo-ri-hub-1'),
      img('rumo-ri-hub-2'),
      img('rumo-ri-hub-3'),
      img('rumo-ri-hub-4'),
      img('rumo-ri-hub-5'),
      img('rumo-ri-hub-6'),
      img('rumo-ri-hub-7'),
    ],
    text: [
      "Rumo.ri Hub nasce dalla sfida di progettare un'identità visiva per uno spazio culturale aperto ad attività di natura diversa come eventi, laboratori, mostre e concerti.",
      "L'obiettivo era creare un linguaggio grafico riconoscibile ma estremamente versatile, capace di adattarsi a ogni occasione senza perdere coerenza.",
      'Il progetto è stato sviluppato in team, trasformando il confronto tra idee differenti in una soluzione condivisa e solida.',
    ],
    info: {
      lab: 'LABORATORIO DI DESIGN DELLA COMUNICAZIONE',
      people: [
        { label: 'Docente', value: 'Ilaria Ruggeri' },
        { label: 'Collaboratore', value: 'Gazmend Zeneli' },
        {
          label: 'Gruppo di lavoro',
          value: 'Samuele Marini, Francesco Lombardi, Sofia Masnari, Filippo Pantaleoni, Matteo Simonetti',
        },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value: 'Naming e progettazione del brand,\nPalette basata sui colori primari,\nIconografia in pixel art',
        },
        { label: 'Software utilizzati', value: 'Photoshop, illustrator, Indesign' },
      ],
    },
  },

  'pulp-fiction': {
    images: [
      {
        video: `${DIR}pulp-fiction.mp4`, //          img/pulp_fiction.mp4, stessa codifica
        poster: `${DIR}pulp-fiction-poster.webp`, // il fotogramma a 3,8 s del video
        ratio: 16 / 9, //                             1920x1080
      },
    ],
    text: [
      'Rielaborazione di una celebre scena di Pulp Fiction attraverso una narrazione interamente costruita con immagini statiche animate.',
      'Il progetto esplora il rapporto tra immagine, testo e ritmo, utilizzando la tipografia come elemento narrativo capace di amplificare tensione, emozioni e personalità dei personaggi.',
    ],
    info: {
      lab: 'LABORATORIO VIDEO E MULTIMEDIA',
      people: [
        { label: 'Docente', value: 'Raffaele Cafarelli' },
        { label: 'Collaboratori', value: 'Elena La Maida' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      // Nel PDF c'è anche una voce "Link: Illustrazione ad alto", che sembra
      // un segnaposto rimasto: non è stata riportata.
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value: 'Illustrazione ad alto contrasto,\nAnimazione,\nTipografia,\nSincronizzazione con i dialoghi originali',
        },
        { label: 'Software utilizzati', value: 'Photoshop, Illustrator, After Effects' },
      ],
    },
  },

  'escape-borgo': {
    images: [
      img('escape-borgo'), //   img/escape_borgo.jpeg
      img('escape-borgo-1'),
      img('escape-borgo-2'),
    ],
    text: [
      'Escape Borgo nasce come proposta di valorizzazione del centro storico di San Leo attraverso un\'esperienza di gioco immersiva. Il progetto affronta problematiche reali del territorio, come il turismo "mordi e fuggi", lo spopolamento e la difficoltà nel coinvolgere attività locali e visitatori. L\'obiettivo è trasformare una semplice visita in un\'esperienza partecipativa capace di aumentare il tempo di permanenza, generare valore economico per il borgo e rafforzare il legame tra cittadini, commercianti e turisti.',
      'L\'evento trasforma il centro storico di San Leo in un\'esperienza investigativa immersiva, dove squadre di 2-5 persone esplorano vicoli, monumenti e attività locali risolvendo enigmi ispirati alla storia del borgo. A differenza delle tradizionali City Escape, il progetto elimina l\'uso dello smartphone durante il gioco: mappe, indizi e materiali fisici, realizzati dagli artigiani locali, favoriscono collaborazione, socialità e un\'autentica esperienza di "digital detox".',
      "L'evento si conclude con un aperitivo basato su prodotti agroalimentari a chilometro zero.",
      "Per validare il progetto è stato realizzato un questionario rivolto ai potenziali visitatori delle province limitrofe. I risultati hanno confermato l'interesse della fascia 18-24 anni, la disponibilità a spostarsi per esperienze originali e l'importanza della stagionalità.",
      "Tra le proposte emerse, è stato scelto Escape Borgo perché rappresenta un format con minore concorrenza rispetto ai concerti e maggiore potenziale di attrarre visitatori curiosi in cerca di un'esperienza esclusiva.",
    ],
    info: {
      lab: 'ECONOMIE DEI PRODOTTI E DEI PROGETTI',
      people: [
        { label: 'Docente', value: 'Karen Venturini' },
        { label: 'Collaboratori', value: 'Chiara Benedettini' },
        { label: 'Lavoro di', value: 'Samuele Marini, Asia Pompili, Sangita Menietti, Eleonora Bussi' },
      ],
      technical: [
        {
          label: 'Infografica',
          value: 'Problema\n↓\nRicerca\n↓\nGoogle Form\n↓\nConcept\n↓\nBusiness Plan\n↓\nEscape Borgo',
        },
        { label: 'Analisi di mercato', value: 'SWOT\nPESTLE\nStakeholder\nBuyer Personas\nBusiness Planning' },
        { label: 'Software utilizzati', value: 'Indesign, Google Form, Gemini' },
      ],
    },
  },

  /* Abitacolo: nel PDF non c'è una descrizione. Parlano i disegni. */
  abitacolo: {
    images: [
      img('abitacolo'), //   img/abitacolo.png
      img('abitacolo-1'),
      img('abitacolo-2'),
      img('abitacolo-3'),
      img('abitacolo-4'),
      img('abitacolo-5'),
    ],
    text: [],
    info: {
      lab: 'LABORATORIO DI DISEGNO PER IL PROGETTO',
      people: [
        { label: 'Designer', value: 'Bruno Munari' },
        { label: 'Docente', value: 'Orsetta Rocchetto' },
        { label: 'Collaboratore', value: 'Federico Giustozzi' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      technical: [],
    },
  },

  'portello-per-yacht': {
    images: [
      img('portello-yacht'), //   img/portello_yacht.jpg
      img('portello-yacht-1'),
      img('portello-yacht-2'),
      img('portello-yacht-3'),
    ],
    text: [
      "Il progetto nasce dal rilievo tridimensionale di un'area dello scafo caratterizzata da superfici inclinate e geometrie irregolari. La sfida principale è stata progettare un portello a tenuta stagna, garantendo la corretta compressione della guarnizione lungo tutto il perimetro.",
      'La progettazione è stata sviluppata con software CAD 3D privilegiando componenti standard quando possibile, cercando di semplificare produzione e assemblaggio.',
    ],
    info: {
      lab: 'NAUTICOLIVER SRL',
      people: [
        { label: 'Responsabile ufficio tecnico', value: 'Andrea Galli' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value:
            'Alluminio,\nTenuta stagna,\nCerniere,\nBlocco in apertura,\nChiavistello,\nPortellino passaggio cavi,\nStuccaggio e lucidatura',
        },
        { label: 'Software utilizzati', value: 'Autocad, Creo Parametric' },
      ],
    },
  },

  pui: {
    images: [
      img('pu-yi'), //   img/pu-yi.png
      img('pu-yi-1'),
      img('pu-yi-3'), // img/pu-yi_3.png (nella cartella non c'è un _2)
    ],
    text: [
      'PU YI nasce dalla collaborazione con un architetto per la realizzazione di un mobile destinato ad essere presentato al fuorisalone di Milano.',
      "Ho seguito l'intero sviluppo del progetto, dalla progettazione CAD ai disegni costruttivi, coordinando la produzione dei componenti presso fornitori esterni fino all'assemblaggio finale.",
      'Il mobile combina struttura metallica, legno impiallacciato, illuminazione dimmerabile e un rivestimento in pelle di capra trattata artigianalmente, integrando lavorazioni industriali e finiture manuali in un unico prodotto.',
    ],
    info: {
      lab: 'GITALY CONTRACT SRL',
      people: [
        { label: 'Architetto', value: 'Roberto Bellantoni' },
        { label: 'Responsabile ufficio tecnico', value: 'Samuele Tordini' },
        { label: 'Lavoro di', value: 'Samuele Marini' },
      ],
      technical: [],
    },
  },

  sgardafoni: {
    images: [
      img('sgardaphonik'), //   img/sgardaphonik.png
      img('sgardaphonik-1'),
      img('sgardaphonik-2'),
      img('sgardaphonik-3'),
      img('sgardaphonik-4'),
      img('sgardaphonik-5'), // img/sgardaphonik_5.jpg
      img('sgardaphonik-6'),
      img('sgardaphonik-7'),
    ],
    text: [
      "Sgardaphonik nasce come progetto di comunicazione per rinnovare l'immagine dell'Associazione Bottega e raggiungere un pubblico più ampio, senza perdere il legame con il territorio. Dal naming all'identità visiva, ogni elemento è stato progettato per promuovere concerti ed eventi culturali attraverso un linguaggio contemporaneo, capace di valorizzare la musica originale e creare una riconoscibilità forte e coerente.",
      "Il progetto racconta un'esperienza concreta di volontariato, in cui design e comunicazione diventano strumenti per coinvolgere la comunità, sostenere artisti emergenti e rafforzare la rete culturale del territorio.",
    ],
    info: {
      lab: 'ASS. BOTTEGA ODV FOSSOMBRONE',
      people: [
        { label: 'Presidente', value: 'Valerio Paganelli' },
        { label: 'Vicepresidente', value: 'Samuele Marini' },
        {
          label: 'Volontari',
          value: 'Valerio Pretelli, Luca Buccarelli, Caterina Carbonari, Davide Ricci, Maria Dafne Zerbi',
        },
      ],
      technical: [
        {
          label: 'Caratteristiche tecniche',
          value: 'Naming e progettazione del brand,\nSocial Media Design,\nPianificazione Eventi',
        },
        { label: 'Software utilizzati', value: 'Photoshop, illustrator, Indesign' },
      ],
    },
  },
};
