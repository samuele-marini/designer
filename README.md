# Samuele Marini — sito personale

Sito statico. Niente framework, niente npm, niente build.
Si apre in VS Code e si avvia con **Live Server** (serve un server locale: i
moduli JavaScript non funzionano aprendo il file con doppio clic).

> **Le due guide pratiche stanno qui accanto** e non danno per scontato
> niente:
> - **[GUIDA-AGGIORNARE-IL-SITO.md](GUIDA-AGGIORNARE-IL-SITO.md)** — CV,
>   foto, progetti, testi: cosa aprire e cosa scrivere.
> - **[GUIDA-PUBBLICARE-SU-GITHUB.md](GUIDA-PUBBLICARE-SU-GITHUB.md)** —
>   mettere il sito online, collegare il modulo dei contatti, aggiornarlo poi.
>
> Questo README invece racconta **com'è fatto il sito e perché**: serve a chi
> deve metterci le mani nel codice, non a chi deve cambiare un testo.

---

## Cosa devi fare tu

Tre cose, in ordine di importanza.

### 1. Collegare il form dei contatti

Il form è completo e funzionante ma non sa ancora dove mandare i messaggi.
Apri **`js/form.js`**: le istruzioni sono scritte in cima al file. In breve:
ti registri su formspree.io, ottieni un indirizzo tipo
`https://formspree.io/f/xxxxxxx` e lo incolli nella costante `ENDPOINT`.
Quell'indirizzo non è una password: è fatto per stare in una pagina pubblica.

Finché è vuoto, premendo SEND compare un avviso invece dell'invio.

### 2. Le immagini

Ci sono due serie di immagini, volutamente separate.

**`webp/` — la galleria del Portfolio e il ritratto.** Formato WebP, lato
lungo 800 px, circa mezzo megabyte in tutto. Partono appena la Home ha finito
di caricarsi, così il Portfolio è già pronto quando ci si arriva.

- **Progetti** — in `js/data/projects.js`, campo `image`. Lì si cambiano anche
  nome, forma (`landscape`, `square`, `portrait`) e inquadratura (`fit`,
  `position`, `zoom`, spiegati in cima al file).
- **Ritratto** — in `index.html`, nella Home.

**`WebP_Progetti/` — le pagine dei singoli progetti.** Versioni più grandi,
ricavate dagli originali in `img/`, più il video di Pulp Fiction. Non si
scaricano all'avvio: solo quando si apre il progetto.

- ogni immagine sta dentro 1200 x 800 px (mai ingrandita), qualità 90;
- la sua miniatura, in `WebP_Progetti/miniature/`, sta dentro 240 x 240,
  qualità 82;
- le schermate del Museo Pagani sono larghe 1000 px (desktop) e 300 px
  (mobile), a tutta altezza.

Il nome è quello del file originale in minuscolo, con i trattini al posto dei
trattini bassi: `img/morphy_chair_2.png` diventa `morphy-chair-2.webp`.

**Aggiungere un'immagine nuova a un progetto.** Esportala in WebP con le
misure qui sopra (e la miniatura, se vuoi che la fila sotto resti leggera),
mettila in `WebP_Progetti/` e aggiungi `img('nome')` nel punto giusto
dell'elenco in `js/data/project-pages.js`. Se la miniatura manca, il sito usa
l'immagine grande al suo posto.

In entrambi i casi: nome in minuscolo con trattini, senza spazi. Sul server
online le maiuscole contano, e `Foto.JPG` non è `foto.jpg`. Per lo stesso
motivo la cartella si chiama esattamente `WebP_Progetti`.

**La cartella `img/`** contiene gli originali. Il sito non la usa: si può
togliere quando tutto è verificato, ma serve per rigenerare le WebP.

### 3. Aggiungere o cambiare un progetto

Servono due file, sempre gli stessi.

**`js/data/projects.js` — la griglia del Portfolio.** Una voce per progetto:

```js
{
  slug: 'nuovo-progetto',          // nome breve, minuscolo, con trattini
  title: 'Nuovo progetto',         // il nome che si legge
  shape: 'square',                 // 'landscape' | 'square' | 'portrait'
  image: 'webp/nuovo-progetto.webp', // la copertina, nella cartella webp/
  alt: 'Nuovo progetto',
  url: null,
}
```

