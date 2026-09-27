/* ============================================================
   Vue Palmarès — badges débloqués / à débloquer.
   ============================================================ */

const PalmaresView = (() => {
  function render(el) {
    const p = Store.getActiveProfile();
    if (!p) {
      el.innerHTML = `<div class="panel center"><p>Crée d'abord un profil.</p><a class="btn btn-primary" href="#/profils">Profils</a></div>`;
      return;
    }
    const got = new Set(Store.getAchievements());

    el.innerHTML = `
      <h1>Palmarès <span class="count-tag">${got.size}/${Scoring.ACHIEVEMENTS.length}</span></h1>
      <div class="achv-grid">
        ${Scoring.ACHIEVEMENTS.map((a) => `
          <div class="achv ${got.has(a.id) ? "got" : "locked"}">
            <div class="achv-icon">${a.icon}</div>
            <div class="achv-name">${a.name}</div>
            <div class="achv-desc">${a.desc}</div>
          </div>`).join("")}
      </div>`;
  }

  return { render };
})();
