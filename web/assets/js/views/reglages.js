/* ============================================================
   Vue Réglages — cooldown, clé IA, intégrité du registre,
   informations anti-triche, réinitialisation.
   ============================================================ */

const ReglagesView = (() => {
  function render(el) {
    const s = Store.getSettings();
    const p = Store.getActiveProfile();

    el.innerHTML = `
      <h1>Réglages</h1>

      <div class="panel">
        <h2>Identification IA (optionnel)</h2>
        <p class="hint">Colle une clé <b>Gemini</b> gratuite (Google AI Studio) pour identifier automatiquement la voiture sur la photo. Sans clé → sélection manuelle au catalogue. La clé reste stockée sur cet appareil.</p>
        <input class="input" id="gemini-key" type="password" placeholder="Clé API Gemini" value="${UI.esc(s.geminiKey)}">
        <div class="row-gap">
          <button class="btn" id="save-key">Enregistrer la clé</button>
          <a class="btn" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Obtenir une clé ↗</a>
        </div>
      </div>

      <div class="panel">
        <h2>Anti-triche</h2>
        <label class="field">
          <span>Cooldown entre captures</span>
          <select class="input" id="cooldown">
            ${[10, 30, 60, 120, 300].map((v) => `<option value="${v}" ${s.cooldownSec === v ? "selected" : ""}>${v} s</option>`).join("")}
          </select>
        </label>
        <ul class="shield-list">
          <li>${UI.icon("shield")} Capture live uniquement — aucun import de photo</li>
          <li>${UI.icon("shield")} Détection de vivacité : la scène filmée doit bouger</li>
          <li>${UI.icon("shield")} Hash perceptuel : les doublons sont rejetés</li>
          <li>${UI.icon("shield")} Registre chaîné SHA-256 : falsification détectable</li>
          <li>${UI.icon("shield")} Cohérence GPS et horodatage vérifiées</li>
        </ul>
        ${p ? `<button class="btn" id="verify">${UI.icon("shield")} Vérifier l'intégrité de mes spots</button><div id="verify-out"></div>` : ""}
      </div>

      <div class="panel">
        <h2>Accessibilité</h2>
        <label class="field">
          <span>Réduire les animations holographiques</span>
          <input type="checkbox" id="motion" ${s.reduceMotion ? "checked" : ""}>
        </label>
      </div>

      <div class="panel">
        <h2>Catalogue</h2>
        <p class="hint" id="cat-stats"></p>
      </div>

      <div class="panel danger-zone">
        <h2>Zone dangereuse</h2>
        ${p ? `<button class="btn btn-danger" id="reset">Réinitialiser toutes mes données</button>` : `<p class="hint">Aucun profil actif.</p>`}
      </div>`;

    el.querySelector("#save-key").onclick = () => {
      Store.setSettings({ geminiKey: el.querySelector("#gemini-key").value.trim() });
      UI.toast("Clé enregistrée", "ok");
    };
    el.querySelector("#cooldown").onchange = (e) => {
      Store.setSettings({ cooldownSec: +e.target.value });
      UI.toast("Cooldown mis à jour", "ok");
    };
    el.querySelector("#motion").onchange = (e) => {
      Store.setSettings({ reduceMotion: e.target.checked });
      document.body.classList.toggle("reduce-motion", e.target.checked);
    };

    const st = Catalog.stats();
    el.querySelector("#cat-stats").textContent =
      `${st.brands} marques · ${st.models} modèles référencés · ` +
      TIERS.map((t) => `${st.byTier[t.id]} ${t.label}`).join(" · ");

    const verifyBtn = el.querySelector("#verify");
    if (verifyBtn) {
      verifyBtn.onclick = async () => {
        verifyBtn.disabled = true;
        const broken = await AntiCheat.verifyLedger(Store.getSpots());
        el.querySelector("#verify-out").innerHTML = broken.length
          ? `<p class="warn-block">${UI.icon("warn")} ${broken.length} spot(s) ne correspondent pas au registre — données modifiées ?</p>`
          : `<p class="ok-block">${UI.icon("shield")} Registre intègre — ${Store.getSpots().length} spot(s) vérifié(s).</p>`;
        verifyBtn.disabled = false;
      };
    }

    const reset = el.querySelector("#reset");
    if (reset) {
      reset.onclick = () => {
        const m = UI.modal(`
          <h3>Tout réinitialiser ?</h3>
          <p>Efface spots, photos, points et palmarès de <b>${UI.esc(p.name)}</b>. Irréversible.</p>
          <div class="row-gap"><button class="btn" id="c">Annuler</button>
          <button class="btn btn-danger" id="k">Réinitialiser</button></div>`);
        m.el.querySelector("#c").onclick = m.close;
        m.el.querySelector("#k").onclick = async () => {
          for (const sp of Store.getSpots()) await Photos.del(sp.photoId);
          Store.getSpots().slice().forEach((sp) => Store.removeSpot(sp.id));
          m.close();
          UI.toast("Données réinitialisées", "ok");
          location.hash = "#/accueil";
        };
      };
    }
  }

  return { render };
})();