L'ordine dell'elenco è l'ordine della griglia: si riempiono le righe da
sinistra a destra, tre per volta. Occhio alla regola in cima al file: mai due
`landscape` a distanza di tre posizioni, altrimenti su telefono si toccano.

**`js/data/project-pages.js` — la pagina del progetto.** La chiave è lo
stesso `slug`:

```js
'nuovo-progetto': {
  images: [img('nuovo-progetto'), img('nuovo-progetto-1')],
  text: ['Primo paragrafo.', 'Secondo paragrafo.'],
  info: {
    lab: 'LABORATORIO DI ...',
    people: [{ label: 'Docente', value: 'Nome Cognome' }],
    technical: [{ label: 'Software utilizzati', value: 'Rhinoceros' }],
  },
},
```

**Le cose che si fanno più spesso:**

| Cosa vuoi fare | Dove |
| --- | --- |
| Cambiare un titolo | `projects.js`, campo `title` |
| Cambiare la copertina | `projects.js`, campo `image` (file in `webp/`) |
| Aggiungere un'immagine alla pagina | `project-pages.js`, aggiungi `img('nome')` nell'elenco `images` |
| Cambiare l'ordine delle immagini | sposta le righe dentro `images`: l'ordine è quello |
| Togliere un'immagine | cancella la sua riga da `images` |
| Sostituire un'immagine | esporta la nuova con lo stesso nome in `WebP_Progetti/` (e in `WebP_Progetti/miniature/`) |
| Cambiare la descrizione | `project-pages.js`, elenco `text`: un paragrafo per riga |
| Cambiare docente, gruppo, software | `project-pages.js`, dentro `info` |
| Cambiare il CV | `js/data/cv-data.js` |

I file da toccare sono **solo quelli in `js/data/`**. Tutto il resto —
`js/*.js`, `css/`, `index.html` — è l'impianto, e non va modificato per
cambiare un contenuto.

### 4. Mettere i link social

In `index.html`, sezione Contatti, due commenti segnano dove sostituire il `#`
con i tuoi indirizzi Instagram e LinkedIn.

---

## Com'è fatto

```
index.html              una sola pagina, quattro sezioni
css/
  base.css              colori, font, misure. Si parte da qui.
  layout.css            impianto: modello 3D, menu, sezioni, triangolo
  sections.css          Home, Portfolio, CV, Contatti
  project.css           la pagina di un singolo progetto
js/
  main.js               mette insieme i pezzi, poche righe
  scene3d.js            tutto il modello 3D, isolato dal resto
  navigation.js         macro-sezioni desktop e pannelli mobile
  gallery.js            costruisce la griglia dei progetti
  project.js            costruisce la pagina di un progetto quando si apre
  cv.js                 impagina il curriculum
  form.js               invio del modulo
  data/
    projects.js         >>> i 12 progetti: nomi, forme, immagini
    project-pages.js    >>> il contenuto di ogni pagina progetto
    cv-data.js          >>> il testo del CV
  vendor/               three.js, copiato nel progetto (nessuna CDN)
assets/
  trasformazioni_geometriche.obj
  fonts/                Inter, servito dal progetto
webp/                   galleria del Portfolio e ritratto
WebP_Progetti/          immagini e video delle pagine progetto
  miniature/            le miniature delle stesse immagini
img/                    gli originali (il sito non li usa)
references/             le tavole Figma, il CV e il portfolio in PDF, invariati
```

I file da toccare per cambiare i **contenuti** sono solo quelli in `js/data/`.
I file da toccare per cambiare l'**aspetto** sono quelli in `css/`.

---

## Le misure

In `css/base.css` c'è una variabile chiamata `--px`. Vale 1 pixel quando la
finestra è larga come la tavola Figma (1280 su desktop, 375 su mobile) e scala
dolcemente altrove. Per questo nel CSS trovi scritto:

```css
font-size: calc(42 * var(--px));   /* 42 pixel della tavola */
```

Così ogni numero nel CSS è il numero che leggi in Figma.

**Margini.** Sinistro 52, destro 60. Il sinistro è identico su tutte e quattro
le tavole ed è il riferimento della composizione. Il destro sulle tavole
variava fra 58 e 80; a 80 la pagina si leggeva spostata, e al Portfolio
mancava lo spazio per non finire sotto al modello. A 60 i due margini si
leggono equivalenti e la griglia respira.

