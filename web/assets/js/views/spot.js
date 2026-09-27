/* ============================================================
   Vue Spot — détail d'une capture : photo, tier, points,
   métadonnées complètes (horodatage, GPS, caméra, hash…).
   ============================================================ */

const SpotView = (() => {
  async function render(el, [id]) {
    const s = Store.getSpot(id);
    if (!s) {
      el.innerHTML = `<div class="panel center"><p>Spot introuvable.</p><a class="btn" href="#/spots">Garage</a></div>`;
      return;
    }

    const t = UI.tier(s.tier);
    const url = await Photos.url(s.photoId);
    const mapsUrl = s.gps
      ? `https://www.openstreetmap.org/?mlat=${s.gps.lat}&mlon=${s.gps.lng}#map=17/${s.gps.lat}/${s.gps.lng}`
      : null;

    el.innerHTML = `
      <a class="back" href="#/spots">← Garage</a>
      <div class="panel shot-hero tier-${t.id}">
        <div class="holo-sheen"></div>
        ${url ? `<img src="${url}" alt="${UI.esc(s.brand)} ${UI.esc(s.model)}">` : `<div class="spot-noimg big">${UI.icon("car")}</div>`}
        <div class="shot-hero-band">
          <span class="tier-chip tier-${t.id} big">${t.label}</span>
          <span class="shot-pts">+${s.points} pts</span>
        </div>
      </div>

      <div class="panel">
        <h2>${UI.esc(s.brand)} ${UI.esc(s.model)}</h2>
        ${(s.bonuses || []).map((b) => `<p class="bonus-line">★ ${UI.esc(b.label)} : +${b.pts} pts</p>`).join("")}
        ${s.flags && s.flags.length ? `<p class="warn-block">${UI.icon("warn")} Signalé : ${s.flags.map(UI.esc).join(", ")}</p>` : ""}

        <table class="meta-table">
          <tr><td>${UI.icon("clock")} Capturé le</td><td>${UI.fmtDate(s.ts)}</td></tr>
          <tr><td>${UI.icon("pin")} Position</td><td>${
            s.gps
              ? `${s.gps.lat}, ${s.gps.lng} (±${s.gps.acc} m) · <a href="${mapsUrl}" target="_blank" rel="noopener">carte ↗</a>`
              : "indisponible"
          }</td></tr>
          <tr><td>${UI.icon("capture")} Image</td><td>${s.meta.w}×${s.meta.h}${s.meta.camW ? ` · capteur ${s.meta.camW}×${s.meta.camH}` : ""}${s.meta.facing ? ` · ${s.meta.facing}` : ""}</td></tr>
          <tr><td>${UI.icon("zap")} Appareil</td><td class="dim">${UI.esc(s.meta.platform || "")} · ${UI.esc((s.meta.ua || "").slice(0, 80))}…</td></tr>
          <tr><td>${UI.icon("shield")} Hash photo</td><td class="mono">${UI.esc(s.phash.slice(0, 24))}…</td></tr>
          <tr><td>${UI.icon("shield")} Empreinte registre</td><td class="mono">${UI.esc(s.digest.slice(0, 24))}…</td></tr>
        </table>

        <div class="row-gap">
          <button class="btn btn-danger" id="del">Supprimer</button>
          <a class="btn btn-primary" href="#/capture">Nouvelle capture</a>
        </div>
      </div>`;

    el.querySelector("#del").onclick = () => {
      const m = UI.modal(`
        <h3>Supprimer ce spot ?</h3>
        <p>La photo et ses ${s.points} pts seront retirés. Le registre chaîné signalera la suppression.</p>
        <div class="row-gap"><button class="btn" id="cancel">Annuler</button>
        <button class="btn btn-danger" id="ok">Supprimer</button></div>`);
      m.el.querySelector("#cancel").onclick = m.close;
      m.el.querySelector("#ok").onclick = async () => {
        await Photos.del(s.photoId);
        Store.removeSpot(s.id);
        m.close();
        location.hash = "#/spots";
      };
    };
  }

  return { render };
})();
