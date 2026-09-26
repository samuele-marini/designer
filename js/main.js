/* ==========================================================================
   AVVIO
   Mette insieme i pezzi e non fa altro. Ogni pezzo sta nel suo file:

     scene3d.js     il modello 3D
     navigation.js  macro-sezioni desktop e pannelli mobile
     gallery.js     la griglia del portfolio
     project.js     la pagina di un singolo progetto
     cv.js          il curriculum
     form.js        l'invio del modulo contatti
   ========================================================================== */

import { createScene } from './scene3d.js';
import { createNavigation } from './navigation.js';
import { renderGallery } from './gallery.js';
import { createProjectView } from './project.js';
import { renderCV } from './cv.js';
import { initForm } from './form.js';

const scene = createScene(document.getElementById('webgl'), {
  loadingEl: document.getElementById('scene-loading'),
  errorEl: document.getElementById('scene-error'),
});

/* La pagina progetto nasce vuota: si riempie solo quando se ne apre uno.
   Le passiamo la scena perché aprendo un progetto il modello fa un cenno —
   gira di pochi gradi — e chiudendo torna indietro. */
const project = createProjectView(document.getElementById('project'), { scene });

// I contenuti vengono costruiti prima della navigazione: le misure del
// modello 3D dipendono dalla posizione reale delle colonne nel DOM.
renderGallery(document.getElementById('gallery'), {
  onOpen: (item, from) => project.open(item, from),
  /* Ordine di caricamento: prima il sito (modello, ritratto, testi,
     galleria), poi — a browser libero e a priorità bassa — le prime immagini
     delle pagine progetto. Vedi prefetch() in js/project.js. */
  onReady: () => project.prefetch(),
});
renderCV(document.getElementById('cv-content'));
initForm(
  document.getElementById('contact-form'),
  document.getElementById('contact-status')
);

createNavigation({ scene, project });
