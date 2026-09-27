/* ============================================================
   OpenSpotAuto — anti-triche (best effort, 100% local)
   Sans serveur on ne peut pas tout garantir, mais on cumule :
   • capture live obligatoire (aucun import de fichier)
   • détection de vivacité : la scène filmée doit bouger et avoir
     du contraste (contre la photo d'un écran/affiche)
   • hash perceptuel (dHash) : rejet des photos quasi identiques
   • registre chaîné SHA-256 : chaque spot inclut le hash du
     précédent → la falsification/suppression se détecte
   • cohérence GPS : un « saut » > 800 km en < 1 h marque le spot
   • horodatage monotone : reculer l'horloge marque le spot
   • cooldown entre captures
   ============================================================ */

const AntiCheat = (() => {
  /* ---------- dHash 64 bits (différence horizontale, 8x9) ---------- */

  function dHash(sourceCanvas) {
    const w = 9, h = 8;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let bits = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        const g1 = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const g2 = (d[i + 4] + d[i + 5] + d[i + 6]) / 3;
        bits += g1 > g2 ? "1" : "0";
      }
    }
    return bits; // 64 caractères "0"/"1"
  }

  function hamming(a, b) {
    if (!a || !b || a.length !== b.length) return Infinity;
    let n = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
    return n;
  }

  /* ---------- SHA-256 (chaîne du registre) ---------- */

  async function sha256(str) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /* Vérifie la chaîne complète des spots d'un profil. */
  async function verifyLedger(spots) {
    let prev = "GENESIS";
    const broken = [];
    for (const s of spots) {
      const expected = await sha256(
        [prev, s.phash, s.ts, s.brand, s.model].join("|")
      );
      if (s.digest !== expected) broken.push(s.id);
      prev = s.digest || expected;
    }
    return broken;
  }

  /* ---------- Vivacité ----------
     Échantillonne le flux vidéo : moyenne des diffs inter-frames
     + contraste global. Une vraie scène tenue à la main bouge ;
     une photo fixe (écran, print) reste quasi identique. */

  function frameCanvas(video, w = 64) {
    const h = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * w));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(video, 0, 0, w, h);
    return c;
  }

  function frameData(c) {
    return c.getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, c.width, c.height).data;
  }

  function diffPct(a, b) {
    let sum = 0, n = 0;
    for (let i = 0; i < a.length; i += 4) {
      sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      n++;
    }
    return sum / (n * 255 * 3); // 0..1
  }

  function contrast(d) {
    let sum = 0, sq = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] + d[i + 1] + d[i + 2]) / 3;
      sum += g; sq += g * g; n++;
    }
    const mean = sum / n;
    return Math.sqrt(sq / n - mean * mean) / 255; // 0..~0.5
  }

  /* Retourne {diff, contrast} moyens sur `ms` millisecondes. */
  async function sampleLiveness(video, ms = 2200) {
    const frames = [];
    const t0 = performance.now();
    let prev = null;
    while (performance.now() - t0 < ms) {
      const c = frameCanvas(video);
      const data = frameData(c);
      if (prev) frames.push(diffPct(prev, data));
      prev = data;
      await new Promise((r) => setTimeout(r, 180));
    }
    const diff = frames.length
      ? frames.reduce((a, b) => a + b, 0) / frames.length
      : 0;
    return { diff, contrast: contrast(prev || frameData(frameCanvas(video))) };
  }

  /* ---------- Cohérence ---------- */

  function haversineKm(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /* Flags de suspicion sur un nouveau spot. */
  function spotFlags({ ts, gps, phash }, prevSpots) {
    const flags = [];
    const prev = prevSpots[prevSpots.length - 1];

    if (prev && ts < prev.ts) flags.push("horloge-modifiee");

    if (prev && gps && prev.gps) {
      const km = haversineKm(prev.gps, gps);
      const hours = (ts - prev.ts) / 3600000;
      if (hours >= 0 && hours < 1 && km > 800)
        flags.push("teleportation-gps");
    }

    const dup = prevSpots.find((s) => hamming(s.phash, phash) <= 6);
    if (dup) flags.push("photo-dupliquee");

    return flags;
  }

  const DUPLICATE_LIMIT = 6;
  const MIN_DIFF = 0.012;      // ~1.2% de pixels changés en moyenne
  const MIN_CONTRAST = 0.04;   // évite le noir complet / écran blanc

  return {
    dHash, hamming, sha256, verifyLedger,
    sampleLiveness, spotFlags, haversineKm,
    DUPLICATE_LIMIT, MIN_DIFF, MIN_CONTRAST,
  };
})();
