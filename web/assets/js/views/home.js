/* ============================================================
   Vue Accueil — tableau de bord du spotter actif.
   ============================================================ */

const HomeView = (() => {
  async function render(el) {
    const p = Store.getActiveProfile();

    if (!p) {
      el.innerHTML = `
        <div class="hero">
          <div class="hero-badge">${UI.icon("capture")}</div>
          <h1>Open<span class="holo-text">Spot</span>Auto</h1>
          <p class="hero-sub">Photographie des voitures dans la rue, grimpe les tiers de rareté, collectionne les palmarès.</p>
          <a class="btn btn-primary btn-lg" href="#/profils">Créer mon profil de spotter</a>
        </div>
        <div class="tier-legend">${legendHTML()}</div>`;
      return;
    }

    const stats = Store.profileStats(p.id);
    const spots = Store.getSpots();
    const last = spots.slice(-4).reverse();

    el.innerHTML = `
      <div class="page-head">
        <div>
          <div class="hello">${UI.esc(p.avatar)} ${UI.esc(p.name)}</div>
          <h1>Tableau de bord</h1>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="stat-num">${stats.score}</div><div class="stat-label">Score</div></div>
        <div class="stat-card"><div class="stat-num">${stats.count}</div><div class="stat-label">Spots</div></div>
        <div class="stat-card"><div class="stat-num">${stats.models}</div><div class="stat-label">Modèles</div></div>
        <div class="stat-card"><div class="stat-num">${stats.brands}</div><div class="stat-label">Marques</div></div>
      </div>

      ${stats.bestTier >= 0 ? `
      <div class="best-spot tier-${TIERS[stats.bestTier].id}">
        <div class="holo-sheen"></div>
        <div class="best-spot-label">Meilleur spot : ${TIERS[stats.bestTier].label}</div>
      </div>` : ""}

      <a class="btn btn-primary btn-lg btn-block capture-cta" href="#/capture">
        ${UI.icon("capture")} Capturer une voiture
      </a>

      <h2 class="section-title">Derniers spots</h2>
      <div class="spot-grid" id="recent-spots">
        ${last.length ? "" : `<p class="empty">Aucun spot pour l'instant. Sors, chasse, photographie.</p>`}
      </div>

      <h2 class="section-title">Tiers de rareté</h2>
      <div class="tier-legend">${legendHTML()}</div>`;

    // Charge les vignettes async
    const grid = el.querySelector("#recent-spots");
    for (const s of last) {
      const url = await Photos.url(s.photoId);
      grid.insertAdjacentHTML("beforeend", UI.spotCard(s, url));
    }
  }

  function legendHTML() {
    return TIERS.map(
      (t) => `
      <div class="tier-row tier-${t.id}">
        <div class="holo-sheen"></div>
        <span class="tier-dot"></span>
        <span class="tier-name">${t.label}</span>
        <span class="tier-pts">${t.points} pts</span>
      </div>`
    ).join("");
  }

  return { render };
})();
