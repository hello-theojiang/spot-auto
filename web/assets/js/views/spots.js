/* ============================================================
   Vue Garage — toutes les photos capturées (stockées in-app),
   filtrables par tier de rareté.
   ============================================================ */

const SpotsView = (() => {
  let filter = null;

  async function render(el) {
    const p = Store.getActiveProfile();
    if (!p) {
      el.innerHTML = `<div class="panel center"><p>Crée d'abord un profil.</p><a class="btn btn-primary" href="#/profils">Profils</a></div>`;
      return;
    }

    const spots = Store.getSpots().slice().reverse();
    el.innerHTML = `
      <h1>Garage <span class="count-tag">${spots.length}</span></h1>
      <div class="filter-row">
        <button class="chip ${!filter ? "on" : ""}" data-f="">Tous</button>
        ${TIERS.map((t) => `<button class="chip tier-${t.id} ${filter === t.id ? "on" : ""}" data-f="${t.id}">${t.label}</button>`).join("")}
      </div>
      <div class="spot-grid" id="grid"></div>`;

    el.querySelectorAll(".chip").forEach((c) => {
      c.onclick = () => {
        filter = c.dataset.f || null;
        render(el);
      };
    });

    const list = filter ? spots.filter((s) => s.tier === filter) : spots;
    const grid = el.querySelector("#grid");
    if (!list.length) {
      grid.innerHTML = `<p class="empty">Aucune photo ici. <a href="#/capture">Capturer une voiture</a></p>`;
      return;
    }
    for (const s of list) {
      const url = await Photos.url(s.photoId);
      grid.insertAdjacentHTML("beforeend", UI.spotCard(s, url));
    }
  }

  function destroy() { /* rien à libérer */ }

  return { render, destroy };
})();
