/* ==========================================================================
   NAVIGAZIONE
   --------------------------------------------------------------------------
   DUE SISTEMI DIVERSI, E LA DIFFERENZA È VOLUTA.

   DESKTOP — un unico documento che scorre. Le quattro sezioni stanno una
   sotto l'altra e a scorrere è il browser: rotella, trackpad, frecce, barra
   spaziatrice. Si scorre da qualunque punto dello schermo, anche sopra al
   modello 3D, che sta su un livello fisso e non riceve eventi.

   Il menu passa dalla posa grande a quella piccola LEGATO ALLO SCORRIMENTO:
   scorri un decimo, il menu è a un decimo del suo viaggio; ti fermi a metà,
   resta a metà. Non è un'animazione che parte e finisce per conto suo.

   MOBILE — schede. Le quattro sezioni sono livelli sovrapposti e se ne vede
   una per volta; il passaggio segue il dito e al rilascio si assesta. Su uno
   schermo piccolo questo dà il controllo che serve: il modello 3D resta
   governabile e ogni composizione si legge intera.

   IL MODELLO 3D. Su desktop ogni sezione ha il suo corridoio fra il menu e la
   colonna del contenuto, e il modello ci scivola dentro cambiando sezione:
   più a destra su Home e Contatti (menu grande, colonna stretta), più a
   sinistra su Portfolio e CV, che condividono lo stesso identico valore.
   Su telefono invece la posizione è una sola per tutte le sezioni.
   ========================================================================== */

const MOBILE_QUERY = '(max-width: 899px)';

/* Quanto nero deve restare fra la sagoma del modello, il menu e la colonna
   del contenuto, su desktop. */
const MODEL_CLEARANCE = 20;

/* DESKTOP — Portfolio e CV: quanto il modello arretra rispetto al centro del
   corridoio, e di quanto poi si riavvicina al contenuto. Lì il menu è piccolo
   e la colonna più larga: al centro esatto il modello starebbe troppo addosso
   alla griglia. Home e Contatti non sono toccati. */
const DESKTOP_COMPACT_SHIFT = 0.045; // frazione della larghezza viewport
const DESKTOP_COMPACT_NUDGE = 0.02;

/* MOBILE — posizione del centro del modello, in frazioni di larghezza.
   Una sola per tutte le sezioni: è quella del Portfolio, dove la griglia
   comincia al 47% e il modello le lascia campo. */
const MOBILE_CENTER_MENU = 1.028; // pannello 0: si vede il fianco del modello
const MOBILE_CENTER_REST = -0.48; // pannello 1: ovunque la stessa

/* Quanto il menu deve uscire OLTRE la propria larghezza per sparire davvero.
   La voce attiva è in corsivo, e il corsivo sborda dalla scatola del testo:
   senza questo margine restava visibile il puntino della "i" di Contatti. */
const MENU_HIDE_EXTRA = 16;

/* Gesti (mobile). */
const DRAG_MIN = 8; // pixel prima di decidere l'asse del gesto
const DRAG_SNAP = 0.3; // frazione oltre la quale il gesto si assesta avanti
const FLICK_MIN = 24; // pixel minimi perché un colpetto conti
const FLICK_VELOCITY = 0.4; // pixel al millisecondo: sopra, il gesto è deciso
const SWIPE_MIN = 45;
const SWIPE_MAX_TIME = 800;
const SWIPE_AXIS_BIAS = 1.3;

/* ROTAZIONE COL DITO — un filo più reattiva ai gesti veloci.
   Il guadagno cresce con la velocità del dito e si ferma a +60%: un gesto
   lento resta preciso come prima, uno veloce gira di più.
   SOLO TELEFONO: la rotazione orizzontale è più ampia (MOBILE_SPIN_GAIN) e,
   lasciando il dito in corsa, il modello prosegue per inerzia. Se il dito si
   ferma prima di staccarsi (FLING_HOLD_MS), il modello si ferma con lui. */
const TOUCH_FAST = 1.4; // px/ms: da qui in su il gesto è "veloce"
const TOUCH_BOOST = 0.6; // guadagno massimo aggiunto
const MOBILE_SPIN_GAIN = 1.35; // quanto gira in più sul telefono
const FLING_HOLD_MS = 60; // dito fermo da più di così: niente inerzia
const TOGGLE_SPIN = Math.PI * 2; // il giro del triangolo: uno completo

function readDuration(name, fallback) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith('ms') ? n : n * 1000;
}

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/* `project` è la pagina progetto (js/project.js): mentre è aperta il menu la
   chiude prima di portare altrove. */
const NO_PROJECT = { isOpen: () => false, close() {} };

