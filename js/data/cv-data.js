/* ==========================================================================
   CONTENUTO DEL CV
   --------------------------------------------------------------------------
   Fonte: references/CV_Samuele_Marini_2026.pdf — trascritto fedelmente.
   Nessuna informazione è stata aggiunta o dedotta.

   Non compaiono data di nascita, indirizzo di residenza e stato civile:
   non sono nel PDF 2026 e la specifica esclude l'indirizzo privato dal sito.

   Per aggiornare il CV si modifica solo questo file.
   ========================================================================== */

export const cv = {
  title: 'Curriculum Vitae',
  name: 'Samuele Marini',
  tagline:
    'Designer in formazione · Progettazione prodotto e comunicazione · Background tecnico',
  contact: 'Fossombrone (PU) · 338 748 3955 · Patente B',
  email: 'samuelemarini98@gmail.com',

  sections: [
    {
      label: 'Profilo',
      entries: [
        {
          text: "Designer in formazione con background tecnico nella progettazione e nella produzione industriale. Dopo diversi anni di esperienza nella progettazione meccanica e nell'arredamento su misura, dal 2024 approfondisco il design del prodotto e della comunicazione presso l'Università degli Studi della Repubblica di San Marino. Unisco progettazione 2D/3D, conoscenze tecniche e sensibilità visiva, con un approccio orientato alla realizzazione concreta del progetto.",
        },
      ],
    },

    {
      label: 'Esperienze professionali',
      entries: [
        {
          title: 'Responsabile di commessa · Gitaly Contract',
          meta: '06/2023 – 05/2024',
          text: "Progettazione 2D con AutoCAD e gestione delle commesse di arredo. Coordinamento di artigiani e imprese terziste nel rispetto del budget, raccolta di schede tecniche dei materiali, supporto in officina per assemblaggio e prove degli arredi, sopralluoghi e gestione delle squadre di montaggio in cantiere.",
        },
        {
          title: 'Impiegato tecnico · Nauticoliver',
          meta: '06/2018 – 06/2023',
          text: "Progettazione 2D e 3D di porte stagne per imbarcazioni di lusso con AutoCAD e Pro/ENGINEER. Collaborazione con l'officina per la lettura e comprensione dei disegni, sviluppo del progetto e realizzazione di calcoli e disegni di approvazione per Lloyd's.",
        },
        {
          title: 'Impiegato tecnico / operaio · Enomet Impianti',
          meta: '02/2018 – 06/2018',
          text: 'Progettazione, montaggio e lavorazione di componenti per macchine destinate a impianti enologici. Utilizzo di SolidWorks e AutoCAD e programmazione della macchina per il taglio laser.',
        },
        {
          title: 'Operaio · LC Mobili',
          meta: '11/2017 – 02/2018',
          text: 'Montaggio e imballaggio di mobili all’interno della catena di produzione.',
        },
        {
          title: 'Cameriere · Christina Pates et Pizza · Francia',
          meta: '08/2017 – 10/2017',
          text: "Prima esperienza lavorativa dopo il diploma, svolta a Parigi/Sevran. Esperienza all'estero maturata in giovane età, con l'obiettivo di uscire dal contesto abituale e confrontarmi con un ambiente nuovo.",
        },
        {
          title: 'Disegnatore AutoCAD / segretario · L. M. Immobiliare · Ufficio termotecnico',
          meta: '07/2016 – 09/2016',
          text: 'Disegno tecnico di impianti a gas e impianti termici per edifici e abitazioni, con approfondimento delle relative normative antincendio.',
        },
      ],
    },

    {
      label: 'Formazione',
      entries: [
        {
          title:
            'Laurea triennale in Design della Comunicazione e Industriale · Università degli Studi della Repubblica di San Marino',
          meta: '2024 – in corso',
          text: 'Percorso orientato al design del prodotto, alla comunicazione visiva e alla progettazione, attraverso ricerca, modellazione, rappresentazione, prototipazione e strumenti digitali.',
        },
        {
          title: 'Diploma di Meccanica e Meccatronica · ITIS E. Mattei, Urbino',
          meta: '2017',
          text: 'Diploma di scuola secondaria superiore · voto 82/100.',
        },
      ],
    },

    {
      label: 'Formazione tecnica',
      entries: [
        {
          title: 'Star.pro srls',
          meta: '12/2018 – 07/2019',
          text: "Training teorico-pratico in automazione industriale e robotica, svolto parallelamente all'attività lavorativa. Formazione su CAD 2D/3D, CAD/CAM, CNC, elettropneumatica, sensoristica e sistemi PLC Siemens.",
        },
        {
          title: 'Certificazione CETOP',
          meta: '2016',
          text: 'Pneumatica, Istituto Professionale G. Benelli, Pesaro.',
        },
      ],
    },
  ],

  /* Le competenze digitali sono impaginate su due colonne, come nel PDF. */
  skills: {
    label: 'Competenze digitali',
    groups: [
      { label: 'Product / 3D', items: 'Rhinoceros · Fusion 360 · KeyShot' },
      {
        label: 'Grafica / comunicazione',
        items: 'Photoshop · Illustrator · InDesign · Figma',
      },
      { label: 'Motion / video', items: 'After Effects · Premiere Pro' },
      { label: 'CAD / tecnico', items: 'AutoCAD · SolidWorks · Pro/ENGINEER' },
    ],
  },

  closing: [
    { label: 'Lingue', text: 'Inglese e francese · conoscenza di base/intermedia.' },
    {
      label: 'Disponibilità',
      text: 'Disponibile a trasferte in territorio nazionale e internazionale.',
    },
  ],
};