**Dove regolare l'aspetto del 3D.** In cima a `js/scene3d.js` c'è un unico
oggetto `SETTINGS` con tutte le manopole — vetro, bordi, luci, resa —
commentate una per una. Nessuna di quelle voci costa un fotogramma in più,
tranne `transmission`, che è segnalata.

`render.transmissionResolution` (0,5) è la risoluzione dell'immagine che il
vetro rifrange, rispetto allo schermo: a 0,5 il passaggio di rifrazione disegna
un quarto dei pixel. Se un giorno il vetro ti sembrasse meno nitido, rimettila
a 1: è l'unica cosa che cambia.

---

## Il modello 3D

Vive tutto in `js/scene3d.js` e non sa niente del resto del sito. L'ambiente
studio, il rig di luci, i parametri del vetro, lo shader dei bordi e la posa
iniziale sono quelli del prototipo, invariati.

In cima al file ci sono le costanti regolabili. Le due che potresti voler
toccare:

- **`DESKTOP_WIDTH_FACTOR`** — quanto è grande il modello su desktop. È la
  larghezza della sagoma divisa per la larghezza della finestra: 0,404 dà i
  536 pixel della tavola a 1280. L'inquadratura è ancorata alla **larghezza**,
  non all'altezza, perché la tavola Figma è insolitamente bassa (578) e
  ancorandola all'altezza il modello cresceva fino a coprire il menu su una
  finestra normale.
- **`PITCH_LIMIT`** — quanto può inclinarsi in verticale. È a 0,18 radianti,
  circa 10 gradi. La rotazione orizzontale è rimasta quella del prototipo.

`HEIGHT_FACTOR` esiste ancora ma fa da tetto: il modello non supera comunque
una volta e mezza l'altezza della finestra. Serve sugli schermi larghi e bassi.

Il modello non è centrato nella finestra: sta al centro dello spazio fra il
bordo destro del menu e il bordo sinistro del contenuto. Il calcolo lo fa
`js/navigation.js` misurando la pagina, quindi resta corretto a qualunque
larghezza.

**Il guscio Fresnel e il vetro sono la stessa superficie**, quindi si
contendono la stessa profondità. A tenerli separati è `polygonOffset`, che li
scosta della stessa quantità su tutte le lastre. Non usare una scala
maggiorata: scalare scosta le superfici in proporzione alla distanza
dall'origine, quindi al centro del modello lo scostamento è zero e la lastra
centrale sfarfalla.

**Su telefono** il vetro rinuncia alla rifrazione. Non è una scelta estetica:
la rifrazione costa un secondo rendering completo della scena a ogni
fotogramma e su Android di fascia media fa scendere sotto i 30 fotogrammi al
secondo. Il modello risulta un po' meno vitreo sul telefono e molto più
fluido.

### La nitidezza si adatta al computer

Un fotogramma desktop costa molto più di uno mobile: schermo largo, nitidezza
doppia, antialiasing acceso — circa **nove volte i pixel** del telefono, e
ognuno disegnato due volte perché il vetro rifrange. Su una scheda grafica
normale non si sente; su un portatile con grafica integrata sì, e non si vede
come "il modello va piano": si vede come **scorrimento a scatti**, perché il
modello e il menu restano indietro rispetto alla pagina.

Invece di scegliere a priori una nitidezza bassa per tutti, la scena si misura
mentre lavora: se per circa mezzo secondo di fila i fotogrammi arrivano più
lenti di 22 ms (meno di 45 al secondo) scende di un gradino. Due gradini al
massimo — 1 → 0,75 → 0,56 della nitidezza scelta — e **non risale mai**: un
valore che va su e giù si nota più di uno basso. Su un computer veloce non
succede niente e la nitidezza resta piena.

Le manopole sono in cima a `js/scene3d.js` (`QUALITY_SLOW_MS`,
`QUALITY_PATIENCE`, `QUALITY_STEP`, `QUALITY_FLOOR`). Se un giorno volessi
partire più leggero per tutti, il valore da abbassare resta
`SETTINGS.render.pixelRatioDesktop`.

---

## La navigazione

Desktop e telefono si comportano in modo diverso, ed è voluto: col mouse una
pagina continua, col dito una scheda per volta.

### Desktop — un unico documento che scorre

Le quattro sezioni stanno una sotto l'altra: Home e Contatti occupano una
schermata, Portfolio e CV crescono con il loro contenuto. A scorrere è il
browser — rotella, trackpad, frecce, barra spaziatrice — e quindi si scorre
**da qualunque punto dello schermo**, anche col puntatore sopra al modello 3D.