export function createNavigation({ scene, project = NO_PROJECT }) {
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('panel-toggle');
  const toggleSvg = toggle ? toggle.querySelector('svg') : null;
  const sections = Array.from(document.querySelectorAll('.section'));
  const panes = sections.map((s) => s.querySelector('.section__pane'));
  const links = Array.from(document.querySelectorAll('.menu__link'));
  const ids = sections.map((s) => s.id);
  const galleryPane = document.querySelector('#portfolio .section__pane');

  const mobile = window.matchMedia(MOBILE_QUERY);
  const SECTION_LOCK = readDuration('--dur-section', 380);

  /* Su telefono il CV ha uno stato in più: il testo tutto aperto. È l'unico
     contenuto che non sta nella larghezza dello schermo. */
  const panelCount = Object.fromEntries(
    sections.map((s) => [s.id, s.id === 'cv' ? 3 : 2])
  );

  let index = 0;
  let panel = 1;
  let locked = false; // solo mobile: una transizione per volta
  let menuCompact = false;
  let menuGeom = null; // le due pose del menu, misurate una volta
  let desktopCenters = null; // le posizioni del modello su desktop, per sezione
  let navP = -1; // a che punto è il menu nel suo viaggio (0 grande, 1 piccolo)
  let scrollFrame = 0;
  let resizeFrame = 0;
  let touch = null;
  let drag = null;
  let dragY = null;

  /* --- avvio ------------------------------------------------------------
     Con un'ancora nell'indirizzo (#cv, #contatti) si parte da lì: su desktop
     ci pensa il browser, su telefono si apre direttamente quella scheda. */
  const fromHash = ids.indexOf(location.hash.slice(1));
  if (fromHash >= 0) index = fromHash;
  panel = mobile.matches && fromHash < 0 ? 0 : 1;

  document.body.classList.add('is-booting');
  setMenuLayout(ids[index] === 'portfolio' || ids[index] === 'cv');
  markActiveLink();
  renderSections();
  renderPanel();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('is-booting');
      updateNav(true);
    });
  });

  /* ======================================================================
     QUALE SEZIONE SI STA GUARDANDO (desktop)
     ----------------------------------------------------------------------
     Una riga immaginaria a metà schermo: la sezione che la attraversa è
     quella attiva. Lo decide il browser, quindi durante lo scorrimento non
     gira nessun calcolo nostro.
     ====================================================================== */
  const spy = new IntersectionObserver(
    (entries) => {
      if (mobile.matches) return; // su telefono comanda il gesto
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
      }
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  sections.forEach((section) => spy.observe(section));

  /* --- eventi ----------------------------------------------------------- */
  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      if (project.isOpen()) project.close();
      if (!mobile.matches) return; // desktop: è un'ancora vera, ci porta il browser
      event.preventDefault();
      goToSection(i, 1);
      setPanel(1);
    });
  });

  toggle.addEventListener('click', () => {
    /* Telefono: il passaggio è accompagnato da un giro del modello. Nello
       stesso verso dello swipe che farebbe lo stesso passaggio. */
    if (mobile.matches) scene.spin(panel === 0 ? -TOGGLE_SPIN : TOGGLE_SPIN);
    setPanel(panel === 0 ? 1 : panel - 1);
  });

  // Appena la sagoma esiste davvero, il modello si riposiziona sapendo
  // quanto spazio occupa (vedi desktopCenterPx).
  scene.onReady(() => {
    desktopCenters = null;
    updateModel();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  mobile.addEventListener('change', onBreakpointChange);

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  /* `passive: false` solo sul movimento: quando il dito sta trascinando un
     pannello o una sezione il gesto è nostro e va dichiarato tale, altrimenti
     il browser ci legge sopra il proprio "torna indietro" e la pagina si
     ricarica a metà gesto. Chi scorre e basta non passa di lì: si chiama
     preventDefault SOLO a trascinamento avviato. */
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  if (galleryPane) {
    galleryPane.addEventListener('scroll', onGalleryScroll, { passive: true });
  }

  /* ======================================================================
     IL MENU LEGATO ALLO SCORRIMENTO (desktop)
     ----------------------------------------------------------------------
     `navProgress` dice a che punto è il viaggio: 0 con la Home in campo,
     1 quando il Portfolio ha preso lo schermo, e di nuovo 0 arrivando ai
     Contatti. È una frazione dello scorrimento, non un tempo.

     La posa si compone con `transform`, mai con font-size o top: muovere e
     scalare non costa impaginazione, cambiare corpo del testo sì — e si
     pagherebbe a ogni fotogramma di scorrimento.

     A metà strada il menu cambia variante (le due pose coincidono lì), così
     ai due estremi il testo è disegnato alla sua misura vera e non scalato:
     resta nitido dove si sta fermi.
     ====================================================================== */
  /* I due passaggi del sito, misurati in frazioni di scorrimento:
       away  la Home se ne va e arriva il Portfolio  (0 → 1)
       back  il CV se ne va e arrivano i Contatti    (0 → 1)
     In mezzo — Portfolio e CV — away vale 1 e back 0, e niente si muove. */
  function navProgress() {
    const vh = window.innerHeight;
    const y = window.scrollY;
    const homeEnd = Math.max(1, sections[0].offsetHeight);
    const lastTop = sections[sections.length - 1].offsetTop;
    return {
      away: clamp01(y / homeEnd),
      back: clamp01((y - (lastTop - vh)) / vh),
    };
  }

  function updateNav(force) {
    if (mobile.matches) return;
    const { away, back } = navProgress();
    const p = clamp01(away - back);
    if (!force && Math.abs(p - navP) < 0.002) return;
    navP = p;

    /* IL MODELLO SI MUOVE CON LA ROTELLA, come il menu: la sua posizione è
       una frazione dello scorrimento, non un'animazione che parte dopo.
       Fermandosi a metà strada resta a metà strada.

       Non però istante per istante: l'inseguimento è ammorbidito dalla scena
       (un decimo di secondo scarso). Legandolo di rigido, ogni fotogramma in
       cui il disegno del vetro impiegava più del dovuto si leggeva come uno
       scatto; così invece il movimento resta continuo anche se il browser
       salta un fotogramma, e all'arrivo la posizione è esatta. */
    setModelTarget(desktopCenterFor(away, back));

    if (!menuGeom) measureMenu();
    setMenuLayout(p >= 0.5);

    /* Ferme alle due estremità le voci tornano nude: il testo è disegnato
       alla sua misura vera, nitido, e il passaggio del mouse torna suo. */
    if (p <= 0.002 || p >= 0.998) {
      clearLinkPoses();
      return;
    }

    /* SI INTERPOLA VOCE PER VOCE, non il blocco intero.
       Le due pose non sono l'una la copia in scala dell'altra: il corpo del
       testo cambia di 42/25, l'interlinea di 77/40. Scalando tutto il blocco
       di un solo fattore, a metà strada la posa non tornava e si vedeva uno
       scatto. Così invece la SPAZIATURA viene dalle posizioni interpolate e
       la DIMENSIONE dal rapporto fra i corpi: le due descrizioni coincidono
       sempre, anche nel punto in cui il menu cambia variante. */
    const { hero, compact, ratio } = menuGeom;
    const size = 1 + (1 / ratio - 1) * p; // misura relativa alla posa grande
    const scale = menuCompact ? size * ratio : size;
    const base = menuCompact ? compact : hero;

    /* Il punto fermo di ogni voce è il CENTRO della sua riga, non il bordo
       alto: le due varianti hanno interlinee diverse, e ancorandosi in alto
       il testo saltava di qualche pixel nel momento del cambio. */
    links.forEach((link, i) => {
      const center = hero[i] + (compact[i] - hero[i]) * p;
      link.style.transition = 'none';
      link.style.transform = `translateY(${(center - base[i]).toFixed(2)}px) scale(${scale.toFixed(4)})`;
    });
  }

  function clearLinkPoses() {
    links.forEach((link) => {
      link.style.transform = '';
      link.style.transition = '';
    });
  }

  /* Le due pose si misurano una volta sola, e solo quando cambia
     l'impaginazione: sono letture del DOM che durante lo scorrimento non
     devono succedere mai. */
  function measureMenu() {
    const was = menuCompact;
    clearLinkPoses();

    const middle = (link) => {
      const b = link.getBoundingClientRect();
      return b.top + b.height / 2;
    };

    setMenuLayout(false);
    const heroRect = menu.getBoundingClientRect();
    const heroFont = Number.parseFloat(getComputedStyle(menu).fontSize);
    const hero = links.map(middle);

    setMenuLayout(true);
    const compactRect = menu.getBoundingClientRect();
    const compactFont = Number.parseFloat(getComputedStyle(menu).fontSize);
    const compact = links.map(middle);

    setMenuLayout(was);
    menuGeom = {
      hero,
      compact,
      heroRight: heroRect.right,
      compactRight: compactRect.right,
      ratio: heroFont / compactFont || 1,
    };
  }

  function setMenuLayout(compact) {
    menuCompact = compact;
    menu.classList.toggle('is-compact', compact);
    menu.classList.toggle('is-hero', !compact);
  }

  function markActiveLink() {
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function syncHash() {
    if (location.hash.slice(1) !== ids[index]) {
      history.replaceState(null, '', `#${ids[index]}`);
    }
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateNav();
    });
  }

  /* ======================================================================
     SEZIONI
     ====================================================================== */
  function setActive(next) {
    if (next < 0 || next === index) return;
    index = next;
    markActiveLink();
    syncHash();
    if (mobile.matches && panel > 1) {
      panel = 1;
      renderPanel();
    }
    /* Il modello non si tocca qui: su desktop lo muove lo scorrimento
       (updateNav), su telefono il gesto. Una sorgente per volta. */
  }

  /* Su telefono la sezione la cambia il gesto (o il menu), non lo
     scorrimento: qui si sposta davvero la scheda. */
  function goToSection(next, dir) {
    const clamped = Math.max(0, Math.min(sections.length - 1, next));
    if (clamped === index) return;
    if (project.isOpen()) project.close();
    index = clamped;
    if (panel > 1) panel = 1;
    lock();
    markActiveLink();
    syncHash();
    renderSections();
    renderPanel();
    placeScroll(dir);
  }

  function renderSections() {
    if (!mobile.matches) return;
    sections.forEach((section, i) => {
      section.classList.toggle('is-active', i === index);
      section.classList.toggle('is-above', i < index);
      section.classList.toggle('is-below', i > index);
      section.toggleAttribute('inert', i !== index);
    });
    /* Uscendo dal Portfolio la galleria torna al principio: al rientro il
       modello deve ritrovarsi dov'è disegnato, non dove l'aveva lasciato
       l'ultimo scorrimento. */
    if (galleryPane && ids[index] !== 'portfolio') galleryPane.scrollLeft = 0;
  }

  /* DOVE SI ATTERRA DENTRO UNA SEZIONE (solo mobile).
     Scendendo si entra dall'alto, salendo dal basso: così il movimento resta
     coerente nello spazio e per uscire bisogna riattraversare il contenuto. */
  function placeScroll(dir) {
    const pane = panes[index];
    if (!pane) return;
    const room = Math.max(0, pane.scrollHeight - pane.clientHeight);
    pane.scrollTop = dir < 0 ? room : 0;
  }

  function lock() {
    locked = true;
    setTimeout(() => {
      locked = false;
    }, SECTION_LOCK + 80);
  }

  /* ======================================================================
     PANNELLI (mobile)
       0  MENU          1  contenuto          2  contenuto aperto (solo CV)
     ====================================================================== */
  function setPanel(next) {
    const max = panelCount[ids[index]] - 1;
    const clamped = Math.max(0, Math.min(max, next));
    if (clamped === panel) return;
    panel = clamped;
    lock();
    renderPanel();
  }

  function renderPanel() {
    const p = mobile.matches ? panel : 1;
    document.body.classList.remove('panel-0', 'panel-1', 'panel-2');
    document.body.classList.add(`panel-${p}`);

    toggle.dataset.direction = p === 0 ? 'forward' : 'back';
    toggle.setAttribute(
      'aria-label',
      p === 0 ? 'Entra nella sezione' : 'Torna indietro'
    );
    toggle.setAttribute('aria-expanded', p === 0 ? 'false' : 'true');

    updateModel();
  }

  /* ======================================================================
     POSIZIONE DEL MODELLO — una sola, per tutto il sito
     ====================================================================== */
  function updateModel(immediate) {
    setModelTarget(mobile.matches ? mobileCenterPx() : desktopCenterPx(), immediate);
  }

  /* Un solo punto da cui passa la posizione del modello: chiunque la voglia
     cambiare passa di qui, e così non può esistere una seconda verità. */
  function setModelTarget(px, immediate) {
    scene.setCenterX(px, immediate);
  }

  /* DESKTOP — il modello sta al centro del corridoio fra il bordo destro del
     menu e il bordo sinistro del contenuto, e il corridoio cambia da sezione
     a sezione: sulla Home e sui Contatti il menu è grande e la colonna
     stretta, quindi il modello sta più a destra; sul Portfolio e sul CV il
     menu è piccolo e la colonna larga, e il modello arretra verso sinistra.
     Passando da una sezione all'altra ci scivola, ammorbidito dalla scena.

     PORTFOLIO E CV CONDIVIDONO LO STESSO IDENTICO VALORE. Le due colonne sono
     larghe 450 e 417: calcolandolo sezione per sezione il modello si spostava
     di una quindicina di pixel passando dall'una all'altra — uno scarto
     piccolo e proprio per questo fastidioso, perché sembra un errore.

     Tutte le posizioni si calcolano una volta sola, dalle pose del menu già
     misurate e dalle colonne: dipendono dall'impaginazione, non da quello che
     si sta guardando, quindi durante lo scorrimento non si misura niente. */
  function desktopCenterPx() {
    const { away, back } = navProgress();
    return desktopCenterFor(away, back);
  }

  /* Dove sta il modello a questo punto dello scorrimento. Non dipende da
     quale sezione è "attiva" ma da quanto si è scorso: è la stessa frazione
     che muove il menu, quindi le due cose viaggiano insieme e non possono
     sfasarsi. Fermandosi a metà, il modello sta a metà. */
  function desktopCenterFor(away, back) {
    if (!desktopCenters) measureDesktopCenters();
    const { first, shared, last } = desktopCenters;
    return first + (shared - first) * away + (last - shared) * back;
  }

  function measureDesktopCenters() {
    if (!menuGeom) measureMenu();
    const vw = window.innerWidth;
    const half = scene.projectedHalfWidth();
    const left = (el) => el.getBoundingClientRect().left;

    /* Il modello gira col mouse e ruotando si allarga del 16%: il margine si
       prende sulla sagoma nella rotazione peggiore, così anche girandolo non
       finisce mai sotto al testo. Sulle finestre larghe il limite non morde e
       la composizione resta quella disegnata. */
    const keepClear = (center, limit) =>
      half > 0 ? Math.min(center, limit - MODEL_CLEARANCE - half) : center;

    // Home e Contatti: menu grande, ognuna con la sua colonna.
    const perSection = sections.map((section, i) => {
      const pane = panes[i];
      if (!pane) return 0;
      return keepClear((menuGeom.heroRight + left(pane)) / 2, left(pane));
    });

    // Portfolio e CV: menu piccolo, un valore solo, preso sulla colonna del
    // CV e limitato dalla griglia del Portfolio, che è più a sinistra.
    const cvPane = panes[ids.indexOf('cv')];
    const shared = cvPane
      ? keepClear(
          (menuGeom.compactRight + left(cvPane)) / 2 -
            DESKTOP_COMPACT_SHIFT * vw +
            DESKTOP_COMPACT_NUDGE * vw,
          Math.min(left(cvPane), galleryPane ? left(galleryPane) : left(cvPane))
        )
      : perSection[0];

    desktopCenters = {
      first: perSection[0], // Home
      last: perSection[perSection.length - 1], // Contatti
      shared, // Portfolio e CV
    };
  }

  /* IL MODELLO E IL CONTENUTO SONO LEGATI, e restano sempre alla stessa
     distanza: quando il contenuto avanza verso sinistra — la striscia del
     Portfolio che scorre col dito, il CV che si apre a pagina piena — il
     modello trasla degli stessi identici pixel, come se fossero due punti
     della stessa superficie. Così se ne va insieme al contenuto invece di
     restargli dietro, e testo e immagini non gli finiscono mai sopra. */
  function mobileCenterPx() {
    const vw = window.innerWidth;
    if (panel === 0) return MOBILE_CENTER_MENU * vw;

    const rest = MOBILE_CENTER_REST * vw;
    // Pannello 2 (il CV aperto): il pannello ha percorso tutta la sua corsa.
    if (panel >= 2) return rest - paneShift(panes[index]);

    if (ids[index] === 'portfolio' && galleryPane) {
      return rest - galleryPane.scrollLeft;
    }

    return rest;
  }

  function onGalleryScroll() {
    /* UNA COSA SOLA PER VOLTA COMANDA IL MODELLO.
       Mentre il dito trascina è il trascinamento a dire dov'è il modello; la
       galleria, che per inerzia continua a scorrere, qui non lo tocca. Erano
       due sorgenti per la stessa posizione, ed è da lì che veniva lo scatto
       tornando indietro dal Portfolio. */
    if (drag || dragY || !mobile.matches || ids[index] !== 'portfolio') return;
    // `true`: il modello segue il dito, senza ammorbidimento.
    updateModel(true);
  }

  /* ======================================================================
     TOUCH (mobile)
     ----------------------------------------------------------------------
     ORIZZONTALE — trascina il pannello: menu ↔ contenuto (e sul CV il testo
       tutto aperto). Sul Portfolio, finché la galleria ha strada scorre lei.
     VERTICALE — trascina la sezione: quella che esce e quella che entra si
       muovono insieme al dito, e al rilascio si assesta la più vicina.
     IN OGNI CASO il modello gira col dito, anche durante una transizione.
     ====================================================================== */
  /* ANCHE SU DESKTOP CI SONO SCHERMI TATTILI.
     Su un portatile Windows col touchscreen il dito scorre la pagina — ci
     pensa il browser — ma il modello deve girare come gira col mouse. Lì
     quindi non si toccano né pannelli né sezioni: solo la rotazione, e solo
     quando il gesto è orizzontale, perché il verticale è lo scorrimento. */
  function onTouchStart(event) {
    /* Dentro un progetto il dito scorre la pagina del progetto e basta. */
    if (event.touches.length !== 1 || project.isOpen()) {
      touch = null;
      return;
    }
    // Il dito che si appoggia afferra il modello: l'inerzia si ferma.
    if (mobile.matches) scene.stopSpin();
    const t = event.touches[0];
    const pane = panes[index];
    touch = {
      x: t.clientX,
      y: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
      lastTime: performance.now(),
      time: performance.now(),
      axis: null,
      vx: 0, // velocità orizzontale della rotazione, per l'inerzia
      inField: isFormField(event.target),
      // Bordi al momento in cui il dito si appoggia: decidono se questo gesto
      // può cambiare scheda o pannello, o se deve solo scorrere il contenuto.
      canScrollDown: canScrollY(pane, 1),
      canScrollUp: canScrollY(pane, -1),
      canScrollRight: canScrollX(pane, 1),
      canScrollLeft: canScrollX(pane, -1),
    };
  }

  function onTouchMove(event) {
    if (!touch || event.touches.length !== 1) return;
    const t = event.touches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;

    /* L'asse si decide una volta sola, dopo i primi DRAG_MIN pixel, e da lì
       non cambia: è quello che impedisce a un tremolio di far partire la
       transizione sbagliata. */
    if (!touch.axis && Math.hypot(dx, dy) >= DRAG_MIN) {
      touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (mobile.matches) {
        if (touch.axis === 'x' && canDrag(dx)) beginDrag(dx);
        if (touch.axis === 'y' && canDragY(dy)) beginDragY(dy);
      }
    }

    if (drag || dragY) {
      // Il gesto è del sito: il browser non ci faccia sopra altro.
      if (event.cancelable) event.preventDefault();
      if (drag) updateDrag(dx);
      if (dragY) updateDragY(dy);
    }

    /* IL MODELLO GIRA COL DITO, anche mentre una scheda sta passando: è
       l'unica cosa che tiene insieme il gesto e la scena. Non gira invece
       mentre il dito sta soltanto scorrendo un testo — lì sta leggendo, e
       ridisegnare la scena a ogni fotogramma toglierebbe fluidità proprio
       allo scorrimento. La sua POSIZIONE la comanda una cosa sola per volta
       (il trascinamento, o la galleria): qui si cambia solo la rotazione.
       Sul menu del telefono non c'è testo da leggere: lì il dito verticale
       sfoglia le sezioni, e il modello gira anche allora. */
    const onMenu = mobile.matches && panel === 0;
    const scrolling = touch.axis === 'y' && !dragY && !onMenu;
    if (!touch.inField && !scrolling) {
      const now = performance.now();
      const stepX = t.clientX - touch.lastX;
      const stepY = t.clientY - touch.lastY;
      const dt = Math.max(1, now - touch.lastTime);
      // Più il dito corre, più il modello gira: il guadagno si ferma a +60%.
      const speed = Math.hypot(stepX, stepY) / dt;
      const gain = 1 + Math.min(speed / TOUCH_FAST, 1) * TOUCH_BOOST;
      const spinX = mobile.matches ? stepX * gain * MOBILE_SPIN_GAIN : stepX * gain;
      scene.applyPointerDelta(spinX, stepY * gain);
      // Velocità ammorbidita: un singolo evento irregolare non decide il lancio.
      touch.vx = touch.vx * 0.3 + (spinX / dt) * 0.7;
      touch.lastTime = now;
    }

    touch.lastX = t.clientX;
    touch.lastY = t.clientY;
  }

  function onTouchEnd() {
    /* Inerzia (solo telefono): se il dito si stacca ancora in corsa, il
       modello prosegue la rotazione e rallenta da solo. */
    if (
      mobile.matches &&
      touch &&
      touch.vx &&
      performance.now() - touch.lastTime < FLING_HOLD_MS
    ) {
      scene.fling(touch.vx);
    }

    if (drag) {
      endDrag();
      touch = null;
      return;
    }
    if (dragY) {
      endDragY();
      touch = null;
      return;
    }
    if (!touch || !mobile.matches) {
      touch = null;
      return;
    }

    const dx = touch.lastX - touch.x;
    const dy = touch.lastY - touch.y;
    const elapsed = performance.now() - touch.time;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const current = touch;
    touch = null;

    if (current.inField || locked) return;
    if (elapsed > SWIPE_MAX_TIME) return;
    if (absX < SWIPE_MIN && absY < SWIPE_MIN) return;

    /* Qui si arriva solo se il trascinamento non è partito: gesto troppo
       breve per decidere l'asse, oppure bloccato. Resta la lettura a soglia
       del colpo secco. */
    const inContent = panel > 0;

    if (absX > absY * SWIPE_AXIS_BIAS) {
      if (dx < 0 && !(inContent && current.canScrollRight)) setPanel(panel + 1);
      if (dx > 0 && !(inContent && current.canScrollLeft)) setPanel(panel - 1);
      return;
    }

    if (absY > absX * SWIPE_AXIS_BIAS) {
      /* Verticale: cambia scheda se il contenuto è a fine corsa. Dal menu
         funziona sempre: lì il contenuto è fuori campo e lo swipe sfoglia le
         sezioni aggiornando la voce attiva. */
      if (dy < 0 && !(inContent && current.canScrollDown)) goToSection(index + 1, 1);
      if (dy > 0 && !(inContent && current.canScrollUp)) goToSection(index - 1, -1);
    }
  }

  /* ======================================================================
     TRASCINAMENTO ORIZZONTALE — i pannelli
     ====================================================================== */
  function panelX(p, pane) {
    if (p === 0) return window.innerWidth; // translateX(100vw)
    if (p === 1) return paneShift(pane); // --shift-1
    return 0; // --shift-2
  }

  /* Dov'è il modello quando il pannello è p. Il passo 1 → 2 (il CV che si
     apre) è una traslazione del contenuto, e il modello la fa identica: la
     distanza fra i due non cambia mai. Il passo 0 → 1 invece è l'ingresso
     nella sezione, dove il menu scorre sopra al modello: lì il movimento è
     un altro, ed è quello disegnato sulle tavole. */
  function panelCenter(p, pane) {
    if (p === 0) return MOBILE_CENTER_MENU * window.innerWidth;
    const rest = MOBILE_CENTER_REST * window.innerWidth;
    if (p === 1) return rest;
    return rest - paneShift(pane);
  }

  function canDrag(dx) {
    if (!mobile.matches || locked || touch.inField) return false;

    const dir = dx < 0 ? 1 : -1;
    const next = panel + dir;
    if (next < 0 || next > panelCount[ids[index]] - 1) return false;

    /* Se il contenuto può ancora scorrere in quella direzione, scorre lui: è
       la galleria del Portfolio a comandare finché ha strada. Ma solo se il
       contenuto è in campo: al pannello 0 la galleria è fuori schermo. */
    if (panel > 0) {
      if (dir > 0 && touch.canScrollRight) return false;
      if (dir < 0 && touch.canScrollLeft) return false;
    }

    return true;
  }

  function beginDrag(dx) {
    const pane = panes[index];
    if (!pane) return;

    const to = panel + (dx < 0 ? 1 : -1);
    const fromX = panelX(panel, pane);
    const toX = panelX(to, pane);
    if (fromX === toX) return;

    drag = {
      pane,
      to,
      fromX,
      toX,
      min: Math.min(fromX, toX),
      max: Math.max(fromX, toX),
      x: fromX,
      t: 0,
      fromC: panelCenter(panel, pane),
      toC: panelCenter(to, pane),
      /* Dove sta il menu quando è fuori campo: la sua larghezza, il margine
         sinistro e il soprappiù che mangia lo sbordo del corsivo. */
      hidden: -(menu.offsetWidth + menu.offsetLeft + MENU_HIDE_EXTRA),
    };
    document.body.classList.add('is-dragging');
  }

  function updateDrag(dx) {
    const x = Math.max(drag.min, Math.min(drag.max, drag.fromX + dx));
    drag.x = x;
    drag.t = (drag.fromX - x) / (drag.fromX - drag.toX); // 0 partenza, 1 arrivo
    drag.pane.style.transform = `translateX(${x}px)`;

    // Il modello scivola via nella stessa misura in cui il testo avanza.
    scene.setCenterX(drag.fromC + (drag.toC - drag.fromC) * drag.t, true);

    /* Il menu scorre di lato insieme a tutto il resto: entra da sinistra
       tornando indietro, esce a sinistra entrando nel contenuto. */
    if (drag.to === 0) menu.style.transform = `translateX(${drag.hidden * (1 - drag.t)}px)`;
    else if (panel === 0) menu.style.transform = `translateX(${drag.hidden * drag.t}px)`;

    /* Il triangolo gira insieme a tutto il resto, invece di scattare a fine
       transizione: punta a destra quando si entra, a sinistra per tornare. */
    const fromTurn = panel === 0 ? 0 : 180;
    const toTurn = drag.to === 0 ? 0 : 180;
    setToggleTurn(fromTurn + (toTurn - fromTurn) * drag.t);
  }

  function endDrag() {
    const current = drag;
    drag = null;

    const moved = Math.abs(current.x - current.fromX);
    const elapsed = touch ? Math.max(1, performance.now() - touch.time) : 1000;
    const flick = moved >= FLICK_MIN && moved / elapsed > FLICK_VELOCITY;
    const target = current.t > DRAG_SNAP || flick ? current.to : panel;

    /* Ordine importante: prima lo stato sotto la trasformazione in linea (che
       continua a vincere, quindi non si vede niente), poi si riaccende la
       transizione togliendola. Il browser interpola dalla posizione del dito
       a quella del pannello scelto. */
    if (target !== panel) setPanel(target);
    document.body.classList.remove('is-dragging');
    current.pane.style.transform = '';
    menu.style.transform = '';
    setToggleTurn(null);
    updateModel();
  }

  /* ======================================================================
     TRASCINAMENTO VERTICALE — le schede
     ----------------------------------------------------------------------
     La scheda che esce e quella che entra si muovono insieme al dito, si
     vedono entrambe, e si può tornare indietro prima di lasciare.
     IL MODELLO NON SI SPOSTA: ha una posizione sola per tutte le sezioni.
     Continua però a girare col dito, che è quello che tiene insieme il gesto.
     ====================================================================== */
  function canDragY(dy) {
    if (!mobile.matches || locked || touch.inField) return false;
    if (panel === 0) return false; // al menu il contenuto è fuori campo

    const dir = dy < 0 ? 1 : -1; // dito verso l'alto = sezione successiva
    const to = index + dir;
    if (to < 0 || to > sections.length - 1) return false;

    // Se il contenuto della sezione può ancora scorrere, scorre lui.
    if (dir > 0 && touch.canScrollDown) return false;
    if (dir < 0 && touch.canScrollUp) return false;

    return true;
  }

  function beginDragY(dy) {
    dragY = {
      from: index,
      to: index + (dy < 0 ? 1 : -1),
      dir: dy < 0 ? 1 : -1,
      height: Math.max(1, window.innerHeight),
      t: 0,
    };
    document.body.classList.add('is-dragging-y');
  }

  function updateDragY(dy) {
    const travel = dragY.dir > 0 ? -dy : dy;
    dragY.t = clamp01(travel / dragY.height);

    const out = -dragY.dir * dragY.t * 100; // la scheda che esce
    const incoming = dragY.dir * (1 - dragY.t) * 100; // quella che arriva
    sections[dragY.from].style.transform = `translateY(${out}%)`;
    sections[dragY.to].style.transform = `translateY(${incoming}%)`;
  }

  function endDragY() {
    const current = dragY;
    dragY = null;

    const moved = current.t * current.height;
    const elapsed = touch ? Math.max(1, performance.now() - touch.time) : 1000;
    const flick = moved >= FLICK_MIN && moved / elapsed > FLICK_VELOCITY;
    const commit = current.t > DRAG_SNAP || flick;

    if (commit) goToSection(current.to, current.dir);
    document.body.classList.remove('is-dragging-y');
    sections[current.from].style.transform = '';
    sections[current.to].style.transform = '';
  }

  function setToggleTurn(deg) {
    if (!toggleSvg) return;
    toggleSvg.style.transform = deg === null ? '' : `rotate(${deg}deg)`;
  }

  /* ======================================================================
     UTILITÀ
     ====================================================================== */
  function canScrollY(el, dir) {
    if (!el) return false;
    const room = el.scrollHeight - el.clientHeight;
    if (room <= 1) return false;
    return dir > 0 ? el.scrollTop < room - 1 : el.scrollTop > 1;
  }

  function canScrollX(el, dir) {
    if (!el) return false;
    const room = el.scrollWidth - el.clientWidth;
    if (room <= 1) return false;
    return dir > 0 ? el.scrollLeft < room - 1 : el.scrollLeft > 1;
  }

  /* Quanto vale --shift-1 in pixel. È registrato con @property in
     css/layout.css proprio per poterlo leggere già risolto da qui. */
  function paneShift(pane) {
    const raw = getComputedStyle(pane).getPropertyValue('--shift-1').trim();
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }

  /* Solo i veri campi del modulo fermano i gesti: lì il dito serve a scrivere
     e a selezionare testo. Pulsanti e link no: ogni immagine della galleria è
     un pulsante, e uno swipe che comincia sopra un'immagine deve continuare a
     scorrere la galleria. Un tocco breve resta comunque un clic. */
  function isFormField(el) {
    return !!(el && el.closest && el.closest('input, textarea, select'));
  }

  /* Ridimensionando cambiano margini, colonne e --px: tutto quello che era
     stato misurato si butta via e si rifà una volta sola. */
  function onResize() {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      menuGeom = null;
      desktopCenters = null;
      updateNav(true);
      updateModel();
    });
  }

  function onBreakpointChange() {
    panel = 1;
    menuGeom = null;
    desktopCenters = null;
    navP = -1;
    if (mobile.matches) {
      menu.style.transform = ''; // su telefono il transform è del pannello
      clearLinkPoses();
      setMenuLayout(true);
    } else {
      /* Tornando al desktop le sezioni non sono più schede: tutte in campo,
         tutte raggiungibili, senza le tracce lasciate dai gesti. */
      sections.forEach((section) => {
        section.removeAttribute('inert');
        section.classList.remove('is-active', 'is-above', 'is-below');
        section.style.transform = '';
      });
    }
    renderSections();
    renderPanel();
    updateNav(true);
  }

  return {
    dispose() {
      spy.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (galleryPane) galleryPane.removeEventListener('scroll', onGalleryScroll);
      mobile.removeEventListener('change', onBreakpointChange);
    },
  };
}
