/* ==========================================================================
   PAGINA PROGETTO
   --------------------------------------------------------------------------
   Un unico livello (#project) che si riempie al momento dell'apertura con il
   progetto scelto. I contenuti arrivano da js/data/project-pages.js; il
   titolo da js/data/projects.js.

   DESKTOP  il livello occupa la stessa colonna della galleria del Portfolio,
            con il modello 3D e il menu che restano al loro posto.
   MOBILE   il livello copre tutto lo schermo, su fondo nero, senza modello.
   La differenza è tutta nel CSS (css/project.css): il DOM è lo stesso.

   CARICAMENTO SU RICHIESTA
   Nessuna immagine di progetto esiste nella pagina finché il progetto non
   viene aperto: gli elementi <img> si creano in render(), quindi è lì che
   partono i download. All'apertura si scaricano solo l'immagine grande e le
   miniature (file piccoli, WebP_Progetti/miniature/); la versione grande di
   un'altra immagine parte solo quando la si sceglie. Riaprendo lo stesso
   progetto il DOM non si ricostruisce e niente si riscarica.
   Il video non scarica nulla finché il progetto non si apre (preload="none");
   all'apertura parte da solo.
   ========================================================================== */

import { pages } from './data/project-pages.js';

/* Proporzioni dei segnaposto: le stesse tre forme della galleria. */
const SHAPES = { landscape: 3 / 2, square: 1, portrait: 2 / 3 };

/* Il riquadro principale dei progetti normali è 3:2, il formato orizzontale
   della galleria: un'immagine orizzontale lo riempie tutto, una quadrata o
   verticale ci sta intera con il nero ai lati. Mai tagli, mai deformazioni. */
const STAGE_RATIO = 3 / 2;

/* MUSEO PAGANI — le proporzioni della coppia desktop + mobile.
   Misurate sulla tavola: riquadro desktop 406x253, mobile 60x255.
   Le schermate sono pagine intere, molto più alte del riquadro: se ne mostra
   la parte alta, come sulla tavola. Una schermata che nel riquadro ci sta
   quasi (un popup, una pagina corta) si vede invece intera, allineata in
   alto: tagliarla le farebbe perdere il fondo. Il confine è LONG_PAGE: si
   taglia solo se la schermata è più alta del riquadro di oltre un quarto.
   Le miniature mostrano sempre la parte alta. */
const PAIR_DESKTOP_RATIO = 1.6;
const PAIR_MOBILE_RATIO = 0.235;
const PAIR_THUMB_RATIO = 1.15;
const LONG_PAGE = 0.8;

/* Proporzione predefinita di un video, se i dati non la dichiarano. */
const VIDEO_RATIO = 16 / 9;

/* Dopo quanto spariscono i controlli, mentre il film va. */
const CONTROLS_IDLE_MS = 2000;

/* Aprendo un progetto il modello gira di pochissimo, e chiudendo torna
   indietro: è un cenno, non un'animazione — il movimento vero è la scheda che
   entra. Il numero è in pixel di gesto, la stessa unità con cui lo gira il
   dito o il mouse: 28 px valgono meno di dieci gradi. */
const PIVOT_TURN = 28;

/* Chiusura col dito (telefono): quanto del viaggio serve perché, lasciando,
   il progetto si chiuda invece di tornare aperto. */
const PAGE_SNAP = 0.35;
const PAGE_FLICK = 0.45; // px/ms: un colpetto veloce decide comunque
const PAGE_AXIS = 8; // pixel prima di decidere l'asse del gesto

const MOBILE_QUERY = '(max-width: 899px)';
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/* I segni dei controlli video: linee, come il triangolo del sito.
   Colore e spessore li mette il CSS (currentColor), così restano coerenti. */