Non c'è nessun motore di scorrimento scritto a mano. Prima le sezioni erano
quattro livelli sovrapposti e ogni evento della rotella doveva passare per il
codice: sopra al modello non succedeva niente, e col trackpad — che manda
decine di eventi al secondo più la coda dell'inerzia — si sentiva l'attrito di
tutte le regole che servivano a governarli.

**Quale sezione è attiva.** Una riga immaginaria a metà schermo: la sezione
che la attraversa comanda la voce del menu, la forma del menu e l'indirizzo.
Lo decide il browser (`IntersectionObserver`), quindi durante lo scorrimento
non gira nessun calcolo nostro.

**Il menu e il modello 3D sono legati allo scorrimento.** Fra Home e Portfolio
il menu passa da grande e centrato a piccolo e in alto, e il modello scivola
verso sinistra; il punto del viaggio è il punto dello scorrimento: a un quarto
della Home sono a un quarto del viaggio, e fermandosi lì ci restano. Non sono
animazioni che partono e finiscono per conto loro. Lo stesso succede in fondo,
fra CV e Contatti, dove tornano indietro.

**Dove sta il modello.** Al centro del corridoio fra il bordo destro del menu
e la colonna del contenuto, e il corridoio cambia da sezione a sezione: su
Home e Contatti il menu è grande e la colonna stretta, quindi il modello sta
più a destra; su Portfolio e CV arretra verso sinistra. Portfolio e CV
condividono lo stesso identico valore, altrimenti la differenza fra le due
colonne (450 e 417) si vedrebbe come uno scatto. Tutte le posizioni si
calcolano una volta sola e si rifanno solo ridimensionando la finestra.

Si interpola voce per voce, e solo con `transform`: la spaziatura viene dalle
posizioni interpolate, la dimensione dal rapporto fra i due corpi del testo.
Alle due estremità le voci tornano nude — nessuna trasformazione — così dove
ci si ferma il testo è disegnato alla sua misura vera.

**Anche i portatili hanno lo schermo tattile.** Su desktop il dito scorre la
pagina come fa il browser — quello non si tocca — ma fa anche girare il
modello, come il mouse: gira solo se il gesto è orizzontale, perché il
verticale è lo scorrimento e deve restare fluido.

### Mobile — schede

Le quattro sezioni sono livelli sovrapposti e se ne vede una per volta. Il
passaggio **segue il dito**: la scheda che esce e quella che entra si muovono
insieme al gesto, e al rilascio si assesta la più vicina. Il modello 3D
continua a girare col dito anche durante il passaggio, e cambiando sezione non
si sposta: la sua posizione di riposo è la stessa in tutte e quattro.

Resta anche l'asse orizzontale, sempre col dito: menu ↔ contenuto.

- **Home**, **Portfolio** e **Contatti** hanno due posizioni: menu e contenuto.
  La loro composizione sta già dentro lo schermo, come nelle tavole.
- **CV** ne ha tre: menu, contenuto parziale, contenuto pieno. È l'unico
  testo che non ci sta in larghezza.

**Il modello e il contenuto sono legati.** Quando il contenuto scivola verso
sinistra il modello scivola con lui, dello stesso numero di pixel: la distanza
fra i due non cambia mai, e così non può capitare che una riga di testo o
un'immagine finiscano sopra al modello.

Sul **Portfolio** il pannello non trasla: i 176 pixel che la composizione
lascia al modello sono un vuoto dentro la galleria, quindi scorrono via col
dito. Il modello trasla esattamente dei pixel di cui scorre la galleria, uno a
uno: vuoto e modello se ne vanno insieme, e non c'è nessuno scalino fra il
gesto e la risposta. Quando la galleria è tornata a inizio corsa, lo stesso
gesto verso destra riporta al menu.

Sul **CV** vale la stessa regola sull'altro pannello: aprendo il testo a
pagina intera il modello accompagna la traslazione, punto per punto, anche
mentre il dito sta ancora trascinando.

**Una cosa sola per volta comanda il modello.** Mentre il dito trascina il
pannello è il trascinamento a dire dove sta il modello; la galleria, che per
inerzia continua a scorrere, in quel momento non lo tocca. Erano due sorgenti
per la stessa posizione, ed è da lì che veniva lo scatto tornando indietro dal
Portfolio.

