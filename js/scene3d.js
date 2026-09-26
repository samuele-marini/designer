/* ==========================================================================
   MODELLO 3D
   --------------------------------------------------------------------------
   Tutta la logica del modello vive qui e non sa niente del resto del sito.
   Il sito la comanda con tre soli metodi:

     scene.setCenterX(px)         dove deve stare il centro del modello
     scene.applyPointerDelta(dx, dy)  rotazione da un gesto touch
     scene.dispose()              smonta tutto

   L'ART DIRECTION È QUELLA DEL PROTOTIPO ORIGINALE, INVARIATA:
   l'ambiente studio disegnato su canvas, le sue strisce, il rig di luci,
   i parametri del vetro, lo shader Fresnel e la posa iniziale sono gli
   stessi. Sono tarati fra loro e non vanno toccati a caso.

   COSA È CAMBIATO RISPETTO AL PROTOTIPO, E PERCHÉ:
   - l'inquadratura si fa spostando la camera, mai cambiando la scala del
     modello (il vecchio onResize moltiplicava la scala per 118);
   - la camera legge il contenitore, non la finestra;
   - il piano near passa da 0,01 a 1 (precisione di profondità);
   - i puntatori usano down/move/up con cattura, e su touch è il sito a
     passare il movimento: così il dito può anche scorrere e navigare;
   - il loop di rendering si ferma quando non c'è niente da mostrare;
   - su telefono il vetro rinuncia alla rifrazione: costa un secondo
     rendering completo della scena a ogni fotogramma;
   - c'è una via d'uscita se manca WebGL o se il modello non si carica.
   ========================================================================== */

import * as THREE from './vendor/three.module.js';

/* --------------------------------------------------------------------------
   COSTANTI REGOLABILI
   -------------------------------------------------------------------------- */

/* Rotazione. I valori dell'asse Y sono quelli del prototipo e restano.
   L'asse X è molto più contenuto: deve dare solo un accenno di inclinazione
   verticale, non permettere di guardare il modello dall'alto o dal basso. */
const YAW_PER_PIXEL = 0.006;
const PITCH_PER_PIXEL = 0.0012;
const PITCH_LIMIT = 0.18; // ~10 gradi
const ROTATION_EASE = 0.13;
const INITIAL_YAW = -0.25; // la posa su cui è tarato tutto il rig di luci

/* Inquadratura.

   SE IL MODELLO TI SEMBRA TROPPO GRANDE O TROPPO PICCOLO, CAMBIA
   DESKTOP_WIDTH_FACTOR.

   Su desktop l'inquadratura è ancorata alla LARGHEZZA della finestra, non
   alla sua altezza. Sulla tavola 1280x578 la sagoma misura 536 pixel, cioè
   il 42% della larghezza: è quella la proporzione che l'occhio legge, perché
   la composizione è orizzontale (menu | modello | testo).

   Ancorarla all'altezza — com'era prima — sembra equivalente ma non lo è: la
   tavola Figma è insolitamente bassa (578), quindi su una finestra normale da
   720 il modello cresceva fino al 57% della larghezza e arrivava a coprire il
   menu. Con l'ancoraggio alla larghezza resta al 42% su qualunque finestra, e
   a cambiare è solo quanto viene tagliato sopra e sotto — che è esattamente
   il comportamento delle tavole.

   HEIGHT_FACTOR resta, ma ora fa da TETTO: il modello non può comunque
   superare una volta e mezza l'altezza della finestra. Serve sugli schermi
   molto larghi e bassi, dove il 42% della larghezza sarebbe enorme.

   MOBILE_WIDTH_FACTOR governa il telefono e non tocca mai il desktop.
   Invariato: è tarato sulla rotazione peggiore attorno all'asse Y, quando il
   quadrato delle lastre si presenta di spigolo ed è più largo di 1,16 volte. */
/* 0,397 e non 0,42 perché modelRestWidth() misura l'ingombro in proiezione
   parallela, mentre la camera è prospettica e allarga le lastre più vicine.
   Il numero è tarato confrontando la sagoma renderizzata con quella della
   tavola: 536 pixel su 1280. */
const DESKTOP_WIDTH_FACTOR = 0.404; // sagoma a riposo / larghezza viewport
const MOBILE_WIDTH_FACTOR = 1.71; // larghezza massima / larghezza viewport
const HEIGHT_FACTOR = 1.50; // tetto: altezza massima / altezza viewport

const MODEL_WORLD_HEIGHT = 5.0; // fissa: i parametri del vetro sono tarati qui
const FOV = 38;
const NARROW_QUERY = '(max-width: 899px)'; // lo stesso breakpoint del CSS

