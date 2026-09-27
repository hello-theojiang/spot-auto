/* ============================================================
   Vue Légal — CGU et Mentions légales (placeholders éditeur à
   personnaliser : [NOM ÉDITEUR], [EMAIL], [HÉBERGEUR]).
   ============================================================ */

const LegalView = (() => {
  const PAGES = {
    "mentions-legales": {
      title: "Mentions légales",
      body: `
        <h2>Éditeur de l'application</h2>
        <p><b>OpenSpotAuto</b> — application de « car spotting » développée à titre personnel.<br>
        Éditeur : <b>[NOM DE L'ÉDITEUR]</b><br>
        Contact : <b>[EMAIL DE CONTACT]</b></p>

        <h2>Hébergement</h2>
        <p>L'application web est hébergée par <b>[HÉBERGEUR]</b>. La version Android fonctionne en local sur l'appareil.</p>

        <h2>Propriété intellectuelle</h2>
        <p>L'ensemble des éléments de l'application (interface, catalogue, textes) est la propriété de l'éditeur, sauf mentions contraires. Les noms de marques et modèles automobiles cités appartiennent à leurs dépositaires respectifs et sont utilisés uniquement à des fins d'identification.</p>

        <h2>Données personnelles</h2>
        <p><b>OpenSpotAuto fonctionne 100 % en local</b> : photos, scores, profils et positions GPS restent sur votre appareil et ne sont transmis à aucun serveur.</p>
        <p>Exception optionnelle : si vous saisissez une clé API Gemini et utilisez « Identifier avec l'IA », la photo capturée est alors envoyée à l'API Google pour identification. Ce traitement est couvert par les conditions de Google AI Studio.</p>
        <p>La géolocalisation n'est relevée qu'au moment d'une capture, avec votre consentement, et stockée localement avec la photo.</p>
        <p>Conformément au RGPD, vous pouvez supprimer à tout moment vos données depuis les Réglages (réinitialisation) ou en supprimant l'application.</p>

        <h2>Responsabilité</h2>
        <p>L'application est fournie « en l'état ». L'éditeur ne saurait être tenu responsable de l'usage fait de l'application ni des dommages directs ou indirects liés à son utilisation.</p>`,
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      body: `
        <h2>1. Objet</h2>
        <p>OpenSpotAuto permet de photographier des voitures dans l'espace public, d'attribuer à chaque spot un score basé sur la rareté du modèle (catalogue intégré), et de gérer un palmarès et un classement entre profils locaux.</p>

        <h2>2. Règles d'utilisation</h2>
        <ul>
          <li>Photographier uniquement des véhicules dans l'<b>espace public</b>, sans intrusion sur des propriétés privées.</li>
          <li>Respecter la vie privée : éviter de cadrer des personnes identifiables et, selon la législation locale, les plaques d'immatriculation si vous partagez vos photos.</li>
          <li>Ne jamais mettre en danger votre sécurité ni celle des autres (pas de capture au volant, respect du code de la route).</li>
          <li>Ne pas tenter de contourner les mécanismes anti-triche (capture live, vivacité, registre chaîné).</li>
        </ul>

        <h2>3. Scores et palmarès</h2>
        <p>Les points, tiers de rareté et badges ont une valeur purement ludique, sans contrepartie financière. Le classement est local à l'appareil ; aucune compétition en ligne n'est organisée.</p>

        <h2>4. Données</h2>
        <p>Vos photos et données restent sur votre appareil (voir Mentions légales). L'option d'identification IA transmet la photo au service configuré par vos soins.</p>

        <h2>5. Limitation de responsabilité</h2>
        <p>Les mécanismes anti-triche sont fournis à titre de « meilleur effort » : sans serveur de vérification, une falsification sophistiquée reste possible. L'éditeur ne garantit pas l'exactitude des tiers de rareté, qui sont indicatifs et subjectifs.</p>

        <h2>6. Modification des CGU</h2>
        <p>L'éditeur peut modifier les présentes CGU à tout moment ; la version en vigueur est celle affichée dans l'application.</p>`,
    },
  };

  function render(el, [page]) {
    const p = PAGES[page] || PAGES["mentions-legales"];
    el.innerHTML = `
      <div class="legal-tabs">
        <a class="chip ${page === "cgu" ? "" : "on"}" href="#/legal/mentions-legales">Mentions légales</a>
        <a class="chip ${page === "cgu" ? "on" : ""}" href="#/legal/cgu">CGU</a>
      </div>
      <div class="panel legal">
        <h1>${p.title}</h1>
        ${p.body}
      </div>`;
  }

  return { render };
})();