Il triangolo torna indietro di un passo. I contenuti lunghi (CV, Contatti)
scorrono dentro la loro scheda: il gesto che cambia sezione parte solo quando
il testo è arrivato a fine corsa, così si legge tutto senza saltare altrove.

**La rotazione col dito è un filo più reattiva ai gesti veloci**: il guadagno
cresce con la velocità e si ferma a +60%. Non c'è nessuna inerzia che continua
da sola — quando il dito si ferma, il modello si ferma.

L'indirizzo tiene l'ancora della sezione (`#cv`, `#contatti`), quindi i link
del menu sono link veri e si possono condividere.

---

## Pagine dei singoli progetti

Toccando un'immagine della galleria si apre la pagina del progetto. È una
sola pagina (`#project` in `index.html`) che `js/project.js` riempie al
momento dell'apertura.

- **Desktop** — la pagina occupa la stessa colonna della galleria; modello 3D
  e menu restano dove sono. Triangolo e titolo restano fermi in alto mentre il
  resto ci scorre sotto, in `difference` come il triangolo mobile. Il menu, la
  freccia indietro e Esc chiudono il progetto.
- **Mobile** — la pagina copre tutto lo schermo, su fondo nero. Si torna
  indietro col triangolo o con uno swipe da sinistra verso destra.

### Due schede, una sopra l'altra

Aprire un progetto è appoggiare una scheda sopra a un'altra. La scheda del
progetto **arriva da destra**; quella di sotto — la galleria, o la sezione in
cui ci si trova — fa un passo indietro: arretra del 3%, si rimpicciolisce del
6% e si spegne. Nient'altro: nessuna rotazione, nessuna prospettiva. La
profondità la danno la scala e la dissolvenza, e il movimento resta uno solo,
da destra verso sinistra.

I numeri della scheda di sotto sono piccoli apposta: si vedono ma non si
notano. Quello che deve saltare all'occhio è la scheda che entra.

- **Su desktop** la scheda è larga quanto la colonna della galleria, quindi
  il viaggio è lungo quanto lei: entra da appena fuori dallo schermo e si
  posa nella colonna. Il modello 3D e il menu restano dove sono.
- **Su telefono** la scheda copre tutto, e il viaggio è tutto lo schermo. Qui
  il modello 3D se ne va con la galleria: scivola a sinistra e sparisce del
  tutto, perché dietro alla pagina del progetto non deve restare niente.

Il modello fa in più un cenno: gira di pochi gradi aprendo e torna indietro
chiudendo (`PIVOT_TURN` in `js/project.js`, meno di dieci gradi). È un segno
di vita, non un'animazione: portarlo a zero lo spegne senza toccare altro.

**Un dettaglio che il CSS da solo sbaglia.** Su desktop `#sections` è lungo
tutto il documento — quattro schermate — quindi rimpicciolirlo attorno al suo
centro farebbe scorrere il contenuto in verticale mentre arretra.
`setStackOrigin()` in `js/project.js` mette l'origine al centro della
finestra, in coordinate dell'elemento, nel momento in cui il progetto si apre.
Su telefono non serve: lì `#sections` è grande quanto lo schermo.

**Tornare indietro col dito (telefono).** Uno swipe da sinistra verso destra
riporta la galleria, e lo fa seguendo il dito: è la stessa animazione al
contrario, fotogramma per fotogramma — scheda, sito, modello. A metà strada ci
si può fermare, tornare indietro e restare nel progetto. Al rilascio decide il
viaggio fatto — oltre un terzo dello schermo, o un colpetto veloce, e il
progetto si chiude; altrimenti torna aperto.

Le pose del gesto stanno in `applyPage()` e sono gli stessi numeri del CSS:
chi cambia l'animazione li cambi in tutti e due i posti, altrimenti col dito
si vede una cosa e col triangolo un'altra. Le posizioni seguono il dito una a
uno; la luce no — la scheda di sotto si riaccende prima di metà strada,
perché sta lì sotto e deve già vedersi.

Perché il gesto sia davvero nostro servono due cose, e vanno insieme:
`touch-action: pan-y pinch-zoom` sulla pagina progetto (`css/project.css`) e
il `preventDefault()` sul movimento (`js/project.js`). Senza, il browser
prende lo swipe orizzontale per il proprio "torna indietro" e **la pagina si
ricarica a metà animazione**.

