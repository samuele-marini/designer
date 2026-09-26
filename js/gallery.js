/* ==========================================================================
   GALLERIA PORTFOLIO
   Costruisce la griglia a partire da js/data/projects.js.
   Il titolo sta fuori dal flusso, sopra l'immagine: così l'immagine resta
   centrata sul nodo del reticolo, che è il principio della griglia Figma.
   ========================================================================== */

import { projects } from './data/projects.js';

/* `onOpen(project, elemento)` apre la pagina del progetto: lo passa
   js/main.js, così la galleria non deve sapere come è fatta quella pagina.
   `onReady()` viene chiamato quando le immagini della galleria sono tutte
   arrivate: da lì in poi la banda è libera per quello che viene dopo. */
export function renderGallery(root, { onOpen, onReady } = {}) {
  if (!root) return;

  const fragment = document.createDocumentFragment();
  const pending = []; // immagini da caricare dopo la Home

  projects.forEach((project) => {
    const cell = document.createElement('li');
    cell.className = `project project--${project.shape}`;

    const inner = document.createElement('div');
    inner.className = 'project__inner';

    const title = document.createElement('span');
    title.className = 'project__title';
    title.textContent = project.title;

    const media = document.createElement('div');
    media.className = 'project__media';

    if (project.image) {
      const img = document.createElement('img');
      // Il percorso si assegna più tardi, in preload(): vedi in fondo.
      img.alt = project.alt || project.title;
      img.decoding = 'async';
      pending.push([img, project.image]);

      /* L'inquadratura di ogni immagine arriva dai dati come variabili CSS:
         la regola resta nel foglio di stile (sections.css), qui passano solo
         i valori. Chi non li dichiara riceve i predefiniti. */
      if (project.fit) img.style.setProperty('--fit', project.fit);
      if (project.position) img.style.setProperty('--pos', project.position);
      if (project.zoom) img.style.setProperty('--zoom', String(project.zoom));

      media.appendChild(img);
      // Senza immagine il riquadro resta rosso: è il segnaposto.
      media.classList.add('has-image');
    }

    /* Ogni progetto con una pagina diventa un pulsante che la apre.
       Un pulsante e non un link: la pagina si apre dentro il sito, sopra la
       galleria, senza cambiare indirizzo. Il nome accessibile è il titolo. */
    if (project.slug && onOpen) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project__link project__open';
      button.setAttribute('aria-label', project.title);
      button.appendChild(media);
      button.addEventListener('click', () => onOpen(project, button));
      inner.append(title, button);
    } else if (project.url) {
      const link = document.createElement('a');
      link.className = 'project__link';
      link.href = project.url;
      link.setAttribute('aria-label', project.title);
      link.appendChild(media);
      inner.append(title, link);
    } else {
      inner.append(title, media);
    }

    cell.appendChild(inner);
    fragment.appendChild(cell);
  });

  root.replaceChildren(fragment);
  preload(pending, onReady);
}

/* LE IMMAGINI DEL PORTFOLIO PARTONO APPENA LA HOME È CARICATA.
   Non prima, per non contendere la banda alla prima schermata; non dopo,
   perché il Portfolio deve essere già pronto quando ci si arriva.

   Il caricamento pigro (loading="lazy") qui non va bene: le sezioni sono
   traslate fuori campo e la galleria scorre di lato, quindi il browser
   rimanderebbe le immagini fino all'ultimo e le si vedrebbe comparire
   durante lo swipe.

   `decode()` fa anche la decodifica in anticipo, fuori dal thread principale:
   al primo passaggio sulla galleria non c'è più lavoro da fare, e lo
   scorrimento resta fluido. Pesano in tutto circa mezzo megabyte. */
function preload(pending, onReady) {
  const start = () => {
    const all = pending.map(([img, src]) => {
      img.src = src;
      // Immagine rotta o non decodificabile: resta il riquadro nero, il
      // resto della galleria non ne risente.
      return img.decode().catch(() => {});
    });
    if (onReady) Promise.all(all).then(onReady);
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
