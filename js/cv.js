/* ==========================================================================
   CV
   Impagina js/data/cv-data.js dentro la colonna della sezione CV.
   Le etichette sono in maiuscolo dello stesso corpo del testo: la gerarchia
   nasce dal maiuscolo e dallo spazio, come nelle tavole.
   ========================================================================== */

import { cv } from './data/cv-data.js';

export function renderCV(root) {
  if (!root) return;

  const out = document.createDocumentFragment();

  // --- intestazione --------------------------------------------------------
  out.append(
    el('h2', 'cv__title', cv.title),
    el('p', 'cv__tagline body-text', cv.tagline)
  );

  const contact = el('p', 'cv__contact body-text');
  contact.append(document.createTextNode(cv.contact + ' · '));
  const mail = el('a', 'underlined', cv.email);
  mail.href = `mailto:${cv.email}`;
  contact.appendChild(mail);
  out.appendChild(contact);

  // --- sezioni -------------------------------------------------------------
  cv.sections.forEach((section) => {
    const block = el('section', 'cv__section');
    block.appendChild(el('h3', 'cv__section-label body-text', section.label));

    section.entries.forEach((entry) => {
      const item = el('div', 'cv__entry');
      if (entry.title) item.appendChild(el('h4', 'cv__entry-title', entry.title));
      if (entry.meta) item.appendChild(el('p', 'cv__entry-meta body-text', entry.meta));
      if (entry.text) item.appendChild(el('p', 'cv__entry-text body-text', entry.text));
      block.appendChild(item);
    });

    out.appendChild(block);
  });

  // --- competenze digitali, su due colonne come nel PDF --------------------
  const skills = el('section', 'cv__section');
  skills.appendChild(el('h3', 'cv__section-label body-text', cv.skills.label));
  const grid = el('div', 'cv__skills');
  cv.skills.groups.forEach((group) => {
    const cell = el('div');
    cell.append(
      el('p', 'cv__skill-group-label body-text', group.label),
      el('p', 'body-text', group.items)
    );
    grid.appendChild(cell);
  });
  skills.appendChild(grid);
  out.appendChild(skills);

  // --- chiusura ------------------------------------------------------------
  cv.closing.forEach((entry) => {
    const block = el('section', 'cv__section');
    block.append(
      el('h3', 'cv__section-label body-text', entry.label),
      el('p', 'cv__entry-text body-text', entry.text)
    );
    out.appendChild(block);
  });

  root.replaceChildren(out);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