**Dove si scrive il contenuto.** In `js/data/project-pages.js`, una voce per
progetto, con la chiave uguale allo `slug` del progetto in `projects.js`.
Testi e informazioni vengono dal PDF del portfolio in `references/`, riportati
parola per parola; dove il PDF non dice niente, la pagina non dice niente
(Abitacolo, per esempio, non ha descrizione).

```js
morficer: {
  images: [
    img('morphy-chair'),   // la prima è l'immagine grande
    img('morphy-chair-2'), // le altre sono le miniature, in quest'ordine
    { shape: 'portrait' }, // segnaposto rosso, finché manca un'immagine
  ],
  text: ['Primo paragrafo.', 'Secondo paragrafo.'],
  info: {
    lab: 'METODI E PROCESSI DI PROGETTAZIONE E PRODUZIONE',
    people: [{ label: 'Docente', value: '...' }],
    technical: [{ label: 'Software utilizzati', value: '...' }],
  },
},
```

Le etichette si scrivono normali: il maiuscolo lo mette il CSS. Le voci
vuote non compaiono. Nei valori `\n` va a capo: gli elenchi tecnici hanno una
voce per riga, come nel PDF. Toccando una miniatura, lei e l'immagine grande
si scambiano di posto. Il testo alternativo delle immagini è automatico
("Titolo, immagine 2 di 8"); un campo `alt` lo sostituisce.

**Museo Horacio Pagani** è l'unico con `pairs: true`: ogni schermata desktop ha
la sua versione mobile, `pair('sito-pagani-1', 'sito-pagani-mobile-1')`.
Nell'immagine grande le due versioni stanno affiancate, nelle miniature c'è
solo quella desktop, e scegliendone una cambiano entrambe. Delle pagine lunghe
si vede la parte alta, come sulla tavola; una schermata corta (il popup dei
biglietti) si vede intera.

**Ordine di caricamento.** Prima il sito: modello 3D, ritratto (dichiarato a
priorità alta in `index.html`), testi, menu. Appena la Home ha finito partono
le immagini della galleria; quando anche quelle sono arrivate e il browser non
ha più niente da fare, si portano avanti a priorità bassa le prime immagini
delle pagine progetto, una per volta (`prefetch` in `js/project.js`). Con la
connessione a risparmio dati non parte niente. Aprire il sito non aspetta mai
le immagini dei progetti.

**Pulp Fiction** ha un video al posto delle immagini:
`WebP_Progetti/pulp-fiction.mp4`. È lo stesso file che hai in `img/`, con la
stessa codifica e la stessa qualità: è stato solo riordinato internamente
(l'indice in testa al file) così il browser può iniziare a riprodurlo senza
arrivare prima alla fine. Il poster, l'immagine che si vede prima del play, è
il fotogramma a 3,8 secondi. Finché il progetto non si apre non si scarica
niente; poi **il film parte da solo**, va a ciclo continuo e si mette in pausa
quando si chiude il progetto (riaprendolo riprende da dov'era).

La riproduzione parte dentro al clic che ha aperto la pagina, quindi per il
browser è voluta e **l'audio c'è**. Se il browser non è d'accordo — su iPhone,
o con l'audio bloccato nelle impostazioni — il film parte **muto** invece di
non partire: si vede comunque e il volume è a un tocco. Il segno del volume si
aggiorna da solo perché legge il video, non il contrario.

I controlli sono quattro e li disegna il sito, non il browser: play/pausa al
centro dell'immagine (si ottiene anche toccando il video), volume a sinistra,
schermo intero a destra, e sotto — su una riga sua — l'avanzamento. Il cursore
del volume si apre solo toccando il suo segno, e da chiuso non occupa spazio.
Tutti i segni sono in `difference`, la barra di avanzamento compresa: bianchi
sul nero, scuri dove il film è chiaro.

Mentre il film va, dopo due secondi di quiete i controlli spariscono e restano
solo le immagini; tornano al primo movimento del puntatore o al primo tocco, e
in pausa ci sono sempre. Niente durata scritta, niente scarica, niente
velocità di riproduzione. Il filmato va a ciclo continuo.

**Le immagini dei progetti non si scaricano all'avvio.** Gli elementi `<img>`
di una pagina progetto nascono solo quando la si apre: è in quel momento che
parte il download, e solo dell'immagine grande e delle miniature. La versione
grande di un'altra immagine parte quando la si sceglie. Riaprendo lo stesso
progetto non si riscarica niente.
