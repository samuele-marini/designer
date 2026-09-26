# Guida per aggiornare il sito

Tutto quello che ti serve per cambiare i contenuti senza chiedere aiuto a
nessuno. Non serve saper programmare: si tratta di riscrivere del testo fra
virgolette e di mettere dei file in una cartella.

**Regola d'oro.** Prima di toccare qualcosa, fai una copia della cartella del
sito. Se qualcosa si rompe, cancelli e riparti dalla copia. Costa dieci
secondi ed è l'unica assicurazione che ti serve.

---

## Indice

1. [Come aprire e provare il sito sul tuo computer](#1-come-aprire-e-provare-il-sito-sul-tuo-computer)
2. [Come si legge un file di contenuti](#2-come-si-legge-un-file-di-contenuti)
3. [Aggiornare il CV](#3-aggiornare-il-cv)
4. [Cambiare la foto del profilo](#4-cambiare-la-foto-del-profilo)
5. [Cambiare i testi della Home e dei Contatti](#5-cambiare-i-testi-della-home-e-dei-contatti)
6. [Aggiungere o cambiare un progetto nella galleria](#6-aggiungere-o-cambiare-un-progetto-nella-galleria)
7. [Aggiungere immagini alla pagina di un progetto](#7-aggiungere-immagini-alla-pagina-di-un-progetto)
8. [Preparare le immagini (formato, misure, peso)](#8-preparare-le-immagini-formato-misure-peso)
9. [Quello che è meglio non toccare](#9-quello-che-è-meglio-non-toccare)
10. [Se qualcosa si rompe](#10-se-qualcosa-si-rompe)

---

## 1. Come aprire e provare il sito sul tuo computer

**Non basta fare doppio clic su `index.html`.** Il sito è fatto di moduli, e
per sicurezza i browser non li caricano da un file aperto direttamente: vedresti
una pagina nera. Serve un piccolo "server locale", che è meno complicato di
come suona.

Con **Visual Studio Code**, che già usi:

1. Apri VS Code → `File` → `Apri cartella…` → scegli la cartella del sito.
2. Nella colonna a sinistra clicca l'icona delle estensioni (i quattro
   quadratini), cerca **Live Server** e installala. Si fa una volta sola.
3. Clic destro su `index.html` → **Open with Live Server**.

Si apre il browser all'indirizzo `http://127.0.0.1:5500`. Da lì in poi ogni
volta che salvi un file la pagina si ricarica da sola: cambi, salvi, guardi.

**Per provare la versione telefono** senza telefono: nel browser premi `F12`,
poi l'icona del telefono in alto a sinistra del pannello che si apre (o
`Ctrl + Shift + M`). Scegli un modello, per esempio iPhone 12 Pro.

---

## 2. Come si legge un file di contenuti

I contenuti stanno in tre file dentro `js/data/`. Si aprono con VS Code (o con
qualsiasi editor di testo) e sono fatti così:

```js
{
  title: 'Morphi chair',
  shape: 'square',
}
```

Tre cose da sapere, e sono le uniche:

- **Il testo va fra apici** `'così'`. Se dentro al testo c'è un apostrofo,
  usa le virgolette doppie: `"L'esperienza sul campo"`. Sbagliare qui è
  l'unico modo realistico di rompere qualcosa, e si vede subito: la pagina
  resta nera.
- **Ogni riga finisce con una virgola.** Anche l'ultima: non dà fastidio.
- **Quello che comincia con `//` o sta fra `/*` e `*/` sono appunti**, non
  contano. Puoi scriverci quello che vuoi.

> Se la pagina diventa nera dopo una modifica, premi `F12` e guarda la scheda
> **Console**: c'è scritto in che file e a che riga hai lasciato un apice
> aperto o una virgola di troppo. Vedi anche il punto 10.

---

## 3. Aggiornare il CV

**File da toccare: `js/data/cv-data.js`. Solo quello.**

Il CV del sito è scritto lì dentro, riga per riga. La pagina si costruisce da
sola: se aggiungi un'esperienza, il sito la impagina come le altre.

### Cambiare un'esperienza esistente

Cerca il titolo che ti interessa e riscrivi quello che c'è fra gli apici:

```js
{
  title: 'Responsabile di commessa · Gitaly Contract',
  meta: '06/2023 – 05/2024',
  text: 'Progettazione 2D con AutoCAD e gestione delle commesse di arredo…',
},
```

- `title` — ruolo · azienda. Il punto in mezzo è `·` (si copia da qui).
- `meta` — le date. Il trattino lungo è `–` (anche questo si copia da qui).
- `text` — la descrizione, tutta di seguito.

### Aggiungere una nuova esperienza

Copia un blocco intero da `{` a `},`, incollalo **sopra** al primo (le
esperienze vanno dalla più recente alla più vecchia) e riscrivi i tre campi.
Attenzione a non perdere le parentesi graffe e la virgola finale.

### Aggiungere una voce a Formazione, Competenze, Lingue…

Stessa cosa, dentro la sezione giusta. Le sezioni si riconoscono così:

```js
{
  label: 'Formazione',
  entries: [ … qui dentro le voci … ],
},
```

`label` è il titolino in maiuscolo che si vede nel sito: lo scrivi normale,
al maiuscolo ci pensa il sito.

### Cambiare telefono, email, città

Stanno in cima al file, nei campi `contact` ed `email`. **Attenzione**: quelli
che si vedono nella sezione *Contatti* sono un'altra cosa e stanno in
`index.html` (vedi punto 5). Se cambi numero, cambialo in tutti e due i posti.

---

## 4. Cambiare la foto del profilo

1. Prepara la foto **quadrata** (stesse dimensioni in larghezza e altezza),
   800 × 800 pixel. Il sito la ritaglia in tondo da solo.
2. Convertila in `.webp` (vedi punto 8).
3. Chiamala **esattamente** `samuele-marini.webp` e mettila nella cartella
   `webp/`, sovrascrivendo quella che c'è.

Fatto: non c'è nessun codice da cambiare, perché il nome del file è rimasto lo
stesso. Se invece vuoi darle un altro nome, apri `index.html`, cerca
`samuele-marini.webp` e scrivi il nuovo nome al suo posto.

---

## 5. Cambiare i testi della Home e dei Contatti

**File da toccare: `index.html`.**

Fa un po' impressione, ma i testi si trovano cercando con `Ctrl + F`. Cerca una
frase che vedi nel sito e la trovi scritta lì. Cambia **solo il testo fra i
segni `>` e `<`**:

```html
<p>Dopo sei anni di esperienza nella progettazione meccanica…</p>
     ↑ questo si cambia                                      ↑
```

Le cose in `< >` sono l'impalcatura: se ne cancelli una, la pagina si scompone.

Da lì cambi: la presentazione della Home, "LET'S WORK TOGETHER!", l'email, il
telefono e la città nei Contatti.

### Aggiungere i link a LinkedIn e Instagram

Sono già nel sito, nella sezione Contatti: sono i due quadratini sopra al
modulo. Cerca `contact__social` in `index.html` e troverai due righe così:

```html
<a href="#" aria-label="Instagram" …>
```

Sostituisci il `#` con il tuo indirizzo completo, per esempio
`https://www.instagram.com/tuonome/`. Le virgolette devono restare.

---

## 6. Aggiungere o cambiare un progetto nella galleria

**File da toccare: `js/data/projects.js`.**

Ogni progetto della griglia è un blocco così:

```js
{
  slug: 'morficer',
  title: 'Morphi chair',
  shape: 'square',
  image: 'webp/morficer.webp',
  alt: 'Morphi chair',
  url: null,
},
```

| campo | a cosa serve |
|---|---|
| `slug` | il nome breve, senza spazi né accenti. **È il filo che lega la griglia alla pagina del progetto**: deve essere identico in `project-pages.js`. |
| `title` | il titolo che si legge sopra l'immagine. |
| `shape` | la forma del riquadro: `'landscape'` (orizzontale), `'square'` (quadrato) o `'portrait'` (verticale). |
| `image` | il file, dentro `webp/`. |
| `alt` | la descrizione per chi non vede l'immagine. Se manca, il sito usa il titolo. |
| `url` | lascialo `null`. Serve solo se un progetto deve portare a un sito esterno invece che alla sua pagina. |

Ci sono anche tre campi facoltativi per **inquadrare** un'immagine dentro al
riquadro, se il taglio automatico non ti piace:

- `position: '50% 0%'` — quale parte dell'immagine tenere (qui: la parte
  alta). Primo numero orizzontale, secondo verticale, da `0%` a `100%`.
- `fit: 'contain'` — fa stare l'immagine **intera** nel riquadro, con il nero
  attorno, invece di riempirlo tagliandola.
- `zoom: 1.1` — ingrandisce l'immagine del 10% dentro al riquadro.

### Aggiungere un progetto nuovo

1. Metti l'immagine in `webp/` (vedi punto 8 per le misure).
2. Copia un blocco esistente, incollalo dove vuoi che compaia e cambia i
   campi.
3. Se il progetto ha anche una sua pagina, aggiungila in `project-pages.js`
   usando **lo stesso `slug`** (punto 7). Se non gliela fai, la cella si vede
   ma non si apre: è normale e non è un errore.

### L'unica regola di composizione da rispettare

La griglia è a righe di tre. Su telefono quelle righe diventano colonne,
quindi **si affiancano il 1°, il 4°, il 7° e il 10° progetto** (e così per gli
altri due gruppi). Due `landscape` affiancati si toccano e sembrano un
rettangolo unico: quindi non mettere mai due `landscape` a tre posizioni di
distanza l'uno dall'altro. In cima al file c'è lo schema completo.

---

## 7. Aggiungere immagini alla pagina di un progetto

**File da toccare: `js/data/project-pages.js`.**

Ogni pagina è così:

```js
morficer: {
  images: [
    img('morphy-chair'),    // la prima è l'immagine grande
    img('morphy-chair-2'),  // le altre diventano le miniature, in quest'ordine
  ],
  text: ['Primo paragrafo.', 'Secondo paragrafo.'],
  info: { … },
},
```

`img('morphy-chair')` non è magia: vuol dire **due file con lo stesso nome**,

```
WebP_Progetti/morphy-chair.webp             ← la grande
WebP_Progetti/miniature/morphy-chair.webp   ← la piccola
```

Quindi per aggiungere un'immagine a un progetto:

1. Prepara i due file (grande e miniatura, stesso nome — punto 8).
2. Mettili nelle due cartelle.
3. Aggiungi una riga `img('nome-del-file'),` nell'elenco `images`, nel punto
   in cui vuoi che compaia. Il nome si scrive **senza** `.webp`.

Toccando una miniatura, quella e la grande si scambiano di posto: l'ordine
dell'elenco è l'ordine delle miniature.

### I testi e le informazioni in fondo

```js
text: [
  'Un paragrafo.',
  'Un altro paragrafo.',
],
info: {
  lab: 'LABORATORIO VIDEO E MULTIMEDIA',
  people: [{ label: 'Docente', value: 'Nome Cognome' }],
  technical: [{ label: 'Software utilizzati', value: 'Photoshop\nIllustrator' }],
},
```

- Ogni stringa di `text` è un paragrafo a sé.
- Le etichette si scrivono normali: al maiuscolo ci pensa il sito.
- `\n` manda a capo dentro un valore: serve per gli elenchi di software, una
  voce per riga.
- Le voci che lasci vuote non compaiono. Un progetto senza descrizione ha
  `text: []` e va benissimo.

### Se manca ancora l'immagine

Metti un segnaposto al posto di `img(...)`:

```js
{ shape: 'portrait' },
```

Si vede un rettangolo rosso, che ti ricorda che lì manca qualcosa.

---

## 8. Preparare le immagini (formato, misure, peso)

Il sito usa **WebP**: stessa qualità del JPG a circa metà del peso.

### Come convertire, gratis e senza installare niente

Vai su **<https://squoosh.app>** (è di Google). Trascini l'immagine, a destra
scegli **WebP**, qualità **80**, e se serve metti la larghezza in *Resize*.
Poi scarichi. Le immagini non vengono caricate su nessun server: il lavoro lo
fa il browser sul tuo computer.

### Che misure dare

| dove va | larghezza | note |
|---|---|---|
| Galleria (`webp/`) | **800 px** | come le attuali |
| Foto del profilo (`webp/`) | **800 × 800** | quadrata |
| Immagine grande di un progetto (`WebP_Progetti/`) | **1000–1200 px** | l'altezza viene da sé |
| Miniatura (`WebP_Progetti/miniature/`) | **240–300 px** | stesso nome della grande |

Sono già il doppio abbondante di come si vedono: servono per gli schermi ad
alta densità, dove un pixel del disegno sono due pixel veri.

### Come chiamare i file

Minuscolo, con i trattini al posto degli spazi, senza accenti:
`morphy_chair 2.png` → `morphy-chair-2.webp`. Questa non è pignoleria: su
internet maiuscole e spazi nei nomi dei file causano problemi veri.

### Gli originali

Le foto e i render originali **non si toccano e non vanno nel sito**: restano
dove sono, in alta risoluzione. Nel sito vanno solo le copie in WebP.

---

## 9. Quello che è meglio non toccare

Se non stai cambiando contenuti, questi file non hanno motivo di aprirsi:

| cartella / file | cos'è |
|---|---|
| `js/vendor/` | la libreria 3D. Non è roba nostra. |
| `js/scene3d.js` | il modello 3D: luci, vetro, inquadratura. È tarato. |
| `js/navigation.js` | come si muovono menu, sezioni e modello. |
| `assets/` | il modello 3D vero e proprio e i font. |
| `css/` | l'aspetto: misure, colori, tipografia. |

Se un giorno vuoi capirci qualcosa, il `README.md` spiega com'è fatto tutto e
soprattutto **perché**. Ogni file ha i suoi commenti in italiano.

### L'unica riga che puoi toccare senza paura

In `js/scene3d.js`, dentro il blocco `render:` in cima al file:

```js
pixelRatioDesktop: 2,   // nitidezza del modello 3D su desktop
```

È **quanto lavoro fa la scheda grafica a ogni fotogramma**. Portandolo a
`1.5` il modello disegna circa il 44% di pixel in meno: su un computer lento
si sente subito, e la differenza di nitidezza sul modello è piccola. Se il
sito ti sembrasse mai poco reattivo su una macchina in particolare, è il
primo — e di solito l'unico — numero da provare. Si torna indietro
riscrivendo `2`.

(Il sito lo fa già da solo quando serve: se per mezzo secondo di fila i
fotogrammi arrivano lenti, scende di un gradino da sé. Questo valore è il
punto di partenza.)

---

## 10. Se qualcosa si rompe

**Pagina nera dopo una modifica.** È quasi sempre un apice o una virgola.
Premi `F12` → scheda **Console**: c'è scritto il file e la riga. Vai lì e
guarda: manca un `'`? manca una `,`? c'è un apostrofo dentro un testo fra
apici singoli?

**Un'immagine non si vede.** Tre possibilità, in ordine di probabilità:
il nome del file non è identico a quello scritto nel codice (attenzione a
maiuscole e trattini); il file è nella cartella sbagliata; hai scritto
`.webp` dove il file è `.jpg`.

**Una pagina progetto non si apre.** Lo `slug` in `projects.js` e la chiave in
`project-pages.js` non sono identici.

**Ho fatto un disastro.** Riprendi la copia di sicurezza. Se il sito è già su
GitHub, lì c'è tutta la storia: puoi tornare a qualsiasi versione precedente
(vedi la guida alla pubblicazione).

---

*Ultimo aggiornamento della guida: settembre 2026.*