/* Morbidezza della traslazione orizzontale. Era 0,08: il modello impiegava
   quasi un secondo ad arrivare, molto più della transizione che accompagna.
   A 0,22 si esaurisce in circa 380ms, quanto --dur-section: il modello e il
   contenuto arrivano insieme invece che a distanza. */
const OFFSET_EASE = 0.22;

/* ==========================================================================
   ASPETTO DEL MODELLO — LE MANOPOLE
   --------------------------------------------------------------------------
   Tutto quello che si può cambiare guardando il risultato sta qui dentro.
   Nessuno di questi numeri costa un fotogramma in più: sono uniformi passate
   allo shader, non passaggi di rendering. Si può girarli liberamente.

   COSA NON TOCCARE SENZA SAPERE PERCHÉ
   - `environment` disegna le strisce riflettenti su una tela. È da lì che
     vengono la banda azzurra sul fianco e i lampi ciano e fucsia: sono la
     firma del modello. Le posizioni delle strisce e le loro intensità sono
     tarate fra loro e con il rig di luci.
   - `transmission` a 1 attiva la rifrazione vera. Costa un rendering
     completo della scena in più a ogni fotogramma, ed è l'unica voce di
     questo blocco che pesa davvero. Su telefono è già disattivata.
   ========================================================================== */
export const SETTINGS = {
  /* --- COME È FATTO IL VETRO -------------------------------------------
     Due strade diverse, non due tarature della stessa cosa.

     'layered'  — VETRO A STRATI. Le lastre si fondono una sull'altra:
                  guardandone una si vede quella dietro. È l'unico modo per
                  avere quella sovrapposizione. Il colore `color` conta
                  davvero. Non costa passaggi di rendering: è anche la strada
                  più leggera.

     'refraction' — VETRO CON RIFRAZIONE. Fisicamente più corretto sul
                  singolo pezzo, ma in three.js la scena viene ridisegnata in
                  una texture ESCLUDENDO gli oggetti trasmissivi: il modello
                  rifrange lo sfondo, mai se stesso. Le lastre restano quindi
                  opache fra loro, e `color` non si vede perché filtra una
                  luce che dietro non c'è (lo sfondo è nero puro). Costa un
                  rendering completo della scena a ogni fotogramma. */
  glassMode: 'refraction',

  /* --- VETRO A STRATI (glassMode: 'layered') ---------------------------- */
  layered: {
    color: 0x1e2c38, // LA TINTA DELLE SUPERFICI. Qui funziona davvero.
    opacity: 0.34, // 0,2 = quasi aria, 0,6 = lastre compatte
    roughness: 0.06, // 0 = specchio, 0,2 = satinato
    metalness: 0.0, // lasciare a 0: è vetro, non metallo
    ior: 2.0, // 1,5 riflette il 4% di fronte, 2,0 l'11% (sembra metallo)
    envMapIntensity: 2.2, // riflessi e luce azzurra. Più basso qui che con la
    //                       rifrazione, perché le lastre si sommano fra loro
    doubleSided: false, // true = si vede anche il retro di ogni lastra, e
    //                     l'accumulo raddoppia (schiarisce molto)
  },

  /* --- VETRO CON RIFRAZIONE (glassMode: 'refraction') ------------------- */
  refraction: {
    color: 0xeaf6ff, // NOTA: su sfondo nero non si vede. Vedi glassMode.
    metalness: 0.0,
    roughness: 0.01,
    transmission: 1.0, // COSTOSO: un rendering della scena in più
    thickness: 0.1, // spessore del volume: governa quanto tinge e scurisce
    ior: 2.0,
    attenuationColor: 0x9fd8f2,
    attenuationDistance: 1.0,
    envMapIntensity: 3.2,
    clearcoat: 0.0,
    clearcoatRoughness: 0.03,
  },

  /* Su telefono la rifrazione è sempre spenta — costa troppo — e il vetro è
     una semplice trasparenza. Con glassMode 'layered' telefono e desktop
     usano finalmente lo stesso materiale. */
  mobileOpacity: 0.42,

  /* --- BORDI (lo strato Fresnel) ----------------------------------------
     QUESTE DUE VOCI GOVERNANO IL GRIGIO DELLE FACCE LARGHE.

     Sembra controintuitivo, ma è misurato: azzerando questo strato la
     luminanza del modello crolla da 32 a 1,7. Quasi tutto quello che si vede
     — non solo i fili, anche il grigio sulle superfici — viene da qui, non
     dal vetro. Il motivo è la forma: le lastre sono sottili e si vedono molto
     di scorcio, quindi il termine Fresnel è alto su TUTTA la faccia e non
     solo sul bordo.

     `power` è la manopola giusta per scurire le superfici:
       3,2  bagliore largo, si spalma sulla faccia -> superfici grigio chiaro
       7,0  bagliore stretto sul filo -> facce scure, spigoli netti
     Alzando power i fili perdono un po' di forza, e `intensity` la rende.

     Misura del passaggio da 3,2/0,42 a 7,0/0,50: i pixel chiari (i fili)
     restano 61.000, quelli medi (il grigio sulle facce) scendono del 26%.

     `intensity` è passata da 0,50 a 0,90 insieme alla correzione della
     normale sulle facce posteriori (vedi lo shader): prima metà del bagliore
     usciva a intensità piena e piatta sul retro delle lastre, adesso esce
     solo dove serve, quindi ne serve di più per avere gli stessi fili.
     Misurato: i pixel chiari tornano a 65.000, come prima della correzione. */
  edge: {
    color: 0xffffff,
    intensity: 0.9,
    power: 7.0,

    /* Usati solo con glassMode 'layered', dove il vetro non scrive la
       profondità e ogni bagliore attraversa tutte le lastre sommandosi:
       lì con 0,5 il modello diventa un blocco bianco. */
    layeredIntensity: 0.1,
    layeredPower: 5.0,
  },

  /* --- AMBIENTE STUDIO ---------------------------------------------------
     Le strisce riflettenti disegnate su una tela. Sono la vera fonte di
     tutto quello che si vede sul vetro.

     LE FACCE LARGHE SONO GRIGIE PER COLPA DELLE STRISCE BIANCHE.
     Con la rifrazione il `color` del materiale non si vede (filtra il nero
     dello sfondo): l'unica cosa che illumina una lastra vista di fronte è il
     riflesso dell'ambiente. Abbassando SOLO le bianche, le superfici si
     scuriscono e il ciano, il magenta e la banda azzurra restano intatti —
     cosa che `envMapIntensity` non sa fare, perché abbassa tutto insieme.

     Manopola secondaria: misurata, sposta la luminanza solo del 2%. Il grigio
     delle facce viene quasi tutto da `edge.power`, non da qui.
     1,0 = come il prototipo · 0,6 = un filo più cupo. */
  envWhiteIntensity: 1.0,

  /* --- LUCI ------------------------------------------------------------- */
  lights: {
    ambient: { sky: 0xffffff, ground: 0x020206, intensity: 0.12 },
    key: { color: 0xffffff, intensity: 1.1, position: [3.5, 4.0, 4.5] },
    cyan: { color: 0x4ddcff, intensity: 7, distance: 5, position: [-3.2, 1.6, 2.8] },
    magenta: { color: 0xff4db8, intensity: 5, distance: 5, position: [3.0, -0.8, 2.4] },
  },

  /* --- RESA ------------------------------------------------------------- */
  render: {
    exposure: 1.0, // luminosità generale. Sotto 1 scurisce TUTTO, luce inclusa
    pixelRatioDesktop: 2, // nitidezza. Scendere qui è il modo più efficace
    pixelRatioMobile: 1.25, //   di alleggerire, se mai servisse
    // Risoluzione dell'immagine che il vetro rifrange, rispetto allo
    // schermo. 1 = piena. A 0.5 si disegnano quattro volte meno pixel ad
    // ogni fotogramma (con nitidezza 2 sono circa 4 milioni in meno), e dietro
    // il vetro ci sono solo il nero e le facce posteriori del modello.
    transmissionResolution: 0.5,
  },
};

