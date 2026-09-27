/* ==========================================================================
   PRIVACY POLICY
   --------------------------------------------------------------------------
   Il testo della pagina che si apre dal link sotto SEND, nei Contatti.
   Si apre come una pagina progetto (js/project.js): stessa scheda, stesso
   triangolo per tornare indietro, stesso swipe su telefono.

   Descrive SOLO quello che il sito fa davvero:
   - il modulo contatti invia nome, e-mail e messaggio a Formspree
     (js/form.js), che li inoltra alla casella Gmail;
   - il sito è ospitato su GitHub Pages;
   - nessun cookie, nessuna statistica, nessun contenuto incorporato:
     caratteri e modello 3D sono file del sito stesso.
   Se un giorno si aggiunge uno di questi servizi, va aggiornato anche qui.

   Ogni sezione ha un titolo (`label`) e uno o più paragrafi (`text`).
   Gli indirizzi e-mail e web scritti nel testo diventano link da soli.
   ========================================================================== */

export const privacy = {
  title: 'Privacy Policy',
  updated: 'Ultimo aggiornamento: 27 settembre 2026',

  intro: [
    'Questa informativa descrive come vengono trattati i dati personali di chi visita questo sito e di chi mi contatta, ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR).',
  ],

  sections: [
    {
      label: 'Titolare del trattamento',
      text: [
        'Samuele Marini, Fossombrone (PU), Italia. Per qualsiasi richiesta sui tuoi dati puoi scrivermi a samuelemarini98@gmail.com.',
      ],
    },
    {
      label: 'Quali dati tratto',
      text: [
        'Modulo contatti: nome, indirizzo e-mail e testo del messaggio che scegli di inviarmi.',
        'Contatto diretto: se mi scrivi via e-mail o mi telefoni, i dati che mi comunichi in quel momento.',
        'Dati tecnici di navigazione: il sito è ospitato su GitHub Pages. Per rendere disponibili le pagine, il fornitore (GitHub, Inc.) può registrare dati tecnici come l’indirizzo IP del visitatore. Non ho accesso a questi dati e non li utilizzo.',
      ],
    },
    {
      label: 'Perché e su quale base',
      text: [
        'Uso i dati solo per rispondere al tuo messaggio e gestire l’eventuale contatto che ne segue, anche in vista di una collaborazione. La base giuridica è l’esecuzione di misure precontrattuali adottate su tua richiesta e il mio legittimo interesse a rispondere alle comunicazioni ricevute (art. 6, par. 1, lett. b e f, GDPR).',
        'Il conferimento è facoltativo, ma senza nome, e-mail e messaggio non è possibile inviare il modulo né ricevere una risposta.',
      ],
    },
    {
      label: 'Come vengono trattati',
      text: [
        'Il modulo viene inviato tramite Formspree (Formspree, Inc., Stati Uniti), che riceve il messaggio e lo inoltra alla mia casella e-mail, gestita con Gmail (Google). Formspree, GitHub e Google trattano i dati in qualità di fornitori, secondo le rispettive informative.',
        'I dati non vengono venduti, non vengono usati per invii promozionali o profilazione e non vengono diffusi.',
      ],
    },
    {
      label: 'Trasferimento fuori dall’Unione Europea',
      text: [
        'I fornitori indicati hanno sede negli Stati Uniti, quindi i dati possono essere trasferiti fuori dall’Unione Europea. Il trasferimento avviene sulla base degli strumenti previsti dal GDPR adottati dai fornitori, come le Clausole contrattuali standard o, dove applicabile, l’EU-U.S. Data Privacy Framework.',
      ],
    },
    {
      label: 'Per quanto tempo',
      text: [
        'Conservo i messaggi per il tempo necessario a gestire la richiesta e l’eventuale rapporto che ne segue, e comunque non oltre 24 mesi dall’ultimo contatto, salvo obblighi di legge.',
      ],
    },
    {
      label: 'Cookie',
      text: [
        'Questo sito non usa cookie, né strumenti di statistica, profilazione o pubblicità, e non integra contenuti di terze parti. I link a Instagram e LinkedIn portano a siti esterni, che hanno le proprie informative.',
      ],
    },
    {
      label: 'I tuoi diritti',
      text: [
        'Puoi chiedere in ogni momento l’accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità e opporti al trattamento (artt. 15–21 GDPR), scrivendo a samuelemarini98@gmail.com.',
        'Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
      ],
    },
    {
      label: 'Modifiche',
      text: [
        'Questa informativa può essere aggiornata. La versione in vigore è sempre quella pubblicata in questa pagina, con la data dell’ultimo aggiornamento.',
      ],
    },
  ],
};