const PLAY_ICON = '<path d="M 7.5 4.5 L 19 12 L 7.5 19.5 Z" stroke-linejoin="round" />';
const PAUSE_ICON = '<path d="M 9.5 5 V 19 M 14.5 5 V 19" stroke-linecap="round" />';
const VOLUME_ICON =
  '<path d="M 4 9.5 H 7.5 L 12 5.5 V 18.5 L 7.5 14.5 H 4 Z" stroke-linejoin="round" />' +
  '<path d="M 15.5 9 A 4.5 4.5 0 0 1 15.5 15" stroke-linecap="round" />';
const MUTED_ICON =
  '<path d="M 4 9.5 H 7.5 L 12 5.5 V 18.5 L 7.5 14.5 H 4 Z" stroke-linejoin="round" />' +
  '<path d="M 16 9.5 L 20.5 14.5 M 20.5 9.5 L 16 14.5" stroke-linecap="round" />';
const FULL_ICON =
  '<path d="M 4 9 V 4 H 9 M 15 4 H 20 V 9 M 20 15 V 20 H 15 M 9 20 H 4 V 15" ' +
  'stroke-linecap="round" stroke-linejoin="round" />';

/* Durata della dissolvenza fra un'immagine e l'altra. Breve: si sta
   scegliendo una vista, non cambiando pagina. */
const SWAP_MS = 220;

/* `scene` serve solo al cenno del modello quando la scheda entra ed esce.
   Senza, la pagina si apre lo stesso. */
