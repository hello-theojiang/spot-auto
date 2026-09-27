/* ============================================================
   Vue Classement — leaderboard local entre les profils
   de l'appareil (score total, spots, meilleur tier).
   ============================================================ */

const ClassementView = (() => {
  function render(el) {
    const board = Store.leaderboard();
    const active = Store.getActiveProfile();

    const medals = ["🥇", "🥈", "🥉"];

    el.innerHTML = `
      <h1>Classement</h1>
      ${board.length === 0 ? `<div class="panel center"><p>Aucun spotter. <a href="#/profils">Créer un profil</a></p></div>` : ""}
      <div class="board">
        ${board.map((r, i) => {
          const best = r.bestTier >= 0 ? TIERS[r.bestTier] : null;
          return `
          <div class="board-row ${r.profile.id === (active && active.id) ? "me" : ""} ${i === 0 && r.score > 0 ? "top" : ""}">
            <span class="board-rank">${medals[i] || i + 1}</span>
            <span class="board-avatar">${UI.esc(r.profile.avatar)}</span>
            <span class="board-name">${UI.esc(r.profile.name)}</span>
            <span class="board-sub">${r.count} spots · ${r.models} modèles</span>
            ${best ? `<span class="tier-chip tier-${best.id}">${best.short}</span>` : ""}
            <span class="board-score">${r.score}</span>
          </div>`;
        }).join("")}
      </div>
      <p class="hint center">Classement local à cet appareil — ajoute des profils pour défier des amis sur le même téléphone.</p>`;
  }

  return { render };
})();
