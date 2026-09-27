/* ============================================================
   Vue Profils — multi-profils locaux (leaderboard partagé
   sur l'appareil). Création, sélection, renommage, suppression.
   ============================================================ */

const ProfilsView = (() => {
  function render(el) {
    const profiles = Store.getProfiles();
    const active = Store.getActiveProfile();

    el.innerHTML = `
      <h1>Profils</h1>
      <div class="panel">
        ${profiles.map((p) => {
          const st = Store.profileStats(p.id);
          return `
          <div class="profile-row ${p.id === (active && active.id) ? "active" : ""}">
            <span class="profile-avatar">${UI.esc(p.avatar)}</span>
            <div class="profile-info">
              <b>${UI.esc(p.name)}</b>
              <span class="dim">${st.score} pts · ${st.count} spots</span>
            </div>
            ${p.id === (active && active.id)
              ? `<span class="ok-block">Actif</span>`
              : `<button class="btn btn-small" data-use="${p.id}">Utiliser</button>`}
            <button class="btn btn-small btn-danger" data-del="${p.id}">✕</button>
          </div>`;
        }).join("") || `<p class="empty">Aucun profil — crée le tien.</p>`}
      </div>

      <div class="panel">
        <h2>Nouveau profil</h2>
        <div class="avatar-row" id="avatars">
          ${Store.AVATARS.map((a, i) => `<button class="avatar-pick ${i === 0 ? "on" : ""}" data-a="${a}">${a}</button>`).join("")}
        </div>
        <input class="input" id="new-name" placeholder="Pseudo du spotter" maxlength="24">
        <button class="btn btn-primary" id="create">Créer le profil</button>
      </div>`;

    let avatar = Store.AVATARS[0];
    el.querySelectorAll(".avatar-pick").forEach((b) => {
      b.onclick = () => {
        el.querySelectorAll(".avatar-pick").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        avatar = b.dataset.a;
      };
    });

    el.querySelector("#create").onclick = () => {
      const name = el.querySelector("#new-name").value.trim();
      if (!name) return UI.toast("Donne un pseudo", "err");
      Store.createProfile(name, avatar);
      UI.toast(`Profil ${name} créé`, "ok");
      render(el);
    };

    el.querySelectorAll("[data-use]").forEach((b) => {
      b.onclick = () => {
        Store.setActiveProfile(b.dataset.use);
        render(el);
      };
    });

    el.querySelectorAll("[data-del]").forEach((b) => {
      b.onclick = () => {
        const p = profiles.find((x) => x.id === b.dataset.del);
        const m = UI.modal(`
          <h3>Supprimer ${UI.esc(p.name)} ?</h3>
          <p>Ses spots, photos et points seront effacés de cet appareil.</p>
          <div class="row-gap"><button class="btn" id="c">Annuler</button>
          <button class="btn btn-danger" id="k">Supprimer</button></div>`);
        m.el.querySelector("#c").onclick = m.close;
        m.el.querySelector("#k").onclick = async () => {
          for (const s of Store.getSpotsOf(p.id)) await Photos.del(s.photoId);
          m.close();
          Store.deleteProfile(p.id);
          UI.toast("Profil supprimé", "ok");
          render(el);
        };
      };
    });
  }

  return { render };
})();
