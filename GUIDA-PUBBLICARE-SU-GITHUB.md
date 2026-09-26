# Guida per pubblicare il sito su GitHub

Dalla cartella sul tuo computer a un indirizzo che puoi mandare a chiunque.
Gratis, senza scadenze e senza carta di credito.

Tempo realistico: **45 minuti** la prima volta, di cui metà ad aspettare.
Dopo, ogni aggiornamento sono tre clic.

---

## Indice

1. [Cosa stai per fare](#1-cosa-stai-per-fare)
2. [L'account GitHub](#2-laccount-github)
3. [Scegliere l'indirizzo del sito](#3-scegliere-lindirizzo-del-sito)
4. [Mettere il sito online](#4-mettere-il-sito-online)
5. [Accendere GitHub Pages](#5-accendere-github-pages)
6. [Far funzionare il modulo dei contatti](#6-far-funzionare-il-modulo-dei-contatti)
7. [Aggiornare il sito dopo la pubblicazione](#7-aggiornare-il-sito-dopo-la-pubblicazione)
8. [Se qualcosa non va](#8-se-qualcosa-non-va)
9. [Facoltativo: un indirizzo tutto tuo](#9-facoltativo-un-indirizzo-tutto-tuo)

---

## 1. Cosa stai per fare

**GitHub** è un posto dove si tengono le cartelle di lavoro tenendone anche
la storia: ogni versione resta, e si può sempre tornare indietro.
**GitHub Pages** è il servizio, incluso e gratuito, che prende una di quelle
cartelle e la pubblica come sito web.

Tre cose da sapere prima di cominciare:

- **Il codice sarà pubblico.** Chiunque può leggere i file del sito. Per un
  portfolio va benissimo — è quello che fanno quasi tutti i designer — ma
  significa che lì dentro non deve finire niente di privato. La cartella
  `references/` (il PDF del portfolio, le tavole Figma) resta fuori: c'è già
  un file `.gitignore` che la esclude.
- **Non c'è niente da pagare e niente da rinnovare.** Il sito resta online
  finché il repository esiste.
- **Nessun dato dei visitatori passa da te.** Il sito è fatto di file che
  vengono serviti e basta.

---

## 2. L'account GitHub

### Se ne hai già uno con l'email della scuola

Non serve rifare tutto. Serve però mettere in sicurezza due cose, perché
l'email della scuola un giorno smetterà di funzionare:

1. Entra in **Settings** (clic sulla tua foto in alto a destra) →
   **Emails** → *Add email address*: aggiungi la tua email personale e
   confermala. Poi rendila **primaria**.
2. Sempre in *Settings* → **Password and authentication**: attiva
   l'autenticazione a due fattori (2FA). GitHub ormai la richiede.

Controlla anche il **nome utente** (Settings → Account): quello finisce
nell'indirizzo del sito. Se è qualcosa come `sm2024-unirsm-01`, cambialo in
`samuelemarini` — si può fare da lì, e i link vecchi vengono reindirizzati.

### Se preferisci ricominciare da zero

Va bene uguale e non è uno spreco: vai su <https://github.com/signup>, usa la
tua **email personale** e scegli con cura il nome utente, perché sarà parte
dell'indirizzo. `samuelemarini` è la scelta giusta: corto, il tuo nome, senza
numeri.

---

## 3. Scegliere l'indirizzo del sito

Hai due possibilità, e la differenza è solo l'indirizzo che verrà fuori.

### A. Il sito personale — consigliata

Chiami il repository **esattamente** come il tuo nome utente seguito da
`.github.io`:

```
repository:  samuelemarini.github.io
indirizzo:   https://samuelemarini.github.io
```

Pulito, corto, si detta al telefono. Di questi ne hai **uno solo** per
account, ed è giusto che sia il portfolio.

### B. Un progetto fra gli altri

```
repository:  samuele-marini-designer
indirizzo:   https://samuelemarini.github.io/samuele-marini-designer/
```

Più lungo, ma puoi averne quanti ne vuoi. Ha senso se un domani vorrai
pubblicare anche altre cose.

> **Consiglio.** Prendi la A. Se un giorno ti servirà la B, aggiungerla è
> gratis e non tocca quella che hai già.

I nomi dei repository **non possono contenere spazi**: si usano i trattini.
Per questo la cartella si chiama `samuele_marini_designer` e non "Samuele
Marini designer". Il nome che si legge — quello nella linguetta del
browser e nei segnalibri — è un'altra cosa e dice già
**Samuele Marini — Designer**.

---

## 4. Mettere il sito online

### 4.0 La cartella — già fatto

La cartella si chiama **`samuele_marini_designer`**: fatto, e il sito è stato
ricontrollato dopo il cambio di nome. Nessun file dentro dipende da come si
chiama la cartella, quindi rinominarla non rompe niente — né allora né in
futuro.

Il nome della cartella serve solo a te per ritrovarti: **l'indirizzo del sito
lo decide il nome del repository**, non quello della cartella. I trattini
bassi vanno benissimo per una cartella; per il *repository*, se sceglierai la
strada B, preferisci i trattini normali (`samuele-marini-designer`), che negli
indirizzi web si leggono meglio.

### 4.1 Installa GitHub Desktop

I file del sito sono circa 160: troppi per il caricamento al volo dal sito di
GitHub, che ne prende 100 alla volta. Si usa **GitHub Desktop**, che è
gratuito, ha i pulsanti ed è comunque lo strumento che userai per tutti gli
aggiornamenti futuri. Non serve scrivere nessun comando.

1. Scarica da <https://desktop.github.com> e installa.
2. Apri il programma → **Sign in to GitHub.com** → entra con il tuo account.
3. Ti chiede nome ed email per firmare le modifiche: metti il tuo nome e
   l'email personale.

### 4.2 Crea il repository dalla cartella del sito

1. `File` → **Add local repository…**
2. *Choose…* → seleziona la cartella **`samuele_marini_designer`**
   (quella che contiene `index.html`).
3. GitHub Desktop dirà che non è ancora un repository e ti offrirà
   **"create a repository"**: clicca lì.
4. Nella finestra che si apre:
   - **Name**: `samuelemarini.github.io` (strada A) oppure
     `samuele-marini-designer` (strada B).
   - **Description**: *Sito personale — portfolio e CV*.
   - **Git ignore**: lascia **None** (il file `.gitignore` c'è già nella
     cartella, ed è quello giusto).
   - **License**: lascia *None*.
   - Clicca **Create repository**.

> È importante che tu parta **dalla cartella del sito**, non da una cartella
> che la contiene: `index.html` deve stare nella radice del repository,
> altrimenti l'indirizzo finisce con una sottocartella di troppo.

### 4.3 Primo salvataggio e pubblicazione

1. A sinistra vedi l'elenco dei file (circa 160, meno quelli esclusi dal
   `.gitignore`). In basso a sinistra, nel campo **Summary**, scrivi
   `Prima versione del sito`.
2. Clicca **Commit to main**. Hai salvato la prima versione nella storia.
3. In alto clicca **Publish repository**.
4. **Togli la spunta** da *Keep this code private*: GitHub Pages sul piano
   gratuito pubblica solo i repository pubblici.
5. **Publish repository**. Il caricamento dura qualche minuto: ci sono circa 18 MB,
   quasi tutti del video di Pulp Fiction.

---

## 5. Accendere GitHub Pages

1. Vai su `https://github.com/TUONOME/NOMEREPOSITORY` (da GitHub Desktop:
   `Repository` → *View on GitHub*).
2. **Settings** (in alto a destra) → nella colonna di sinistra, **Pages**.
3. *Build and deployment* → **Source**: `Deploy from a branch`.
4. **Branch**: `main`, cartella **`/ (root)`** → **Save**.
5. Aspetta. La prima pubblicazione prende **da uno a tre minuti**; ricarica
   la pagina e comparirà in alto il riquadro verde con l'indirizzo.

Apri l'indirizzo. Se vedi il modello 3D che gira, hai finito.

> **Primo controllo da fare**, e famelo davvero: apri il sito **dal
> telefono**, non solo dal computer. È lì che si vede se il caricamento è
> veloce sulla rete dati.

---

## 6. Far funzionare il modulo dei contatti

Un sito fatto di soli file non può mandare email da solo: serve qualcuno che
riceva il modulo e te lo inoltri. Ce ne sono di gratuiti e seri; il codice del
sito è già pronto, manca solo l'indirizzo dove mandare.

### Formspree — già collegato

Il tuo indirizzo Formspree è **già dentro il sito**, in `js/form.js`:

```js
const ENDPOINT = 'https://formspree.io/f/mjykapdo';
```

È stato collaudato senza mandare niente: si è sostituito il pezzo che parla
con la rete e si è guardato **dove sarebbe andata la richiesta e con quali
campi**. Risultato:

```
https://formspree.io/f/mjykapdo
  nome = Mario Rossi
  email = mario@esempio.it
  messaggio = Ciao Samuele
  subject = Messaggio dal sito — Mario Rossi
```

Restano due cose da fare a te, e solo tu puoi farle:

1. **Conferma l'email** che Formspree ti ha mandato. Senza quel passaggio i
   messaggi non partono.
2. **Fai una prova vera dal sito pubblicato**: compila e manda. Deve arrivarti
   su Gmail — la prima volta controlla anche lo spam, e se lo trovi lì segna
   "non è spam", così le successive vanno in posta in arrivo.

Se un giorno cambi servizio, cambia solo quella riga.

Gratis fino a **50 messaggi al mese**. Per un portfolio è tanto: se un giorno
dovessero stare stretti, si cambia servizio cambiando quella riga.

### L'alternativa senza registrarsi: Web3Forms

Se non vuoi creare un altro account: <https://web3forms.com>, scrivi la tua
email, ricevi una chiave. Poi in `js/form.js`:

```js
const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = 'la-chiave-che-ti-hanno-mandato';
```

Gratis fino a 250 messaggi al mese.

### Due cose che val la pena sapere

- **Né l'indirizzo né la chiave sono password.** Sono fatti per stare in una
  pagina pubblica, come un numero di telefono su un biglietto da visita:
  servono a recapitare, non ad aprire niente.
- **Lo spam è già arginato.** Nel modulo c'è un campo invisibile (`_gotcha`):
  i robot che compilano i moduli in automatico lo riempiono, gli umani no, e
  quei messaggi vengono buttati prima di partire.

---

## 7. Aggiornare il sito dopo la pubblicazione

Questa è la parte che userai per anni, e sono tre clic.

1. Modifica quello che ti serve sul tuo computer (vedi
   `GUIDA-AGGIORNARE-IL-SITO.md`) e **salva**.
2. Apri **GitHub Desktop**: a sinistra compaiono i file che hai cambiato, a
   destra cosa è cambiato riga per riga.
3. In basso a sinistra, in **Summary**, scrivi cosa hai fatto — in italiano,
   per te: *Aggiornato il CV*, *Aggiunto progetto Sgardaphonik*.
4. **Commit to main** → in alto **Push origin**.

Il sito si aggiorna da solo in **circa un minuto**.

> **Se non vedi le modifiche**, il browser ti sta mostrando la copia vecchia.
> Ricarica tenendo premuto `Ctrl` + `F5`.

**La rete di salvataggio:** ogni *commit* è una fotografia del sito. Su GitHub,
nella scheda **Commits**, c'è tutta la storia e puoi tornare a qualsiasi
versione precedente. Se un giorno rompi qualcosa e non capisci cosa, non hai
perso niente.

---

## 8. Se qualcosa non va

**Pagina bianca o nera, niente modello 3D.**
Nove volte su dieci è un nome di file scritto con maiuscole diverse. Il tuo
computer non distingue `Foto.webp` da `foto.webp`, **GitHub sì**. Apri il sito
pubblicato, premi `F12` → scheda **Console**: gli errori in rosso ti dicono
quale file non si trova. (Al momento della pubblicazione tutti i 29 percorsi
del sito sono stati verificati uno per uno: se compare un errore così, è
arrivato con una modifica successiva.)

**"404 — There isn't a GitHub Pages site here".**
O Pages non è acceso (punto 5), o il repository è privato, o `index.html` non
è nella radice: apri il repository su GitHub e guarda se `index.html` si vede
subito nell'elenco dei file o se è dentro una cartella.

**Il sito si vede ma le immagini no.**
Stessa causa del primo caso: maiuscole o percorso. Ricordati che le cartelle
sono `webp/` e `WebP_Progetti/`, con quelle maiuscole esatte.

**Il video non parte sul telefono con la rete dati.**
Sono 11 MB: con una connessione lenta ci mette. È normale e non è un errore.

**Ho spinto una versione rotta.**
GitHub Desktop → menu `Repository` → *History*: trovi il commit precedente,
clic destro → *Revert changes in commit*, poi **Push origin**.

---

## 9. Facoltativo: un indirizzo tutto tuo

Se un domani vuoi `www.samuelemarini.it` invece di
`samuelemarini.github.io`:

1. Compri il dominio (Namecheap, Aruba, Register.it: 10–15 € l'anno).
2. Nel pannello del dominio imposti i record DNS che GitHub indica in
   *Settings → Pages → Custom domain*.
3. Scrivi il dominio in quel campo e spunti **Enforce HTTPS**.

L'hosting resta gratuito: paghi solo il nome. Non c'è nessuna fretta — si può
fare in qualsiasi momento senza rifare niente, e i vecchi indirizzi
continuano a funzionare.

---

*Ultimo aggiornamento della guida: settembre 2026.*