export function createScene(container, { loadingEl, errorEl } = {}) {
  /* --- stato ------------------------------------------------------------ */
  let renderer, scene, camera, model, edgeGlow, geometry;
  let glassMaterial, fresnelMaterial, envRenderTarget;
  let resizeObserver, rafId;
  let disposed = false;
  let needsRender = true;

  let targetYaw = INITIAL_YAW;
  let targetPitch = 0;
  let currentYaw = INITIAL_YAW;
  let currentPitch = 0;

  let targetCenterX = null; // in pixel, dal bordo sinistro del contenitore
  let currentCenterX = null;
  let pixelsPerWorldUnit = 0;
  let ready = false;
  let readyWaiting = [];

  let activePointerId = null;
  let lastX = null;
  let lastY = null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Su schermi touch il vetro con rifrazione non regge: three.js renderizza
     l'intera scena una seconda volta, ogni fotogramma, per poterla rifrangere. */
  const lowTier = window.matchMedia('(pointer: coarse)').matches;
  /* L'inquadratura segue il breakpoint del CSS, non il tipo di puntatore:
     un portatile touch deve restare desktop. */
  const narrow = window.matchMedia(NARROW_QUERY);

  /* NITIDEZZA CHE SI ADATTA AL COMPUTER.
     Un fotogramma desktop costa molto più di uno mobile: lo schermo è largo,
     la nitidezza è doppia e l'antialiasing è acceso, quindi i pixel da
     disegnare sono circa nove volte tanti — e ogni fotogramma si disegna due
     volte, perché il vetro rifrange. Su una scheda grafica normale non si
     sente; su un portatile con grafica integrata sì, e si vede come uno
     scorrimento a scatti, perché il modello e il menu restano indietro
     rispetto alla pagina.

     Invece di scegliere a priori una nitidezza bassa per tutti, la scena si
     misura mentre lavora: se per un mezzo secondo di seguito i fotogrammi
     arrivano più lenti di QUALITY_SLOW_MS, scende di un gradino. Due gradini
     al massimo, e non si risale mai — un valore che va su e giù sarebbe
     peggio di uno basso. Su un computer veloce non succede niente e la
     nitidezza resta piena. */
  const QUALITY_SLOW_MS = 22; // circa 45 fotogrammi al secondo
  const QUALITY_PATIENCE = 24; // fotogrammi lenti di fila prima di scendere
  const QUALITY_STEP = 0.75; // quanto si scende per gradino
  const QUALITY_FLOOR = 0.56; // due gradini: 1 -> 0.75 -> 0.56
  let qualityScale = 1;
  let slowFrames = 0;
  let lastFrameAt = 0;

  /* --- avvio ------------------------------------------------------------ */
  if (!container) {
    return nullScene();
  }

  if (!isWebGLAvailable()) {
    fail('WebGL non è disponibile su questo browser.');
    return nullScene();
  }

  try {
    init();
  } catch (err) {
    console.error(err);
    fail('Impossibile avviare la grafica 3D.');
    return nullScene();
  }

  loadModel('./assets/trasformazioni_geometriche.obj');
  loop();

  /* ======================================================================
     COSTRUZIONE DELLA SCENA
     ====================================================================== */
  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(FOV, 1, 1, 50);

    renderer = new THREE.WebGLRenderer({
      antialias: !lowTier,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = SETTINGS.render.exposure;
    renderer.transmissionResolutionScale = SETTINGS.render.transmissionResolution;
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    createStudioEnvironment();
    createLights();
    resize();

    resizeObserver = new ResizeObserver(() => {
      needsRender = true;
      resize();
    });
    resizeObserver.observe(container);

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    /* Il canvas sta dietro ai contenuti e non riceve eventi, quindi il mouse
       si ascolta sulla finestra: il modello risponde ovunque passi il cursore,
       che è il comportamento del prototipo. */
    // Passivi: non annullano mai l'evento, e dichiararlo evita al browser di
    // aspettare questi handler prima di far scorrere la pagina.
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd, { passive: true });
    window.addEventListener('pointercancel', onPointerEnd, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  /* Studio quasi nero con poche strisce riflettenti bianche e colorate.
     Le strisce sono volutamente strette: il vetro prende luce solo a certe
     angolazioni, ed è da qui che vengono i bordi ciano e i lampi magenta.
     INVARIATO dal prototipo: ogni numero è tarato. */
  function createStudioEnvironment() {
    const w = 1024;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    /* Strisce studio bianche, morbide. Sono queste a illuminare le facce
       larghe viste di fronte, e quindi a decidere quanto sembrano chiare.
       Il fattore le abbassa tutte e tre insieme, lasciando stare le colorate. */
    const white = Math.max(0, SETTINGS.envWhiteIntensity);
    drawStrip(ctx, 108, 0, 20, h, `rgba(255,255,255,${0.96 * white})`, 18);
    drawStrip(ctx, 430, 0, 42, h, `rgba(255,255,255,${1 * white})`, 26);
    drawStrip(ctx, 785, 0, 16, h, `rgba(255,255,255,${0.86 * white})`, 15);

    // Sorgenti colorate, molto trattenute.
    drawStrip(ctx, 286, 70, 10, 270, 'rgba(70,205,255,0.95)', 18);
    drawStrip(ctx, 690, 90, 8, 250, 'rgba(255,65,190,0.90)', 18);

    // Piccolo accento caldo, volutamente appena percettibile.
    drawStrip(ctx, 905, 125, 5, 190, 'rgba(255,185,90,0.70)', 12);

    const envTexture = new THREE.CanvasTexture(canvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    envTexture.colorSpace = THREE.SRGBColorSpace;
    envTexture.generateMipmaps = true;
    envTexture.minFilter = THREE.LinearMipmapLinearFilter;
    envTexture.magFilter = THREE.LinearFilter;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    envRenderTarget = pmrem.fromEquirectangular(envTexture);
    scene.environment = envRenderTarget.texture;
    envTexture.dispose();
    pmrem.dispose();
  }

  function drawStrip(ctx, x, y, width, height, color, blur) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  /* Illuminazione diretta bassa: il lavoro lo fa l'ambiente. INVARIATO. */
  function createLights() {
    const L = SETTINGS.lights;
    scene.add(new THREE.HemisphereLight(L.ambient.sky, L.ambient.ground, L.ambient.intensity));

    const key = new THREE.DirectionalLight(L.key.color, L.key.intensity);
    key.position.set(...L.key.position);
    scene.add(key);

    const cyan = new THREE.PointLight(L.cyan.color, L.cyan.intensity, L.cyan.distance, 2);
    cyan.position.set(...L.cyan.position);
    scene.add(cyan);

    const magenta = new THREE.PointLight(
      L.magenta.color,
      L.magenta.intensity,
      L.magenta.distance,
      2
    );
    magenta.position.set(...L.magenta.position);
    scene.add(magenta);
  }

  /* Il vetro rinuncia alla rifrazione? Sul telefono sempre: costa un
     rendering completo della scena in più a ogni fotogramma. */
  function layeredGlass() {
    return SETTINGS.glassMode === 'layered' || lowTier;
  }

  /* SCELTA ESPLICITA di vedere le lastre l'una attraverso l'altra. Diversa da
     layeredGlass(): sul telefono si rinuncia alla rifrazione per costo, ma il
     vetro continua a nascondere quello che ha dietro, come sempre. */
  function seeThroughGlass() {
    return SETTINGS.glassMode === 'layered';
  }

  function createGlassMaterial() {
    if (layeredGlass()) {
      const L = SETTINGS.layered;
      return new THREE.MeshPhysicalMaterial({
        color: L.color,
        metalness: L.metalness,
        roughness: L.roughness,
        envMapIntensity: L.envMapIntensity,
        ior: L.ior,
        side: L.doubleSided && !lowTier ? THREE.DoubleSide : THREE.FrontSide,
        transparent: true,
        opacity: lowTier ? SETTINGS.mobileOpacity : L.opacity,
        /* SENZA QUESTO NON SI VEDONO LE LASTRE DIETRO.
           Scrivendo la profondità, la prima lastra disegnata respinge tutte
           quelle che le stanno dietro e la sovrapposizione sparisce.
           Sul telefono resta attivo: lì si rinuncia alla rifrazione per
           costo, non per cambiare il modo in cui le lastre si coprono. */
        depthWrite: !seeThroughGlass(),
      });
    }

    const R = SETTINGS.refraction;
    return new THREE.MeshPhysicalMaterial({
      color: R.color,
      metalness: R.metalness,
      roughness: R.roughness,
      envMapIntensity: R.envMapIntensity,
      side: THREE.DoubleSide,
      transmission: R.transmission,
      thickness: R.thickness,
      ior: R.ior,
      attenuationColor: new THREE.Color(R.attenuationColor),
      attenuationDistance: R.attenuationDistance,
      clearcoat: R.clearcoat,
      clearcoatRoughness: R.clearcoatRoughness,
    });
  }

  /* Strato Fresnel: non disegna un wireframe, schiarisce i bordi visti di
     taglio perché la forma trasparente resti leggibile. Shader INVARIATO.

     IL GUSCIO E IL VETRO SONO LA STESSA SUPERFICIE, quindi si contendono la
     stessa profondità. Il rimedio è `polygonOffset`, che sposta il guscio di
     una frazione di profondità in fase di rasterizzazione — cioè della stessa
     quantità su tutte le lastre.

     Prima si usava una scala maggiorata dello 0,2%. Sembra la stessa cosa ma
     non lo è: scalare allontana le superfici IN PROPORZIONE ALLA DISTANZA
     DALL'ORIGINE, quindi le lastre esterne si staccavano davvero mentre al
     centro lo scostamento era zero. Da lì lo sfarfallio sulla lastra centrale
     sottile, che appariva diversa da tutte le altre. */
  function createFresnelMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        color: { value: new THREE.Color(SETTINGS.edge.color) },
        intensity: {
          value: seeThroughGlass() ? SETTINGS.edge.layeredIntensity : SETTINGS.edge.intensity,
        },
        power: {
          value: seeThroughGlass() ? SETTINGS.edge.layeredPower : SETTINGS.edge.power,
        },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float power;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          /* LA NORMALE VA RIBALTATA SULLE FACCE POSTERIORI.
             Il materiale disegna entrambi i lati di ogni lastra, ma la
             normale che arriva qui è sempre quella della faccia anteriore.
             Sul retro punta quindi via dalla camera, il prodotto scalare
             viene negativo, il max con zero lo azzera e il Fresnel vale
             pow(1.0, power) = 1: il bagliore usciva a INTENSITA' PIENA e
             PIATTA su tutte le facce posteriori, indipendentemente
             dall'angolo. Non era un filo luminoso, era una patina.

             Da lì venivano sia il grigio sulle superfici sia la granulosità:
             davanti e dietro di una lastra sottile cadono quasi sullo stesso
             pixel, e quale dei due vincesse cambiava punto per punto.

             Misurato: i puntini isolati passano da 684 a 28. */
          vec3 n = normalize(vNormal);
          if (!gl_FrontFacing) n = -n;

          float facing = max(dot(n, normalize(vViewDir)), 0.0);
          float fresnel = pow(1.0 - facing, power);
          float alpha = fresnel * intensity;
          if (alpha < 0.008) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }

  /* ======================================================================
     CARICAMENTO DEL MODELLO
     ====================================================================== */
  async function loadModel(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      geometry = parseOBJ(await response.text());
      geometry.computeBoundingBox();

      const box = geometry.boundingBox;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      if (!Number.isFinite(size.y) || size.y <= 0) {
        throw new Error('il file OBJ non contiene una geometria valida');
      }

      geometry.translate(-center.x, -center.y, -center.z);

      const scaleFactor = MODEL_WORLD_HEIGHT / size.y;

      model = new THREE.Mesh(geometry, (glassMaterial = createGlassMaterial()));
      model.scale.setScalar(scaleFactor);
      model.rotation.set(0, INITIAL_YAW, 0);
      scene.add(model);

      // Stessa scala del modello: è lo stesso guscio, non uno più grande.
      // La separazione in profondità la fa polygonOffset sul materiale.
      edgeGlow = new THREE.Mesh(geometry, (fresnelMaterial = createFresnelMaterial()));
      edgeGlow.scale.setScalar(scaleFactor);
      edgeGlow.rotation.copy(model.rotation);
      edgeGlow.renderOrder = 2;
      scene.add(edgeGlow);

      // Ora che la geometria c'è davvero, l'inquadratura si ricalcola con le
      // sue misure vere invece che con quelle di ripiego usate all'avvio.
      resize();

      // Il sito può misurare la sagoma solo adesso: prima non c'era.
      ready = true;
      readyWaiting.forEach((fn) => fn());
      readyWaiting = [];

      if (loadingEl) {
        loadingEl.classList.add('is-hidden');
        setTimeout(() => {
          if (loadingEl) loadingEl.hidden = true;
        }, 280);
      }

      needsRender = true;
    } catch (err) {
      console.error(err);
      fail('Il modello 3D non si è caricato. ' + err.message);
    }
  }

  /* Parser OBJ del prototipo. Novanta righe contro i ~40 KB di OBJLoader,
     ed è esatto per questo file (2790 riferimenti, 2790 vertici unici,
     quadrilateri compresi). Ignora di proposito `mtllib` e `usemtl`: il .mtl
     citato dal file non esiste e non serve, i materiali li fa il codice.
     Rispetto al prototipo: le normali si calcolano dopo setIndex e i numeri
     malformati vengono scartati invece di propagare NaN. */
  function parseOBJ(text) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const outPos = [];
    const outNorm = [];
    const outUv = [];
    const indices = [];
    const map = new Map();

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line[0] === '#') continue;

      const parts = line.split(/\s+/);
      const type = parts[0];

      if (type === 'v') {
        positions.push(num(parts[1]), num(parts[2]), num(parts[3]));
      } else if (type === 'vn') {
        normals.push(num(parts[1]), num(parts[2]), num(parts[3]));
      } else if (type === 'vt') {
        uvs.push(num(parts[1]), num(parts[2]));
      } else if (type === 'f') {
        // Triangolazione a ventaglio: corretta per i quadrilateri di questo file.
        const refs = parts.slice(1);
        for (let i = 1; i < refs.length - 1; i++) {
          addVertex(refs[0]);
          addVertex(refs[i]);
          addVertex(refs[i + 1]);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3));
    if (outNorm.length) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(outNorm, 3));
    }
    if (outUv.length) {
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2));
    }
    geo.setIndex(indices);
    if (!outNorm.length) geo.computeVertexNormals(); // dopo setIndex, non prima
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;

    function num(value) {
      const n = Number.parseFloat(value);
      return Number.isFinite(n) ? n : 0;
    }

    function addVertex(ref) {
      let index = map.get(ref);
      if (index === undefined) {
        const p = ref.split('/');
        const vi = resolveIndex(+p[0], positions.length / 3);
        const ti = p[1] ? resolveIndex(+p[1], uvs.length / 2) : -1;
        const ni = p[2] ? resolveIndex(+p[2], normals.length / 3) : -1;

        index = outPos.length / 3;
        map.set(ref, index);

        outPos.push(positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]);
        if (ni >= 0) {
          outNorm.push(normals[ni * 3], normals[ni * 3 + 1], normals[ni * 3 + 2]);
        } else if (normals.length) {
          outNorm.push(0, 1, 0);
        }
        if (ti >= 0) {
          outUv.push(uvs[ti * 2], uvs[ti * 2 + 1]);
        } else if (uvs.length) {
          outUv.push(0, 0);
        }
      }
      indices.push(index);
    }

    function resolveIndex(n, count) {
      return n >= 0 ? n - 1 : count + n;
    }
  }

  /* ======================================================================
     INQUADRATURA
     La distanza della camera è l'unica cosa che cambia col formato dello
     schermo. La scala del modello non si tocca mai.
     ====================================================================== */
  function resize() {
    if (!renderer || disposed) return;

    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);

    const wanted = lowTier
      ? SETTINGS.render.pixelRatioMobile
      : SETTINGS.render.pixelRatioDesktop;
    // `qualityScale` vale 1 finché il computer tiene il passo (vedi in cima).
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, wanted * qualityScale));
    renderer.setSize(w, h, false);

    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;

    // Tetto: il modello non supera mai HEIGHT_FACTOR volte l'altezza.
    const distanceForHeight = MODEL_WORLD_HEIGHT / (2 * Math.tan(halfFov) * HEIGHT_FACTOR);

    /* Distanza che dà alla sagoma la larghezza voluta.
       Desktop: si misura la posa a riposo, quella delle tavole.
       Mobile:  si misura la rotazione peggiore, perché lì il modello gira
                col dito e non deve mai diventare più largo del previsto. */
    const onMobile = narrow.matches;
    const width = onMobile ? modelMaxWidth() : modelRestWidth();
    const factor = onMobile ? MOBILE_WIDTH_FACTOR : DESKTOP_WIDTH_FACTOR;
    const distanceForWidth = (width * h) / (2 * Math.tan(halfFov) * factor * w);

    const distance = Math.max(distanceForHeight, distanceForWidth);

    // Quanti pixel vale un'unità di scena: serve al sito per sapere quanto
    // spazio occupa davvero la sagoma (vedi projectedHalfWidth).
    pixelsPerWorldUnit = h / (2 * Math.tan(halfFov) * distance);

    camera.aspect = w / h;
    camera.position.set(0, 0.1 * (distance / 6), distance);
    camera.lookAt(0, 0, 0);

    applyViewOffset(w, h);
  }

  /* Larghezza proiettata massima: la diagonale dell'impronta sul piano XZ. */
  function modelMaxWidth() {
    if (!geometry || !geometry.boundingBox) return 4;
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const scaleFactor = MODEL_WORLD_HEIGHT / (size.y || 1);
    return Math.hypot(size.x, size.z) * scaleFactor;
  }

  /* Larghezza proiettata nella posa iniziale: è la sagoma che si misura sulle
     tavole, e quella su cui è tarato DESKTOP_WIDTH_FACTOR. */
  function modelRestWidth() {
    if (!geometry || !geometry.boundingBox) return 3.4;
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const scaleFactor = MODEL_WORLD_HEIGHT / (size.y || 1);
    const w = Math.abs(size.x * Math.cos(INITIAL_YAW));
    const d = Math.abs(size.z * Math.sin(INITIAL_YAW));
    return (w + d) * scaleFactor;
  }

  /* setViewOffset sposta la finestra di rendering dentro un'immagine
     virtuale più grande: è il modo più economico di traslare il modello,
     perché il canvas resta grande quanto la viewport. */
  function applyViewOffset(w, h) {
    if (!camera) return;
    const centerX = currentCenterX === null ? w / 2 : currentCenterX;
    camera.setViewOffset(w, h, w / 2 - centerX, 0, w, h);
    camera.updateProjectionMatrix();
  }

  /* ======================================================================
     INTERAZIONE
     ====================================================================== */
  function onPointerDown(event) {
    if (event.pointerType !== 'mouse') return;
    activePointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function onPointerMove(event) {
    if (event.pointerType !== 'mouse') return;
    if (lastX === null) {
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    applyPointerDelta(event.clientX - lastX, event.clientY - lastY);
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function onPointerEnd(event) {
    if (event.pointerId === activePointerId) activePointerId = null;
  }

  function applyPointerDelta(dx, dy) {
    targetYaw += dx * YAW_PER_PIXEL;
    targetPitch = THREE.MathUtils.clamp(
      targetPitch + dy * PITCH_PER_PIXEL,
      -PITCH_LIMIT,
      PITCH_LIMIT
    );
    needsRender = true;
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      needsRender = true;
      if (!rafId && !disposed) loop();
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function onContextRestored() {
    needsRender = true;
    if (!rafId && !disposed) loop();
  }

  /* ======================================================================
     LOOP
     Si disegna solo quando qualcosa si è mosso: a riposo il telefono resta
     freddo anche se il modello è sotto al testo che stai leggendo.
     ====================================================================== */
  function loop() {
    rafId = requestAnimationFrame(loop);
    if (disposed || document.visibilityState === 'hidden') {
      lastFrameAt = 0;
      return;
    }

    let moving = false;

    if (model) {
      if (reducedMotion) {
        currentYaw = targetYaw;
        currentPitch = targetPitch;
      } else {
        currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, ROTATION_EASE);
        currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, ROTATION_EASE);
      }

      if (
        Math.abs(currentYaw - targetYaw) > 1e-4 ||
        Math.abs(currentPitch - targetPitch) > 1e-4
      ) {
        moving = true;
      }

      model.rotation.y = currentYaw;
      model.rotation.x = currentPitch;
      if (edgeGlow) {
        edgeGlow.rotation.y = currentYaw;
        edgeGlow.rotation.x = currentPitch;
      }
    }

    if (targetCenterX !== null && currentCenterX !== targetCenterX) {
      if (currentCenterX === null || reducedMotion) {
        currentCenterX = targetCenterX;
      } else {
        currentCenterX += (targetCenterX - currentCenterX) * OFFSET_EASE;
        if (Math.abs(targetCenterX - currentCenterX) <= 0.25) {
          currentCenterX = targetCenterX;
        } else {
          moving = true;
        }
      }
      applyViewOffset(container.clientWidth, container.clientHeight);
    }

    if (!moving && !needsRender) {
      lastFrameAt = 0; // fermi: il prossimo disegno comincia una corsa nuova
      return;
    }
    needsRender = false;
    renderer.render(scene, camera);
    if (moving) watchFrameRate();
    else lastFrameAt = 0;
  }

  /* Si misura solo DENTRO una corsa: due fotogrammi consecutivi disegnati
     perché il modello si sta muovendo. Fuori da lì un tempo lungo non è
     lentezza — è che non c'era niente da disegnare — e infatti `lastFrameAt`
     viene azzerato ogni volta che ci si ferma o la scheda passa in secondo
     piano. Così un fotogramma lentissimo conta come tale invece di essere
     scambiato per una pausa. */
  function watchFrameRate() {
    const previous = lastFrameAt;
    lastFrameAt = performance.now();
    if (!previous || qualityScale <= QUALITY_FLOOR) return;

    if (lastFrameAt - previous > QUALITY_SLOW_MS) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);

    if (slowFrames >= QUALITY_PATIENCE) {
      slowFrames = 0;
      qualityScale = Math.max(QUALITY_FLOOR, qualityScale * QUALITY_STEP);
      resize();
      needsRender = true;
    }
  }

  /* ======================================================================
     ERRORI E SMONTAGGIO
     ====================================================================== */
  function fail(message) {
    if (loadingEl) loadingEl.hidden = true;
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
  }

  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch (err) {
      return false;
    }
  }

  function nullScene() {
    // Il sito deve funzionare comunque, anche senza il 3D.
    return {
      setCenterX() {},
      applyPointerDelta() {},
      projectedHalfWidth: () => 0,
      onReady() {},
      dispose() {},
    };
  }

  /* ======================================================================
     API PUBBLICA
     ====================================================================== */
  return {
    /* Dove deve trovarsi il centro del modello, in pixel dal bordo sinistro.
       Il movimento verso la posizione richiesta è ammorbidito nel loop.

       Con `immediate` il modello ci si mette subito, senza ammorbidimento:
       serve quando è il dito a comandarlo direttamente — la galleria del
       portfolio, il trascinamento dei pannelli — dove un ritardo si
       leggerebbe come attrito fra il dito e l'oggetto. */
    setCenterX(px, immediate) {
      targetCenterX = px;
      if (immediate) {
        currentCenterX = px;
        applyViewOffset(container.clientWidth, container.clientHeight);
      }
      needsRender = true;
    },

    /* Rotazione da un gesto touch: la passa js/navigation.js quando il dito
       non sta già servendo a navigare o a scorrere. */
    applyPointerDelta,

    /* Mezza larghezza della sagoma in pixel, presa nella rotazione PEGGIORE —
       quella in cui il quadrato delle lastre si presenta di spigolo. Il sito
       la usa per garantire che il modello non finisca mai sotto al testo,
       qualunque sia la posa in cui l'utente lo lascia. */
    projectedHalfWidth() {
      if (!model || !pixelsPerWorldUnit) return 0;
      return (modelMaxWidth() * pixelsPerWorldUnit) / 2;
    },

    /* Il modello arriva dopo il resto della pagina. Chi ha bisogno delle sue
       misure si prenota qui e viene richiamato quando esistono davvero. */
    onReady(fn) {
      if (ready) fn();
      else readyWaiting.push(fn);
    },

    dispose() {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();

      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      }

      // model e edgeGlow condividono la stessa geometria: si libera una volta.
      if (geometry) geometry.dispose();
      if (glassMaterial) glassMaterial.dispose();
      if (fresnelMaterial) fresnelMaterial.dispose();
      if (envRenderTarget) envRenderTarget.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
    },
  };
}
