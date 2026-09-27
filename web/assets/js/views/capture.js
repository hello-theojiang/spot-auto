/* ============================================================
   Vue Capture — caméra live + anti-triche + sélection du modèle
   Étapes : caméra → (vivacité OK + cooldown OK) → déclencheur
   → choix marque/modèle (catalogue ou IA) → révélation du tier.
   ============================================================ */

const CaptureView = (() => {
  let video = null;
  let liveTimer = null;
  let liveness = { diff: 0, contrast: 0 };
  let phase = "camera"; // camera | select | reveal
  let shot = null;      // {blob, phash, gps, meta, previewUrl}
  let selection = null; // {brand, model}
  let cooldownTimer = null;

  function destroy() {
    Cam.stop();
    if (liveTimer) clearInterval(liveTimer);
    if (cooldownTimer) clearInterval(cooldownTimer);
    video = null; shot = null; selection = null; phase = "camera";
  }

  function cooldownLeft() {
    const wait = Store.getSettings().cooldownSec * 1000;
    const left = Store.lastCaptureTs + wait - Date.now();
    return Math.max(0, Math.ceil(left / 1000));
  }

  const liveOK = () =>
    liveness.diff >= AntiCheat.MIN_DIFF &&
    liveness.contrast >= AntiCheat.MIN_CONTRAST;

  /* ==================== RENDU ==================== */

  function render(el) {
    el.innerHTML = `
      <h1>Capturer</h1>
      <div id="cap-stage"></div>`;
    renderStage(el.querySelector("#cap-stage"));
  }

  function renderStage(stage) {
    if (!Store.getActiveProfile()) {
      stage.innerHTML = `
        <div class="panel center">
          <p>Crée d'abord un profil spotter.</p>
          <a class="btn btn-primary" href="#/profils">Créer un profil</a>
        </div>`;
      return;
    }
    if (phase === "camera") renderCamera(stage);
    else if (phase === "select") renderSelect(stage);
    else renderReveal(stage);
  }

  /* ---------- Étape 1 : caméra ---------- */

  async function renderCamera(stage) {
    stage.innerHTML = `
      <div class="cam-shell">
        <video id="cam-video" playsinline muted autoplay></video>
        <div class="cam-hud">
          <div class="live-meter" id="live-meter">
            <span class="live-dot" id="live-dot"></span>
            <span id="live-label">Analyse de la scène…</span>
          </div>
          <div class="cam-cross"></div>
        </div>
      </div>
      <div class="cam-actions">
        <button class="btn btn-primary btn-lg shutter" id="shutter" disabled>
          ${UI.icon("capture")} Capturer
        </button>
        <p class="hint" id="shutter-hint">Vise une vraie scène — la photo d'un écran ou d'une affiche est bloquée.</p>
      </div>`;

    video = stage.querySelector("#cam-video");
    const shutter = stage.querySelector("#shutter");
    const dot = stage.querySelector("#live-dot");
    const label = stage.querySelector("#live-label");

    try {
      await Cam.start(video);
    } catch (e) {
      stage.innerHTML = `
        <div class="panel center">
          <p class="warn-block">${UI.icon("warn")} Caméra indisponible ou autorisation refusée.</p>
          <p class="hint">Sur le web, la caméra exige HTTPS ou localhost. Sur Android, autorise la caméra au lancement.</p>
          <button class="btn" id="retry">Réessayer</button>
        </div>`;
      stage.querySelector("#retry").onclick = () => renderCamera(stage);
      return;
    }

    // Boucle de vivacité (~toutes les 2,4 s)
    let sampling = false;
    const tick = async () => {
      if (!video || !video.srcObject || sampling) return;
      sampling = true;
      try {
        liveness = await AntiCheat.sampleLiveness(video, 1400);
      } catch { /* frame pas prête */ }
      sampling = false;
      updateShutter();
    };
    const updateShutter = () => {
      const cd = cooldownLeft();
      const ok = liveOK() && cd === 0;
      shutter.disabled = !ok;
      dot.className = "live-dot " + (liveOK() ? "ok" : "bad");
      if (cd > 0) {
        label.textContent = `Prochain spot dans ${cd} s`;
      } else if (!liveOK()) {
        label.textContent = liveness.contrast < AntiCheat.MIN_CONTRAST
          ? "Image trop uniforme — vise une vraie scène"
          : "La scène semble figée — bouge légèrement";
      } else {
        label.textContent = "Scène réelle détectée — feu !";
      }
    };
    tick();
    liveTimer = setInterval(tick, 1600);
    cooldownTimer = setInterval(updateShutter, 500);

    shutter.onclick = async () => {
      shutter.disabled = true;
      label.textContent = "Capture…";
      try {
        shot = await Cam.capture(video);
        shot.previewUrl = URL.createObjectURL(shot.blob);
      } catch {
        UI.toast("Échec de la capture", "err");
        updateShutter();
        return;
      }

      // Doublon perceptuel → blocage
      const flags = AntiCheat.spotFlags(
        { ts: Date.now(), gps: shot.gps, phash: shot.phash },
        Store.getSpots()
      );
      shot.flags = flags;
      if (flags.includes("photo-dupliquee")) {
        UI.toast("Photo quasi identique à un spot existant — rejetée", "err");
        shot = null;
        updateShutter();
        return;
      }
      phase = "select";
      Cam.stop();
      if (liveTimer) clearInterval(liveTimer);
      renderStage(stage);
    };
  }

  /* ---------- Étape 2 : identification du modèle ---------- */

  function renderSelect(stage) {
    stage.innerHTML = `
      <div class="panel shot-preview">
        <img src="${shot.previewUrl}" alt="capture">
        <div class="shot-meta">
          ${shot.gps ? `${UI.icon("pin")} ${shot.gps.lat}, ${shot.gps.lng} (±${shot.gps.acc} m)` : `${UI.icon("warn")} GPS indisponible`}
          · ${UI.icon("clock")} ${UI.fmtDate(Date.now())}
        </div>
        ${shot.flags.length ? `<p class="warn-block">${UI.icon("warn")} ${shot.flags.join(", ")}</p>` : ""}
      </div>

      <div class="panel">
        <div class="panel-head">
          <h2>Quelle voiture ?</h2>
          ${AI.hasKey() ? `<button class="btn btn-small" id="ai-id">${UI.icon("ai")} Identifier avec l'IA</button>` : `<span class="hint">Ajoute une clé Gemini dans Réglages pour l'identification auto</span>`}
        </div>
        <div id="ai-status"></div>
        <input class="input" id="model-search" placeholder="Rechercher un modèle (ex : GT-R, 911, Clio)…" autocomplete="off">
        <div class="model-results" id="model-results"></div>
        <div class="or-sep">ou choisir dans le catalogue</div>
        <div class="pickers">
          <select class="input" id="pick-brand"><option value="">Marque…</option>
            ${CATALOG.map((b) => `<option>${UI.esc(b.brand)}</option>`).join("")}
          </select>
          <select class="input" id="pick-model" disabled><option value="">Modèle…</option></select>
        </div>
        <div id="sel-summary"></div>
        <div class="row-gap">
          <button class="btn" id="retake">Reprendre</button>
          <button class="btn btn-primary" id="confirm" disabled>Valider le spot</button>
        </div>
      </div>`;

    const search = stage.querySelector("#model-search");
    const results = stage.querySelector("#model-results");
    const pickBrand = stage.querySelector("#pick-brand");
    const pickModel = stage.querySelector("#pick-model");
    const confirm = stage.querySelector("#confirm");
    const summary = stage.querySelector("#sel-summary");

    const setSelection = (brand, model) => {
      selection = { brand, model };
      const t = Catalog.modelTier(brand, model);
      summary.innerHTML = `
        <div class="sel-card tier-${t.id}">
          <div class="holo-sheen"></div>
          <div><b>${UI.esc(brand)}</b> ${UI.esc(model)}</div>
          <span class="tier-chip tier-${t.id}">${t.label}</span>
        </div>`;
      confirm.disabled = false;
    };

    search.oninput = () => {
      const hits = Catalog.search(search.value, 18);
      results.innerHTML = hits
        .map((m) => {
          const t = Catalog.tierById[m.tier];
          return `<button class="model-hit tier-${t.id}" data-b="${UI.esc(m.brand)}" data-m="${UI.esc(m.model)}">
            <span>${UI.esc(m.brand)} <b>${UI.esc(m.model)}</b></span>
            <span class="tier-chip tier-${t.id}">${t.short}</span></button>`;
        })
        .join("");
      results.querySelectorAll(".model-hit").forEach((b) => {
        b.onclick = () => setSelection(b.dataset.b, b.dataset.m);
      });
    };

    pickBrand.onchange = () => {
      const b = CATALOG.find((x) => x.brand === pickBrand.value);
      pickModel.disabled = !b;
      pickModel.innerHTML = `<option value="">Modèle…</option>` +
        (b ? Object.keys(b.models).map((m) => `<option>${UI.esc(m)}</option>`).join("") : "");
      pickModel.onchange = () => pickModel.value && setSelection(b.brand, pickModel.value);
    };

    const aiBtn = stage.querySelector("#ai-id");
    if (aiBtn) {
      aiBtn.onclick = async () => {
        aiBtn.disabled = true;
        const status = stage.querySelector("#ai-status");
        status.innerHTML = `<p class="hint">Analyse de la photo par l'IA…</p>`;
        try {
          const r = await AI.identify(shot.blob);
          if (!r) {
            status.innerHTML = `<p class="warn-block">Aucune voiture identifiée — sélection manuelle.</p>`;
          } else {
            status.innerHTML = `<p class="ok-block">${UI.icon("sparkle")} IA : ${UI.esc(r.brand)} ${UI.esc(r.model)}${r.matched ? "" : " (hors catalogue → Commun)"} ${r.confidence != null ? `· confiance ${(r.confidence * 100) | 0}%` : ""}</p>`;
            if (r.matched) {
              setSelection(r.brand, r.matched);
            } else {
              setSelection(r.brand, r.model);
            }
          }
        } catch (e) {
          status.innerHTML = `<p class="warn-block">IA indisponible (${UI.esc(e.message)}) — sélection manuelle.</p>`;
        }
        aiBtn.disabled = false;
      };
    }

    stage.querySelector("#retake").onclick = () => {
      if (shot) URL.revokeObjectURL(shot.previewUrl);
      shot = null; selection = null; phase = "camera";
      renderStage(stage);
    };

    confirm.onclick = () => confirmSpot(stage);
  }

  /* ---------- Étape 3 : sauvegarde + révélation ---------- */

  async function confirmSpot(stage) {
    const spots = Store.getSpots();
    const tier = Catalog.modelTier(selection.brand, selection.model);
    const pts = Scoring.computePoints(selection.brand, selection.model, tier.id, spots);

    const ts = Date.now();
    const photoId = `ph${ts}${Math.floor(Math.random() * 999)}`;
    const digest = await AntiCheat.sha256(
      [Store.ledgerTip || "GENESIS", shot.phash, ts, selection.brand, selection.model].join("|")
    );

    const spot = {
      id: `s${ts}${Math.floor(Math.random() * 999)}`,
      photoId,
      brand: selection.brand,
      model: selection.model,
      tier: tier.id,
      tierRank: tier.rank,
      points: pts.total,
      bonuses: pts.bonuses,
      ts,
      gps: shot.gps,
      meta: shot.meta,
      phash: shot.phash,
      digest,
      flags: shot.flags || [],
    };

    await Photos.put(photoId, shot.blob);
    Store.addSpot(spot);
    const unlocked = Scoring.checkAchievements();

    phase = "reveal";
    shot = { spot, unlocked };
    renderStage(stage);
  }

  function renderReveal(stage) {
    const s = shot.spot;
    const t = Catalog.tierById[s.tier];
    stage.innerHTML = `
      <div class="reveal">
        <div class="reveal-card tier-${t.id}">
          <div class="holo-sheen"></div>
          <img src="" alt="" class="reveal-img" id="reveal-img">
          <div class="reveal-tier">${t.label}</div>
          <div class="reveal-name">${UI.esc(s.brand)} ${UI.esc(s.model)}</div>
          <div class="reveal-pts">+${s.points} pts</div>
          ${s.bonuses.map((b) => `<div class="reveal-bonus">★ ${UI.esc(b.label)} : +${b.pts}</div>`).join("")}
        </div>
        ${(shot.unlocked || []).map((a) => `
          <div class="achv-pop">${a.icon} Palmarès débloqué : <b>${a.name}</b></div>`).join("")}
        <div class="row-gap">
          <a class="btn" href="#/spots/${s.id}">Voir le spot</a>
          <a class="btn btn-primary" href="#/capture">Nouvelle capture</a>
        </div>
      </div>`;
    Photos.url(s.photoId).then((u) => {
      const img = stage.querySelector("#reveal-img");
      if (img && u) img.src = u;
    });
    UI.toast(`+${s.points} pts — ${t.label}`, "ok");
  }

  return { render, destroy };
})();