export function createProjectView(root, { scene = null } = {}) {
  if (!root) return nullView();

  root.innerHTML = `
    <div class="pv__scroller">
      <div class="pv__column">
        <header class="pv__head">
          <button class="pv__back" type="button" aria-label="Torna al portfolio">
            <svg viewBox="0 0 17 18" aria-hidden="true">
              <path d="M 15.5 1.5 L 1.5 9 L 15.5 16.5 Z" />
            </svg>
          </button>
          <h2 class="pv__title"></h2>
        </header>
        <div class="pv__stage"></div>
        <ul class="pv__thumbs"></ul>
        <div class="pv__text"></div>
        <div class="pv__info"></div>
      </div>
    </div>`;

  const scroller = root.querySelector('.pv__scroller');
  const titleEl = root.querySelector('.pv__title');
  const stage = root.querySelector('.pv__stage');
  const thumbs = root.querySelector('.pv__thumbs');
  const textEl = root.querySelector('.pv__text');
  const infoEl = root.querySelector('.pv__info');
  const back = root.querySelector('.pv__back');

  const sectionsEl = document.getElementById('sections');
  const stageEl = document.getElementById('stage');
  const mobile = window.matchMedia(MOBILE_QUERY);

  let isOpen = false;
  let current = null; // { slug, page, order, frames }
  let opener = null; // la miniatura della galleria da cui si è entrati
  let pageDrag = null; // la chiusura col dito, in corso

  root.inert = true;
  back.addEventListener('click', () => close());
  document.addEventListener('keydown', (event) => {
    if (isOpen && event.key === 'Escape') close();
  });

  /* Sulla finestra e non sul livello del progetto: il dito può uscire
     dall'elemento — o alzarsi mentre la pagina sta già girando — e la fine
     del gesto non deve andare persa, altrimenti la posa resterebbe appesa
     a metà strada.

     `passive: false` solo sul movimento, ed è necessario: senza poter dire
     "questo gesto è mio" il browser prende lo swipe orizzontale per il
     proprio "torna indietro" e la pagina si ricarica a metà animazione.
     Si chiama preventDefault SOLO a trascinamento avviato: lo scorrimento
     verticale del progetto resta quello nativo, veloce come sempre. */
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  /* ======================================================================
     APERTURA E CHIUSURA
     ====================================================================== */
  function open(project, from) {
    const slug = project.slug;
    if (!current || current.slug !== slug) render(project);

    opener = from || null;
    scroller.scrollTop = 0;
    isOpen = true;
    endPageDrag(); // niente pose rimaste a metà da un gesto interrotto
    setStackOrigin();
    root.inert = false;
    root.classList.add('is-open');
    document.body.classList.add('project-open');
    // Sotto, la pagina si ferma: rotella e dito sono tutti del progetto.
    document.documentElement.classList.add('project-open');
    turnPivot(1); // il cenno del modello, mentre la scheda si posa sopra
    startMovie();
    // Il fuoco va al triangolo: da tastiera si può tornare subito indietro.
    back.focus({ preventScroll: true });
  }

  /* IL FILM PARTE DA SOLO.
     Chi apre un progetto che è un video vuole vedere il video, non cercare il
     tasto play. La chiamata parte dentro al clic che ha aperto la pagina,
     quindi per il browser è una riproduzione voluta e l'audio c'è.
     Se però il browser non è d'accordo — su iPhone, o con l'audio bloccato
     nelle impostazioni — invece di non partire si parte MUTI: il film si
     vede lo stesso e il volume è a un tocco. Il segno del volume si aggiorna
     da sé, perché legge il video (vedi `volumechange` in movie()). */
  function startMovie() {
    const video = root.querySelector('video');
    if (!video) return;
    const attempt = video.play();
    if (!attempt || !attempt.catch) return;
    attempt.catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  /* DOVE ARRETRA LA SCHEDA DI SOTTO.
     Su telefono #sections è fisso e grande quanto lo schermo: il suo centro è
     il centro di quello che si guarda, e basta il 50% del CSS. Su desktop no
     — è lungo tutto il documento, quattro schermate — e rimpicciolirlo
     attorno al suo centro farebbe scorrere il contenuto in verticale mentre
     arretra. L'origine va quindi messa dove sta l'occhio: al centro della
     finestra, scritto in coordinate dell'elemento. Si calcola all'apertura,
     quando lo scorrimento si ferma, e resta valida per tutta la transizione. */
  function setStackOrigin() {
    if (!sectionsEl) return;
    const y = mobile.matches
      ? '50%'
      : `${Math.round(window.scrollY + window.innerHeight / 2)}px`;
    sectionsEl.style.transformOrigin = `50% ${y}`;
  }

  /* Il modello gira di PIVOT_TURN aprendo e torna indietro chiudendo. Si usa
     la stessa strada del dito e del mouse — nessun canale in più verso la
     scena, quindi niente che possa litigare con la rotazione dell'utente. */
  function turnPivot(amount) {
    if (scene) scene.applyPointerDelta(PIVOT_TURN * amount, 0);
  }

  /* `turn` è falso solo quando il modello l'ha già girato il dito, chiudendo
     con lo swipe: lì la rotazione è arrivata a destinazione strada facendo. */
  function close(turn = true) {
    if (!isOpen) return;
    isOpen = false;
    pauseVideos(root); // un video non deve continuare a suonare fuori pagina
    root.classList.remove('is-open');
    document.body.classList.remove('project-open');
    document.documentElement.classList.remove('project-open');
    root.inert = true;
    if (turn) turnPivot(-1);
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  /* ======================================================================
     CHIUDERE COL DITO (telefono)
     ----------------------------------------------------------------------
     Uno swipe da sinistra verso destra riporta indietro la pagina, e lo fa
     SEGUENDO IL DITO: la stessa animazione dell'apertura, al contrario e
     sotto controllo. A metà strada ci si può fermare, tornare indietro e
     restare nel progetto. Al rilascio la posa si assesta da una parte o
     dall'altra, come i pannelli del sito.
     ====================================================================== */
  function onTouchStart(event) {
    if (!isOpen || !mobile.matches || event.touches.length !== 1) {
      pageDrag = null;
      return;
    }
    const t = event.touches[0];
    pageDrag = {
      x: t.clientX,
      y: t.clientY,
      time: performance.now(),
      axis: null,
      active: false,
      p: 0,
    };
  }

  function onTouchMove(event) {
    if (!pageDrag || event.touches.length !== 1) return;
    const t = event.touches[0];
    const dx = t.clientX - pageDrag.x;
    const dy = t.clientY - pageDrag.y;

    /* L'asse si decide una volta sola: verticale vuol dire scorrere la
       pagina del progetto, e quello lo fa il browser. */
    if (!pageDrag.axis && Math.hypot(dx, dy) >= PAGE_AXIS) {
      pageDrag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (pageDrag.axis === 'x' && dx > 0) {
        pageDrag.active = true;
        document.body.classList.add('page-dragging');
      }
    }

    if (!pageDrag.active) return;
    // Il gesto è nostro: il browser non deve farci sopra il "torna indietro".
    if (event.cancelable) event.preventDefault();
    applyPage(clamp01(dx / Math.max(1, window.innerWidth)));
  }

  function onTouchEnd() {
    const current = pageDrag;
    pageDrag = null;
    if (!current || !current.active) return;

    const elapsed = Math.max(1, performance.now() - current.time);
    const speed = (current.p * window.innerWidth) / elapsed;
    const commit = current.p > PAGE_SNAP || speed > PAGE_FLICK;

    // Il resto della rotazione del modello: fino in fondo, o di nuovo a zero.
    turnPivot(commit ? -(1 - current.p) : current.p);

    /* Prima si riaccendono le transizioni, poi si tolgono le pose scritte a
       mano: il browser interpola da dove sta il dito alla posa finale. */
    endPageDrag();
    if (commit) close(false);
  }

  function endPageDrag() {
    pageDrag = null;
    document.body.classList.remove('page-dragging');
    clearPagePose();
  }

  /* La posa a metà strada: `p` va da 0 (progetto aperto) a 1 (progetto
     chiuso, sito di nuovo in campo). Sono gli stessi numeri del CSS —
     scheda che scorre, sito che torna avanti e si riaccende, modello che
     rientra da sinistra — solo che qui il punto del viaggio lo dice il dito
     invece dell'orologio. Chi li cambia li cambi in tutti e due i posti. */
  function applyPage(p) {
    const previous = pageDrag.p;
    pageDrag.p = p;
    turnPivot(-(p - previous)); // il modello torna indietro insieme al dito

    const k = 1 - p; // quanto è ancora aperto il progetto
    /* La scheda di sotto si riaccende PRIMA di metà strada: sta lì sotto,
       quindi appena quella sopra si sposta deve già vedersi. Altrimenti il
       dito sembra scoprire del nero e non la galleria. Le posizioni invece
       seguono il dito una a uno: quelle sono spazio, non luce. */
    const light = clamp01(p / 0.55).toFixed(3);
    root.style.transform = `translateX(${(100 * p).toFixed(2)}%)`;

    if (sectionsEl) {
      sectionsEl.style.transform = `translateX(${(-3 * k).toFixed(2)}%) scale(${(1 - 0.06 * k).toFixed(4)})`;
      sectionsEl.style.opacity = light;
    }
    if (stageEl) {
      stageEl.style.transform = `translateX(${(-45 * k).toFixed(2)}%)`;
      stageEl.style.opacity = light;
    }
  }

  function clearPagePose() {
    root.style.transform = '';
    root.style.opacity = '';
    if (sectionsEl) {
      sectionsEl.style.transform = '';
      sectionsEl.style.opacity = '';
    }
    if (stageEl) {
      stageEl.style.transform = '';
      stageEl.style.opacity = '';
    }
  }

  /* ======================================================================
     COSTRUZIONE DELLA PAGINA
     ====================================================================== */
  function render(project) {
    const page = pages[project.slug] || fallbackPage(project);
    const pairs = !!page.pairs;

    titleEl.textContent = project.title;

    // order[0] è l'immagine grande, le altre sono le miniature nell'ordine.
    const order = page.images.map((_, i) => i);

    stage.replaceChildren();
    stage.classList.toggle('pv__stage--pair', pairs);

    /* I "telai": i riquadri che ricevono le immagini. Uno per i progetti
       normali, due per il Museo Pagani (desktop e mobile affiancati). */
    const frames = pairs
      ? {
          desktop: makeFrame(PAIR_DESKTOP_RATIO),
          mobile: makeFrame(PAIR_MOBILE_RATIO),
        }
      : { main: makeFrame(STAGE_RATIO) };
    Object.values(frames).forEach((f) => stage.appendChild(f));

    current = { slug: project.slug, title: project.title, page, order, frames, pairs };

    showMain(page.images[order[0]], true);
    renderThumbs();
    renderText(page.text);
    renderInfo(page.info);
  }

  function makeFrame(ratio) {
    const frame = document.createElement('div');
    frame.className = 'pv__frame';
    frame.style.setProperty('--fr', String(ratio));
    return frame;
  }

  /* ======================================================================
     IMMAGINE GRANDE
     ====================================================================== */
  function showMain(item, instant) {
    const { frames, pairs } = current;
    const alt = altText(item);
    if (pairs) {
      const D = PAIR_DESKTOP_RATIO;
      /* Il riquadro della versione mobile è stretto come sulla tavola, ma una
         schermata che nel riquadro ci sta tutta (lo store, che è corto) può
         dichiarare la propria proporzione: così riempie il riquadro e arriva
         alla stessa altezza della sua versione desktop, invece di restare
         più bassa. Vedi `mobileRatio` in js/data/project-pages.js. */
      const M = item.mobileRatio || PAIR_MOBILE_RATIO;
      frames.mobile.style.setProperty('--fr', String(M));
      swap(frames.desktop, visual(picture(item.src, { alt: `${alt}, versione desktop`, screen: D }), D, D), instant);
      swap(frames.mobile, visual(picture(item.mobile, { alt: `${alt}, versione mobile`, screen: M }), M, M), instant);
    } else if (item.video) {
      swap(frames.main, visual(movie(item, alt), item.ratio || VIDEO_RATIO, STAGE_RATIO), instant);
    } else {
      const r = item.src ? STAGE_RATIO : shapeRatio(item);
      swap(frames.main, visual(picture(item.src, { alt }), r, STAGE_RATIO), instant);
    }
  }

  /* Il testo alternativo: quello scritto nei dati, se c'è; altrimenti il
     titolo del progetto con la posizione dell'immagine nella serie. */
  function altText(item) {
    if (item.alt) return item.alt;
    const { title, page } = current;
    const n = page.images.length;
    return n > 1 ? `${title}, immagine ${page.images.indexOf(item) + 1} di ${n}` : title;
  }

  /* Il nuovo contenuto entra sopra il vecchio e compare quando è pronto:
     niente fotogrammi vuoti mentre l'immagine si decodifica, niente scatti. */
  function swap(frame, next, instant) {
    const old = Array.from(frame.children);
    old.forEach(pauseVideos);
    if (instant) {
      frame.replaceChildren(next);
      return;
    }
    next.classList.add('is-entering');
    frame.appendChild(next);
    ready(next).then(() => {
      requestAnimationFrame(() => {
        next.classList.remove('is-entering');
        old.forEach((el) => el.classList.add('is-leaving'));
        setTimeout(() => old.forEach((el) => el.remove()), SWAP_MS + 40);
      });
    });
  }

  function ready(el) {
    const img = el.querySelector('img');
    if (!img) return Promise.resolve();
    return img.decode().catch(() => {});
  }

  /* ======================================================================
     MINIATURE
     ----------------------------------------------------------------------
     Toccandone una, lei e l'immagine grande si scambiano di posto: la
     miniatura prende quella che era grande, tutte le altre restano ferme.
     È il cambiamento più piccolo possibile, e si legge come una scelta.
     ====================================================================== */
  function renderThumbs() {
    // Le celle sono quadrate; per il Museo Pagani hanno la forma delle sue
    // miniature, così la fila combacia con l'immagine grande senza vuoti.
    thumbs.style.setProperty('--cell', String(current.pairs ? PAIR_THUMB_RATIO : 1));
    thumbs.replaceChildren(
      ...current.order.slice(1).map((imgIndex, slot) => thumbItem(imgIndex, slot + 1))
    );
  }

  function thumbItem(imgIndex, slot) {
    const { page, pairs } = current;
    const item = page.images[imgIndex];
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pv__thumb';
    button.setAttribute('aria-label', `Mostra l'immagine ${imgIndex + 1} di ${page.images.length}`);

    // La miniatura usa il file piccolo; se manca, quello grande.
    const src = item.video ? item.poster : item.thumb || item.src;
    const opts = { fallback: item.src, cover: pairs };
    const inner = pairs
      ? visual(picture(src, opts), PAIR_THUMB_RATIO, PAIR_THUMB_RATIO)
      : visual(picture(src, opts), src ? 1 : shapeRatio(item), 1);
    button.appendChild(inner);
    button.addEventListener('click', () => select(slot));
    li.appendChild(button);
    return li;
  }

  function select(slot) {
    const { order } = current;
    [order[0], order[slot]] = [order[slot], order[0]];
    showMain(current.page.images[order[0]], false);
    // Si ricostruisce solo la miniatura scambiata, le altre non si toccano.
    const li = thumbs.children[slot - 1];
    if (li) li.replaceWith(thumbItem(order[slot], slot));
    const focusTo = thumbs.children[slot - 1];
    if (focusTo) focusTo.querySelector('button').focus({ preventScroll: true });
  }

  /* ======================================================================
     IL CONTENUTO VISIVO DI UN TELAIO
     ----------------------------------------------------------------------
     Un riquadro di proporzione `r` adattato (senza tagli) al telaio di
     proporzione `fr`, con dentro l'immagine, il video o — se `content` è
     null — il segnaposto rosso.
     ====================================================================== */
  function visual(content, r, fr) {
    const wrap = document.createElement('div');
    wrap.className = 'pv__visual';
    const box = document.createElement('div');
    box.className = content ? 'pv__box' : 'pv__box pv__box--placeholder';
    box.style.setProperty('--r', String(r));
    box.style.setProperty('--fr', String(fr));
    if (content) box.appendChild(content);
    wrap.appendChild(box);
    return wrap;
  }

  /* Un'immagine. Senza opzioni sta intera nel riquadro, col nero attorno.
       cover     riempie il riquadro tenendo la parte alta (miniature Pagani)
       screen    schermata di un sito nel riquadro di proporzione indicata:
                 parte alta se è una pagina lunga, intera se no (LONG_PAGE)
       fallback  file da usare se `src` non si carica (miniatura mancante)
     Restituisce null senza `src`: il riquadro diventa un segnaposto. */
  function picture(src, { alt = '', cover = false, screen = 0, fallback = null } = {}) {
    if (!src) return null;
    const img = document.createElement('img');
    img.alt = alt;
    img.decoding = 'async';
    if (cover) img.classList.add('is-cover-top');
    if (screen) {
      img.addEventListener('load', () => {
        const long = img.naturalWidth / img.naturalHeight < screen * LONG_PAGE;
        img.classList.toggle('is-cover-top', long);
        img.classList.toggle('is-contain-top', !long);
      });
    }
    if (fallback && fallback !== src) {
      img.addEventListener('error', () => { img.src = fallback; }, { once: true });
    }
    img.src = src;
    return img;
  }

  /* IL VIDEO — quattro controlli, non uno di più.
     Quelli del browser si portano dietro scarica, velocità di riproduzione e
     picture-in-picture, e mostrano la durata: roba che qui non serve. Restano
     play/pausa (al centro dell'immagine, e si ottiene anche toccando il
     video), volume, avanzamento e schermo intero. I segni sono in
     `difference` come il triangolo del sito: bianchi sul nero, scuri sulle
     parti chiare.

     preload="none": finché il progetto non si apre non si scarica niente, si
     vede solo il poster. All'apertura il filmato parte da solo e va a ciclo
     continuo (vedi startMovie). */
  function movie(item, alt) {
    const wrap = document.createElement('div');
    wrap.className = 'pv__player';

    const video = document.createElement('video');
    video.preload = 'none';
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-label', alt);
    /* Anche nel menu del tasto destro e nei controlli di sistema: niente
       scarica, niente velocità di riproduzione, niente picture-in-picture. */
    video.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
    video.disablePictureInPicture = true;
    if (item.poster) video.poster = item.poster;
    const source = document.createElement('source');
    source.src = item.video;
    source.type = 'video/mp4';
    video.appendChild(source);

    /* La barra ha due righe: sopra i pulsanti — volume a sinistra, schermo
       intero a destra — e sotto, per conto suo, l'avanzamento. */
    const play = iconButton('pv__play', 'Riproduci', PLAY_ICON);
    const bar = document.createElement('div');
    bar.className = 'pv__bar';
    const row = document.createElement('div');
    row.className = 'pv__row';
    const volumeGroup = document.createElement('div');
    volumeGroup.className = 'pv__volume-group';
    const mute = iconButton('pv__mute', 'Volume', VOLUME_ICON);
    const volume = range('pv__volume', 'Volume', 1);
    volumeGroup.append(mute, volume);
    const full = iconButton('pv__full', 'Schermo intero', FULL_ICON);
    const seek = range('pv__seek', 'Avanzamento', 0);
    row.append(volumeGroup, full);
    bar.append(row, seek);
    wrap.append(video, play, bar);

    const toggle = () => (video.paused ? video.play().catch(() => {}) : video.pause());
    play.addEventListener('click', toggle);
    video.addEventListener('click', toggle);

    /* MENTRE IL FILM VA, I CONTROLLI SPARISCONO dopo due secondi: restano
       solo le immagini. Tornano appena il puntatore si muove o si tocca lo
       schermo, e in pausa ci sono sempre. */
    let idle = 0;
    const wake = () => {
      clearTimeout(idle);
      wrap.classList.remove('is-idle');
      if (!video.paused) idle = setTimeout(() => wrap.classList.add('is-idle'), CONTROLS_IDLE_MS);
    };
    wrap.addEventListener('pointermove', wake);
    wrap.addEventListener('pointerdown', wake);
    wrap.addEventListener('focusin', wake);

    video.addEventListener('play', () => {
      play.setAttribute('aria-label', 'Metti in pausa');
      play.querySelector('svg').innerHTML = PAUSE_ICON;
      wake();
    });
    video.addEventListener('pause', () => {
      clearTimeout(idle);
      wrap.classList.remove('is-idle');
      play.setAttribute('aria-label', 'Riproduci');
      play.querySelector('svg').innerHTML = PLAY_ICON;
    });

    // L'avanzamento: `timeupdate` arriva quattro volte al secondo, non serve
    // un'animazione a ogni fotogramma.
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      seek.value = String((video.currentTime / video.duration) * 100);
    });
    seek.addEventListener('input', () => {
      if (video.duration) video.currentTime = (Number(seek.value) / 100) * video.duration;
    });

    /* IL CURSORE DEL VOLUME SI APRE SOLO SE LO SI CHIEDE.
       Un clic (o un tocco) sul segno del volume lo mostra; un altro lo
       richiude. Non si apre passandoci sopra col mouse e, da chiuso, non
       occupa spazio nella barra. */
    volume.addEventListener('input', () => {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
    });

    /* Il segno e il cursore leggono SEMPRE il video, non il contrario: così
       sono giusti anche quando a zittire non è stato il dito — per esempio
       quando il film parte da solo e il browser pretende che parta muto. */
    video.addEventListener('volumechange', () => {
      mute.querySelector('svg').innerHTML = video.muted ? MUTED_ICON : VOLUME_ICON;
      volume.value = String(video.muted ? 0 : video.volume);
    });
    mute.addEventListener('click', () => {
      const open = volumeGroup.classList.toggle('is-open');
      mute.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) volume.focus({ preventScroll: true });
    });
    mute.setAttribute('aria-expanded', 'false');

    full.addEventListener('click', () => {
      const open = document.fullscreenElement || document.webkitFullscreenElement;
      if (open) document.exitFullscreen();
      else if (wrap.requestFullscreen) wrap.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
    });

    return wrap;
  }

  function iconButton(className, label, markup) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${markup}</svg>`;
    return button;
  }

  function range(className, label, value) {
    const input = document.createElement('input');
    input.type = 'range';
    input.className = className;
    input.min = '0';
    input.max = className === 'pv__volume' ? '1' : '100';
    input.step = className === 'pv__volume' ? '0.05' : '0.1';
    input.value = String(value);
    input.setAttribute('aria-label', label);
    return input;
  }

  function shapeRatio(item) {
    return SHAPES[item.shape] || SHAPES.landscape;
  }

  /* ======================================================================
     TESTO E INFORMAZIONI
     ====================================================================== */
  function renderText(paragraphs) {
    textEl.replaceChildren(
      ...(paragraphs || []).filter(Boolean).map((t) => {
        const p = document.createElement('p');
        p.textContent = t;
        return p;
      })
    );
  }

  /* Tre colonne sul desktop, due sul telefono: la disposizione è del CSS,
     qui si costruiscono solo i tre gruppi. Le voci vuote non compaiono. */
  function renderInfo(info) {
    infoEl.replaceChildren();
    if (!info) return;

    const lab = document.createElement('div');
    lab.className = 'pv__info-lab';
    lab.textContent = info.lab || '';

    const people = group('pv__info-col pv__info-col--people', info.people);
    const technical = group('pv__info-col pv__info-col--technical', info.technical);

    const hasAny = info.lab || people.childElementCount || technical.childElementCount;
    if (!hasAny) return;
    infoEl.append(lab, people, technical);
  }

  function group(className, entries) {
    const col = document.createElement('dl');
    col.className = className;
    (entries || [])
      .filter((e) => e && e.label && e.value)
      .forEach((e) => {
        const item = document.createElement('div');
        item.className = 'pv__info-item';
        const dt = document.createElement('dt');
        dt.textContent = e.label; // il maiuscolo lo mette il CSS
        const dd = document.createElement('dd');
        dd.textContent = e.value;
        item.append(dt, dd);
        col.appendChild(item);
      });
    return col;
  }

  /* Un progetto senza pagina nei dati mostra comunque la sua immagine. */
  function fallbackPage(project) {
    return { images: [{ src: project.image }], text: [], info: null };
  }

  /* PRECARICO IN SECONDO PIANO.
     Quando il sito è pronto e il browser non ha più niente da fare, si
     portano avanti le PRIME immagini dei progetti: una per volta, a priorità
     bassa, così aprire un progetto è immediato. Solo quelle: le miniature e
     le altre immagini restano al loro momento, cioè all'apertura.
     Con la connessione a risparmio dati o lenta non parte niente. */
  function prefetch() {
    const link = navigator.connection;
    if (link && (link.saveData || /(^|-)2g$/.test(link.effectiveType || ''))) return;

    const queue = Object.values(pages)
      .map((page) => page.images && page.images[0])
      .filter((item) => item && item.src)
      .map((item) => item.src);

    const idle = window.requestIdleCallback
      ? (fn) => window.requestIdleCallback(fn, { timeout: 4000 })
      : (fn) => setTimeout(fn, 300);

    const next = () => {
      const src = queue.shift();
      if (!src) return;
      const img = new Image();
      img.fetchPriority = 'low';
      img.decoding = 'async';
      img.addEventListener('load', () => idle(next), { once: true });
      img.addEventListener('error', () => idle(next), { once: true });
      img.src = src;
    };
    idle(next);
  }

  return {
    open,
    close,
    prefetch,
    isOpen: () => isOpen,
  };
}

function pauseVideos(el) {
  el.querySelectorAll('video').forEach((v) => v.pause());
}

function nullView() {
  return { open() {}, close() {}, prefetch() {}, isOpen: () => false };
}
