/* ==========================================================================
   FORM DI CONTATTO
   --------------------------------------------------------------------------
   >>> DA CONFIGURARE: incolla qui sotto l'indirizzo del servizio. <<<

   Il form è già completo e funzionante: validazione, stato di invio, esito
   positivo e negativo. Gli manca solo dove mandare il messaggio.

   COME COLLEGARLO (dieci minuti, gratis, nessun server da mantenere)

   --- STRADA A: Formspree (consigliata) ---------------------------------
   1. Vai su https://formspree.io e registrati con samuelemarini98@gmail.com
   2. "New form". Ti dà un indirizzo tipo https://formspree.io/f/abcdwxyz
   3. Incollalo qui sotto in ENDPOINT. ACCESS_KEY resta vuoto.
   4. Conferma l'email che ti arriva: senza quel passaggio i messaggi non
      partono.
   Gratis fino a 50 messaggi al mese.

   --- STRADA B: Web3Forms (senza registrarsi) ---------------------------
   1. Vai su https://web3forms.com, scrivi la tua email, ricevi una chiave.
   2. ENDPOINT   = 'https://api.web3forms.com/submit'
      ACCESS_KEY = la chiave ricevuta.
   Gratis fino a 250 messaggi al mese.

   NON SONO PASSWORD. Sia l'indirizzo sia la chiave sono fatti per stare
   nell'HTML di una pagina pubblica, come un numero di telefono su un
   biglietto da visita: servono solo a recapitare, non ad aprire niente.

   Il campo nascosto `_gotcha` resta: è la trappola per i robot che
   compilano i moduli in automatico. Un umano non lo vede e non lo riempie.
   ========================================================================== */

const ENDPOINT = 'https://formspree.io/f/mjykapdo';
const ACCESS_KEY = ''; // solo per la strada B

export function initForm(form, statusEl) {
  if (!form) return;

  if (!ENDPOINT) {
    console.warn(
      '[form] Nessun endpoint configurato. Apri js/form.js e segui le istruzioni in cima al file.'
    );
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = form.querySelector('.contact__send');
    const data = new FormData(form);

    // Trappola anti-spam: è un campo invisibile, un umano non lo compila mai.
    if (data.get('_gotcha')) return;
    data.delete('_gotcha');

    if (!ENDPOINT) {
      setStatus(statusEl, 'error', 'Il form non è ancora collegato. Vedi js/form.js.');
      return;
    }

    /* Web3Forms vuole la chiave insieme al messaggio; Formspree no, e un
       campo in più non gli dà fastidio. L'oggetto dell'email lo scriviamo
       noi: senza, arriva una riga anonima fra tutte le altre. */
    if (ACCESS_KEY) data.set('access_key', ACCESS_KEY);
    data.set('subject', `Messaggio dal sito — ${data.get('nome') || 'senza nome'}`);

    setStatus(statusEl, 'pending', 'Invio in corso…');
    if (button) button.disabled = true;

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      form.reset();
      setStatus(statusEl, 'ok', 'Messaggio inviato. Grazie.');
    } catch (err) {
      console.error(err);
      setStatus(
        statusEl,
        'error',
        'Invio non riuscito. Scrivimi a samuelemarini98@gmail.com'
      );
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function setStatus(el, state, message) {
  if (!el) return;
  el.dataset.state = state;
  el.textContent = message;
}
